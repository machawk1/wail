const _ = require('lodash')
const DB = require('nedb')
const util = require('util')
const path = require('path')
const Promise = require('bluebird')
const S = require('string')
const cp = require('child_process')
const fp = require('lodash/fp')
const moment = require('moment')
const fs = require('fs-extra')
const DropBox = require('dropbox')
const prettyBytes = require('pretty-bytes')
const through2 = require('through2')
const join = require('joinable')
const streamSort = require('sort-stream2')
const Twit = require('twit')
const jsSearch = require('js-search')
const Rx = require('rxjs/Rx')
const yaml = require('js-yaml')
const ElectronSettings = require('electron-settings')
const normalizeUrl = require('normalize-url')

S.TMPL_OPEN = '{'
S.TMPL_CLOSE = '}'

Promise.promisifyAll(fs)
Promise.promisifyAll(DB.prototype)

// const autoI = cp.fork('/home/john/my-fork-wail/wail-core/autoIndexer/autoIndexer.js')
//
// autoI.on('message', (m) => {
//   console.log(m)
// })
// autoI.send({
//   type: 'init',
//   pywbP: '/home/john/my-fork-wail/bundledApps/pywb',
//   colPs: ['/home/john/Documents/_WAIL_ManagedCollections/collections/default']
// })
//
function isWarcValid (path, mode = 'f') {
  let template
  if (mode === 'f' || mode === 'file') {
    template = '/home/john/my-fork-wail/bundledApps/warcChecker/warcChecker -f {{path}}'
  } else {
    template = '/home/john/my-fork-wail/bundledApps/warcChecker/warcChecker -d {{path}}'
  }
  let exePath = S(template).template({path}).s
  return new Promise((resolve, reject) => {
    cp.exec(exePath, (error, stdout, stderr) => {
      if (error) {
        return reject(new Error('executing'))
      } else {
        let validity
        try {
          validity = JSON.parse(stdout)
        } catch (e) {
          return reject(e)
        }
        resolve(validity)
      }
    })
  })
}

const nrReadDir = (dir, addSuffix) => new Promise((resolve, reject) => {
  fs.readdir(dir, (err, stuff) => {
    if (err) {
      resolve({wasError: true, value: err})
    } else {
      if (addSuffix) {
        resolve({wasError: false, value: stuff.map(it => path.join(dir, it, addSuffix))})
      } else {
        resolve({wasError: false, value: stuff.map(it => path.join(dir, it))})
      }
    }
  })
})

const readDir = (dir, addSuffix) => new Promise((resolve, reject) => {
  fs.readdir(dir, (err, stuff) => {
    if (err) {
      reject(err)
    } else {
      if (addSuffix) {
        resolve(stuff.map(it => path.join(dir, it, addSuffix)))
      } else {
        resolve(stuff.map(it => path.join(dir, it)))
      }
    }
  })
})

const bPath = '/home/john/Documents/WAIL_ManagedCollections'

const asyncTry = async (fun, args = []) => {
  try {
    return {wasError: false, value: await fun.apply(null, args)}
  } catch (e) {
    return {wasError: true, value: e}
  }
}

const asyncTryNamed = async (returnName, fun, args = []) => {
  try {
    return {wasError: false, [returnName]: await fun.apply(null, args)}
  } catch (e) {
    return {wasError: true, [returnName]: e}
  }
}

const checkWarcs = async () => {
  const tryCols = await asyncTry(readDir, [bPath, 'archive'])
  if (!tryCols.wasError) {
    let it = await Promise.map(tryCols.value, col => asyncTry(isWarcValid, [col, 'd']))
    let bad = []
    it.forEach(({wasError, value}) => {
      if (!wasError) {
        if (value.length) {
          bad = bad.concat(value)
        }
      } else {
        console.error(value)
      }
    })
    return bad
  }
}

const warcRenamer = badWarc =>
  new Promise((resolve, reject) => {
    let newName = `${badWarc.filep}.invalid`
    fs.rename(badWarc.filep, newName, err => {
      if (err) {
        return resolve({wasError: true, value: err})
      }
      badWarc.filep = newName
      resolve(badWarc)
    })
  })

function renameBadWarcs (badWarcs) {
  if (Array.isArray(badWarcs)) {
    return Promise.map(badWarcs, warcRenamer, {concurrency: 1})
  }
  return warcRenamer(badWarcs)
}

const cleanSeeds = seeds =>
  seeds.map(seed => {
    delete seed._id
    delete seed.forCol
    return seed
  })

const transformSeeds = seedDocs =>
  _.chain(seedDocs)
    .groupBy(seed => seed.forCol)
    .mapValues(cleanSeeds)
    .value()

const joinColsSeeds = (cols, cSeeds) => {
  let colSeeds = transformSeeds(cSeeds)
  return cols.map(col => {
    if (colSeeds[col.colName]) {
      col.seeds = colSeeds[col.colName]
    } else {
      col.seeds = []
    }
    return col
  })
}

const moveStartingCol = new Promise((resolve, reject) => {
  resolve()
})

const checkPathExists = (path) => new Promise((resolve, reject) => {
  fs.access(path, fs.constants.R_OK, err => {
    resolve(!err)
  })
})

const checkCollDirExistence2 = () => new Promise((resolve) => {
  fs.stat(bPath, (err, stats) => {
    if (err) {
      resolve({wasError: true, didNotExist: 'warcs'})
    } else {
      fs.stat(path.join(bPath, 'collections'), (err2, stats) => {
        if (err2) {
          resolve({wasError: true, didNotExist: 'collections'})
        } else {
          resolve({wasError: false})
        }
      })
    }
  })
})

class ColDirExistsError extends Error {
  constructor (didNotExist) {
    super(`ColDirExistsError[${where}]`)
    Object.defineProperty(this, 'name', {
      value: this.constructor.name
    })
    this.didNotExist = didNotExist
  }
}

const nrCheckCollDirExistence = () => new Promise((resolve, reject) => {
  fs.access(bPath, fs.constants.R_OK, err => {
    if (err) {
      resolve({wasError: true, didNotExist: 'warcs'})
    } else {
      fs.access(path.join(bPath, 'collections'), fs.constants.R_OK, err2 => {
        if (err2) {
          resolve({wasError: true, didNotExist: 'collections'})
        } else {
          resolve({wasError: false})
        }
      })
    }
  })
})

const checkCollDirExistence = () => new Promise((resolve, reject) => {
  fs.access(bPath, fs.constants.R_OK, err => {
    if (err) {
      reject(new ColDirExistsError('warcs'))
    } else {
      fs.access(path.join(bPath, 'collections'), fs.constants.R_OK, err2 => {
        if (err2) {
          reject(new ColDirExistsError('collections'))
        } else {
          resolve()
        }
      })
    }
  })
})

const checkWarDir = () => new Promise((resolve, reject) => {
  fs.stat(bPath, (err, stats) => {
    if (err) {
      resolve(false)
    } else {
      resolve(true)
    }
  })
})

const transSeeds = fp.flow(
  fp.groupBy('forCol'),
  fp.mapValues(cleanSeeds)
)

const getFsStats = toStatPath => new Promise((resolve, reject) => {
  fs.stat(toStatPath, (err, stats) => {
    if (err) {
      reject(err)
    } else {
      resolve(stats)
    }
  })
})

const getColSize = (pathToWarcs) => {
  return new Promise((resolve, reject) => {
    let size = 0
    fs.walk(pathToWarcs)
      .pipe(through2.obj(function (item, enc, next) {
        if (!item.stats.isDirectory()) this.push(item)
        next()
      }))
      .on('data', item => {
        size += item.stats.size
      })
      .on('end', () => {
        resolve(prettyBytes(size))
      })
  })
}

class EnsureColDirError extends Error {
  constructor (oError, where) {
    super(`EnsureColDir[${where}]`)
    Object.defineProperty(this, 'name', {
      value: this.constructor.name
    })
    this.oError = oError
    this.where = where
  }
}

class YamlError extends Error {
  constructor (oError, where) {
    super(`YamlError[${where}]`)
    Object.defineProperty(this, 'name', {
      value: this.constructor.name
    })
    this.oError = oError
    this.where = where
  }
}

const readYaml = yamlPath => new Promise((resolve, reject) => {
  fs.readFile(yamlPath, 'utf8', (err, yamlString) => {
    if (err) {
      reject(new YamlError(err, 'reading'))
    } else {
      try {
        const doc = yaml.safeLoad(yamlString)
        resolve(doc)
      } catch (errLoad) {
        reject(new YamlError(errLoad, 'parsing'))
      }
    }
  })
})

const writeYaml = (yamlPath, obj) => new Promise((resolve, reject) => {
  try {
    const dumped = yaml.dump(obj, {flowLevel: 3})
    fs.writeFile(yamlPath, dumped, 'utf8', errW => {
      if (errW) {
        reject(new YamlError(errW, 'writing'))
      } else {
        resolve()
      }
    })
  } catch (errDump) {
    reject(new YamlError(errDump, 'converting'))
  }
})

const getYamlOrWriteIfAbsent = async (yamlPath, obj) => {
  let yamlData
  try {
    yamlData = await readYaml(yamlPath)
  } catch (yamlError) {
    yamlData = obj
    try {
      await writeYaml(yamlPath, yamlData)
    } catch (writeError) {
      throw writeError
    }
  }
  return yamlData
}

const settings = new ElectronSettings({configDirPath: '/home/john/my-fork-wail/wail-config/wail-settings'})
class PyWb {
  // static defaultExeArgs = {cwd: settings.get('warcs')}

  static addMetadata (templateArgs, exeArgs = PyWb.defaultExeArgs) {
    return new Promise((resolve, reject) => {
      let exec = S(settings.get('pywb.addMetadata')).template(templateArgs).s
      cp.exec(exec, exeArgs, (error, stdout, stderr) => {
        if (error) {
          console.error(stderr)
          return reject(error)
        } else {
          resolve({stdout, stderr})
        }
      })
    })
  }

  static reindexCol (templateArgs, exeArgs = PyWb.defaultExeArgs) {
    return new Promise((resolve, reject) => {
      let exec = S(settings.get('pywb.reindexCol')).template(templateArgs).s
      cp.exec(exec, exeArgs, (error, stdout, stderr) => {
        if (error) {
          console.error(stderr)
          return reject(error)
        } else {
          resolve({stdout, stderr})
        }
      })
    })
  }

  static addWarcsToCol (templateArgs, exeArgs = PyWb.defaultExeArgs) {
    return new Promise((resolve, reject) => {
      let exec = S(settings.get('pywb.addWarcsToCol')).template(templateArgs).s
      cp.exec(exec, exeArgs, (error, stdout, stderr) => {
        if (error) {
          console.error(stderr)
          return reject(error)
        } else {
          let c1 = ((stdout || ' ').match(/INFO/g) || []).length
          let c2 = ((stderr || ' ').match(/INFO/g) || []).length
          resolve(c1 === 0 ? c2 : c1)
        }
      })
    })
  }

  static createCol (templateArgs, exeArgs = PyWb.defaultExeArgs) {
    return new Promise((resolve, reject) => {
      let exec = S(settings.get('pywb.newCollection')).template(templateArgs).s
      cp.exec(exec, exeArgs, (error, stdout, stderr) => {
        if (error) {
          console.error(stderr)
          return reject(error)
        } else {
          resolve({stdout, stderr})
        }
      })
    })
  }

}

class DataStoreError extends Error {
  constructor (oError, where) {
    super(`DataStoreError[${where}]`)
    Object.defineProperty(this, 'name', {
      value: this.constructor.name
    })
    this.oError = oError
    this.where = where
    Error.captureStackTrace(this, DataStoreError)
  }

  withExtraInfo (extra) {
    this.extra = extra
  }
}

class DataStore {
  constructor (opts) {
    this.humanName = opts.dbHumanName || path.basename(opts.filename, '.db')
    if (opts.dbHumanName) {
      delete opts.dbHumanName
    }
    this.db = new DB(opts)
    this.filePath = opts.filename
  }

  loadDb () {
    return new Promise((resolve, reject) => {
      this.db.loadDatabase(err => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }

  backUp () {
    const backUpTime = new Date().getTime()
    const backUpName = `${this.filePath}.${backUpTime}.bk`
    return new Promise((resolve, reject) => {
      fs.copy(this.filePath, backUpName, (err) => {
        if (err) {
          reject(new DataStoreError(err, `backing up ${this.humanName}`))
        } else {
          resolve(backUpName)
        }
      })
    })
  }

  clearDb () {
    return this.remove({}, {multi: true})
  }

  backUpClearDb () {
    const backUpTime = new Date().getTime()
    const backUpName = `${this.filePath}.${backUpTime}.bk`
    return new Promise((resolve, reject) => {
      fs.copy(this.filePath, backUpName, (err) => {
        if (err) {
          reject(new DataStoreError(err, 'backing up'))
        } else {
          return this.clearDb().then(() => {resolve(backUpName)})
            .catch(error => {
                const dbErr = new DataStoreError(error, 'clear failed')
                dbErr.withExtraInfo(backUpName)
                reject(dbErr)
              }
            )
        }
      })
    })

  }

  backUpHardClearDb () {
    const backUpTime = new Date().getTime()
    const backUpName = `${this.filePath}.${backUpTime}.bk`
    return new Promise((resolve, reject) => {
      fs.copy(this.filePath, backUpName, (err) => {
        if (err) {
          reject(new DataStoreError(err, 'backing up'))
        } else {
          return removeFile(this.filePath)
            .then(() => {resolve(backUpName)})
            .catch(errm => {
              const dbErr = new DataStoreError(errm, 'hard clear failed')
              dbErr.withExtraInfo(backUpName)
              reject(dbErr)
            })
        }
      })
    })

  }

  nrUpdate (updateWho, theUpdate, opts = {}) {
    return new Promise((resolve, reject) => {
      this.db.update(updateWho, theUpdate, opts, (err, numAffected, affectedDocuments, upsert) => {
        if (err) {
          resolve({wasError: true, value: err})
        } else {
          resolve({wasError: false, value: {numAffected, affectedDocuments, upsert}})
        }
      })
    })
  }

  update (updateWho, theUpdate, opts = {}) {
    return new Promise((resolve, reject) => {
      this.db.update(updateWho, theUpdate, opts, (err, numAffected, affectedDocuments, upsert) => {
        if (err) {
          reject(err)
        } else {
          resolve({numAffected, affectedDocuments, upsert})
        }
      })
    })
  }

  updateFindAll (updateWho, theUpdate, upOpts, findQ) {
    return new Promise((resolve, reject) => {
      this.db.update(updateWho, theUpdate, upOpts, (err, numAffected, affectedDocuments, upsert) => {
        if (err) {
          reject(err)
        } else {
          this.db.find(findQ, (errF, docs) => {
            if (errF) {
              reject(errF)
            } else {
              resolve(docs)
            }
          })
        }
      })
    })
  }

  insertFindAll (insertMe, findQ) {
    return new Promise((resolve, reject) => {
      this.db.insert(insertMe, (err, docs) => {
        if (err) {
          reject(err)
        } else {
          this.db.find(findQ, (errF, all) => {
            if (errF) {
              reject(errF)
            } else {
              resolve(all)
            }
          })
        }
      })
    })
  }

  getAll () {
    return this.find({})
  }

  nrGetAll () {
    return this.nrFind({})
  }

  getAllGrouped (by) {
    return this.find({}).then(all => _.groupBy(all, by))
  }

  getAllApplyFun (fun) {
    return this.find({}).then(all => fun(all))
  }

  async getAllCheckExists (prop) {
    let docs, existCheck = {exist: [], empty: false, doNotExist: []}
    try {
      docs = await this.find({})
    } catch (e) {
      throw new DataStoreError(e, `finding ${this.humanName}`)
    }
    if (docs.length === 0) {
      existCheck.empty = true
      return existCheck
    } else {
      let len = docs.length, i = 0
      for (; i < len; ++i) {
        if (await checkPathExists(docs[i][prop])) {
          existCheck.exist.push(docs[i])
        } else {
          existCheck.doNotExist.push(docs[i])
        }
      }
      return existCheck
    }
  }

  async nrGetAllCheckExists (prop) {
    let docs, existCheck = {exist: [], empty: false, doNotExist: []}
    try {
      docs = await this.find({})
    } catch (e) {
      return {wasError: true, value: new DataStoreError(e, `finding ${this.humanName}`)}
    }
    if (docs.length === 0) {
      existCheck.empty = true
      return {wasError: false, value: existCheck}
    } else {
      let len = docs.length, i = 0
      for (; i < len; ++i) {
        if (await checkPathExists(docs[i][prop])) {
          existCheck.exist.push(docs[i])
        } else {
          existCheck.doNotExist.push(docs[i])
        }
      }
      return {wasError: false, value: existCheck}
    }
  }

  find (query) {
    return new Promise((resolve, reject) => {
      this.db.find(query, (err, docs) => {
        if (err) {
          reject(err)
        } else {
          resolve(docs)
        }
      })
    })
  }

  nrFind (query) {
    return new Promise((resolve, reject) => {
      this.db.find(query, (err, doc) => {
        if (err) {
          resolve({wasError: true, value: err})
        } else {
          resolve({wasError: false, value: doc})
        }
      })
    })
  }

  nrFindSelect (query, select) {
    return new Promise((resolve, reject) => {
      this.db.find(query, select, (err, docs) => {
        if (err) {
          resolve({wasError: true, value: err})
        } else {
          resolve({wasError: false, value: docs})
        }
      })
    })
  }

  findSelect (query, select) {
    return new Promise((resolve, reject) => {
      this.db.find(query, select, (err, docs) => {
        if (err) {
          reject(err)
        } else {
          resolve(docs)
        }
      })
    })
  }

  nrFindOne (query) {
    return new Promise((resolve, reject) => {
      this.db.findOne(query, (err, doc) => {
        if (err) {
          resolve({wasError: true, value: err})
        } else {
          resolve({wasError: false, value: doc})
        }
      })
    })
  }

  findOne (query) {
    return new Promise((resolve, reject) => {
      this.db.findOne(query, (err, doc) => {
        if (err) {
          reject(err)
        } else {
          resolve(doc)
        }
      })
    })
  }

  nrFindOneSelect (query, select) {
    return new Promise((resolve, reject) => {
      this.db.findOne(query, select, (err, docs) => {
        if (err) {
          resolve({wasError: true, value: err})
        } else {
          resolve({wasError: false, value: docs})
        }
      })
    })
  }

  findOneSelect (query, select) {
    return new Promise((resolve, reject) => {
      this.db.findOne(query, select, (err, docs) => {
        if (err) {
          reject(err)
        } else {
          resolve(docs)
        }
      })
    })
  }

  nrInsert (insertMe) {
    return new Promise((resolve, reject) => {
      this.db.insert(insertMe, (err, docs) => {
        if (err) {
          resolve({wasError: true, value: err})
        } else {
          resolve({wasError: false, value: docs})
        }
      })
    })
  }

  insert (insertMe) {
    return new Promise((resolve, reject) => {
      this.db.insert(insertMe, (err, docs) => {
        if (err) {
          reject(err)
        } else {
          resolve(docs)
        }
      })
    })
  }

  nrCount (what) {
    return new Promise((resolve, reject) => {
      this.db.count(what, (err, count) => {
        if (err) {
          resolve({wasError: true, value: err})
        } else {
          resolve({wasError: false, value: count})
        }
      })
    })
  }

  count (what) {
    return new Promise((resolve, reject) => {
      this.db.count(what, (err, count) => {
        if (err) {
          reject(err)
        } else {
          resolve(count)
        }
      })
    })
  }

  remove (query, opts = {}) {
    return new Promise((resolve, reject) => {
      this.db.remove(query, opts, (err, rmc) => {
        if (err) {
          reject(err)
        } else {
          resolve(rmc)
        }
      })
    })
  }

  nrRemove (query, opts = {}) {
    return new Promise((resolve) => {
      this.db.remove(query, opts, (err, rmc) => {
        resolve({wasError: false, value: rmc})
      })
    })
  }
}

const backupDbInsert = async (dbPath, name, insert) => {
  const filepath = path.join(dbPath, `${name}.${new Date().getTime()}.db`)
  const bk = new DataStore({autoload: true, filepath})
  const didInsert = await bk.nrInsert(insert)
  return {bkupName: filepath, didInsert}
}

const removeFile = filePath => new Promise((resolve, reject) => {
  fs.remove(filePath, err => {
    if (err) {
      reject(err)
    } else {
      resolve()
    }
  })
})

const execute = (exec, opts) => new Promise((resolve, reject) => {
  resolve()
})

const updateSingleOpts = {
  returnUpdatedDocs: true,
  multi: false
}

class ColSeedsDb {

  static foundSeedChecker (colSeeds) {
    if (colSeeds) {
      if (Array.isArray(colSeeds)) {
        return colSeeds.length > 0
      } else {
        return true
      }
    } else {
      return false
    }
  }

  static getColSize (pathToWarcs) {
    if (_.isObject(pathToWarcs)) {
      pathToWarcs = S(settings.get('collections.colWarcs')).template(pathToWarcs).s
    }
    return new Promise((resolve, reject) => {
      let size = 0
      fs.walk(pathToWarcs)
        .pipe(through2.obj(function (item, enc, next) {
          if (!item.stats.isDirectory()) this.push(item)
          next()
        }))
        .on('data', item => {
          size += item.stats.size
        })
        .on('end', () => {
          resolve(prettyBytes(size))
        })
    })
  }

  static ensureColDirs (colPath, which) {
    return new Promise((resolve, reject) => {
      if (which === 'both') {
        fs.ensureDir(path.join(colPath, 'archive'), errA => {
          if (errA) {
            reject(new EnsureColDirError(errA, 'archive'))
          } else {
            fs.ensureFile(path.join(colPath, 'indexes', 'index.cdxj'), errI => {
              if (errI) {
                reject(new EnsureColDirError(errI, 'index'))
              } else {
                resolve()
              }
            })
          }
        })
      } else if (which === 'index') {
        fs.ensureFile(path.join(colPath, 'indexes', 'index.cdxj'), errI => {
          if (errI) {
            reject(new EnsureColDirError(errI, 'index'))
          } else {
            resolve()
          }
        })
      } else {
        fs.ensureDir(path.join(colPath, 'archive'), errA => {
          if (errA) {
            reject(new EnsureColDirError(errA, 'archive'))
          } else {
            resolve()
          }
        })
      }
    })
  }

  constructor (colOpts, seedOpts) {
    this._collections = new DataStore(colOpts)
    this._colSeeds = new DataStore(seedOpts)
  }

  async _handleTrackedNotExisting (cols, seeds) {
    const collsNotExisting = new DataStore({
      autoload: true,
      filename: `${new Date().getTime()}.trackedCollectionsNoLongerExisting.db`
    })
    const seedsNotExisting = new DataStore({
      autoload: true,
      filename: `${new Date().getTime()}.trackedSeedsNoLongerExisting.db`
    })
    await collsNotExisting.insert(cols)
    const colNamesWhoNoExist = []
    let seedWhoNoExist = []
    const removeFromExisting = cols.map(col => {
      colNamesWhoNoExist.push(col.name)
      seedWhoNoExist = seedWhoNoExist.concat(seeds[col.name])
      return {_id: col._id}
    })
    await seedsNotExisting.insert(seedWhoNoExist)
    await this._collections.remove(removeFromExisting, {multi: true})
    await this._colSeeds.remove(seedWhoNoExist.map(s => ({_id: s._id})), {multi: true})
  }

  async _handleAllTrackedNotExisting (cols, seeds) {
    const tempDb = new DataStore({
      autoload: true,
      filename: `${new Date().getTime()}.trackedCollectionsNoLongerExisting.db`
    })
    const insertGood = await tempDb.insert(cols)
    if (!insertGood.wasError) {
      const colNamesWhoNoExist = []
      const removeFromExisting = cols.map(col => {
        colNamesWhoNoExist.push(col.name)
        return {_id: col._id}
      })
      this._collections.remove(removeFromExisting, {multi: true})
    }
    return
  }

  async _handleColDirNoExistence (errExist) {
    let cols = await this._collections.getAll()
    let seeds = await this._colSeeds.getAll()
    if (cols.length !== 0 || seeds.length !== 0) {
      // this is not the first time for all intents and purposes
      let seedsBackup = await this._colSeeds.backUpClearDb()
      let colsBackup = await this._collections.backUpClearDb()
      //handle backup
    }
    return await this.createDefaultCol()
  }

  async _colFromSeedsColDirExists (colPath, col, seeds) {
    const aColStats = await getFsStats(colPath)
    const colCreateTime = moment(aColStats.birthtime)
    let colLastUpdated
    if (seeds.length > 0) {
      moment.max(seeds.map(s => moment(s.lastUpdated)))
    } else {
      colLastUpdated = moment().format()
    }
    let colSize = '0 B', ensures = 'index'
    const colWarcP = path.join(colPath, 'archive')
    if (await checkPathExists(colWarcP)) {
      colSize = await getColSize(colWarcP)
    } else {
      ensures = 'both'
    }
    try {
      await ColSeedsDb.ensureColDirs(colPath, ensures)
    } catch (ensureError) {
      console.error(ensureError)
    }
    let backUpMdata = {description: `Recreated by WAIL after found to be not existing`, title: col}
    let metadata
    try {
      metadata = await getYamlOrWriteIfAbsent(path.join(colPath, 'metadata.yaml'), backUpMdata)
    } catch (getYamlError) {
      backUpMdata.description = `${backUpMdata.description} but could not create file on disk.`
    }
    return {
      _id: col, name: col, colPath, size: colSize, lastUpdated: colLastUpdated.format(),
      created: colCreateTime.format(), numArchives: seeds.length, archive: path.join(colWarcP, 'archive'),
      indexes: path.join(colWarcP, 'indexes'), hasRunningCrawl: false, metadata
    }
  }

  async _colFromSeedsNoColDir (colPath, col, seeds) {
    let createdFailed = false, createError = null
    try {
      await createCol(col)
    } catch (createFailed) {
      createdFailed = true
    }
    if (createdFailed) {
      try {
        await ColSeedsDb.ensureColDirs(colPath, 'both')
      } catch (ensureFailed) {
        createError = ensureFailed
      }
    }
    if (createdFailed) {
      throw createError
    }
    const colCreateTime = moment().format()
    let colLastUpdated
    if (seeds.length > 0) {
      moment.max(seeds.map(s => moment(s.lastUpdated)))
    } else {
      colLastUpdated = colCreateTime
    }
    let colSize = '0 B'
    const colWarcP = path.join(colPath, 'archive')
    let metadata = {description: `Recreated by WAIL after found to be not existing`, title: col}
    try {
      await writeYaml(path.join(colPath, 'metadata.yaml'), metadata)
    } catch (writeError) {
      metadata.description = `${metadata.description} but could not create file on disk.`
    }
    return {
      _id: col, name: col, colPath, size: colSize, lastUpdated: colLastUpdated.format(),
      created: colCreateTime.format(), numArchives: seeds.length, archive: path.join(colWarcP, 'archive'),
      indexes: path.join(colWarcP, 'indexes'), hasRunningCrawl: false, metadata
    }
  }

  async _recreateColsFromSeeds (seeds) {
    const collectionsPath = path.join(bPath, 'collections')
    let recreatedCols = []
    for (const col of Object.keys(seeds)) {
      const colPath = path.join(collectionsPath, col)
      let recreatedCol
      if (await checkPathExists(colPath)) {
        recreatedCol = await this._colFromSeedsColDirExists(colPath, col, seeds[col])
      } else {
        recreatedCol = await this._colFromSeedsNoColDir(colPath, col, seeds[col])
      }
      recreatedCols.push(recreatedCol)
    }
    return recreatedCols
  }

  async getAllCollections () {
    try {
      await checkCollDirExistence()
    } catch (noExist) {
      console.log('no exist')
      return await this._handleColDirNoExistence(noExist)
    }
    // WAIL_ManagedCollections && WAIL_ManagedCollections/collections exist check cols
    let colSeeds, colsExistCheck
    try {
      colsExistCheck = await this._collections.getAllCheckExists('colpath')
    } catch (errFind) {
      throw errFind
    }

    try {
      colSeeds = await this._colSeeds.getAll()
    } catch (errSeedFind) {
      throw new DataStoreError(errSeedFind, 'finding seeds')
    }

    let {exist, empty, doNotExist} = colsExistCheck

    if (!empty) {
      colSeeds = transSeeds(colSeeds)
      if (doNotExist.length === 0) {
        return exist.map(col => {
          col.seeds = colSeeds[col.name] || []
          return col
        })
      } else {
        await this._handleTrackedNotExisting(doNotExist, colSeeds)
        return exist.map(col => {
          col.seeds = colSeeds[col.name] || []
          return col
        })
      }
    } else {
      const colDir = await readDir(path.join(bPath, 'collections'))
      if (colDir.length === 0) {
        return await this.createDefaultCol()
      } else {
        return await this.createDefaultCol(true)
      }
    }

  }

  async addCrawlInfo (confDetails) {
    let {forCol, lastUpdated, seed} = confDetails
    let colSeedIdQ = {_id: `${forCol}-${seed.url}`}
    let updateWho = {colName: forCol}
    console.log('addCrawlInfo', confDetails)
    let theUpdateCol = {$set: {lastUpdated}}
    let findA = {
      $where () {
        return this.forCol === forCol
      }
    }
    const updatedCol = await this._collections.update(updateWho, theUpdateCol, updateSingleOpts)
    let existingSeed = await this._colSeeds.findOne(colSeedIdQ)
    if (ColSeedsDb.foundSeedChecker(existingSeed)) {
      let theUpdateColSeed = {
        $set: {lastUpdated}
      }
      if (!existingSeed.jobIds.includes(seed.jobId)) {
        theUpdateColSeed.$push = {jobIds: seed.jobId}
      }
      let updatedColSeeds = await this._collections.updateFindAll(colSeedIdQ, theUpdateColSeed, updateSingleOpts, findA)
      updatedCol.seeds = cleanSeeds(Array.isArray(updatedColSeeds) ? updatedColSeeds : [updatedColSeeds])
      console.log(updatedCol)
      return {
        colName: updatedCol.colName,
        numArchives: updatedCol.numArchives,
        size: updatedCol.size,
        seeds: updatedCol.seeds,
        lastUpdated: updatedCol.lastUpdated
      }
    } else {
      seed._id = colSeedIdQ._id
      let colSeeds = await this._colSeeds.insertFindAll(seed, findA)
      updatedCol.seeds = cleanSeeds(Array.isArray(colSeeds) ? colSeeds : [colSeeds])
      console.log(updatedCol)
      return {
        colName: updatedCol.colName,
        numArchives: updatedCol.numArchives,
        size: updatedCol.size,
        seeds: updatedCol.seeds,
        lastUpdated: updatedCol.lastUpdated
      }
    }
  }

  async addInitialMData (col, mdata) {
    return await PyWb.addMetadata({col, metadata: join(...mdata)})
  }

  async addWarcsFromWCreate ({col, warcs, lastUpdated, seed}) {
    const templateArgs = {col}
    try {
      await PyWb.reindexCol(templateArgs)
    } catch (reindexError) {
      throw reindexError
    }
    const updateWho = {colName: col}, colSeedIdQ = {_id: `${col}-${seed.url}`}
    const findA = {$where () { return this.forCol === col }}
    const size = await ColSeedsDb.getColSize(templateArgs)
    const theUpdateCol = {$inc: {numArchives: 1}, $set: {size, lastUpdated}}
    let updatedCol, colSeed, colSeeds
    try {
      updatedCol = await this._collections.update(updateWho, theUpdateCol, updateSingleOpts)
    } catch (updateError) {

    }
    try {
      colSeed = await this._colSeeds.findOne(colSeedIdQ)
    } catch (findError) {

    }
    if (ColSeedsDb.foundSeedChecker(colSeed)) {
      let theUpdateColSeed = {
        $set: {lastUpdated},
        $inc: {mementos: 1}
      }
      if (!colSeed.jobIds.includes(seed.jobId)) {
        theUpdateColSeed.$push = {jobIds: seed.jobId}
      }
      colSeeds = await this._colSeeds.updateFindAll(colSeedIdQ, theUpdateColSeed, updateSingleOpts, findA)
    } else {
      seed._id = colSeedIdQ._id
      seed.mementos = 1
      seed.jobIds = [seed.jobId]
      colSeeds = await this._colSeeds.insertFindAll(seed, findA)
    }
    updatedCol.seeds = cleanSeeds(Array.isArray(colSeeds) ? colSeeds : [colSeeds])
    return {
      colName: updatedCol.colName,
      numArchives: updatedCol.numArchives,
      size: updatedCol.size,
      seeds: updatedCol.seeds,
      lastUpdated: updatedCol.lastUpdated
    }
  }

  async addWarcsFromFSToCol ({col, warcs, lastUpdated, seed}) {
    let addedCount
    try {
      addedCount = await PyWb.addWarcsToCol({col, warcs})
    } catch (addError) {

    }
    let updateWho = {colName: col}, colSeedIdQ = {_id: `${col}-${seed.url}`}
    const findA = {$where () { return this.forCol === col}}
    const size = await ColSeedsDb.getColSize({col})
    const theUpdateCol = {$inc: {numArchives: addedCount}, $set: {size, lastUpdated}}
    let updatedCol
    try {
      updatedCol = await this._collections.update(updateWho, theUpdateCol, updateSingleOpts)
    } catch (updateError) {

    }
    let colSeed
    try {
      colSeed = await this._colSeeds.findOne(colSeedIdQ)
    } catch (findError) {

    }
    let colSeeds
    if (ColSeedsDb.foundSeedChecker(colSeed)) {
      let theUpdateColSeed = {
        $set: {lastUpdated},
        $inc: {mementos: 1}
      }
      if (!colSeed.jobIds.includes(seed.jobId)) {
        theUpdateColSeed.$push = {jobIds: seed.jobId}
      }
      colSeeds = await this._colSeeds.updateFindAll(colSeedIdQ, theUpdateColSeed, updateSingleOpts, findA)
    } else {
      seed._id = colSeedIdQ._id
      seed.mementos = 1
      seed.jobIds = [seed.jobId]
      colSeeds = await this._colSeeds.insertFindAll(seed, findA)
    }
    updatedCol.seeds = cleanSeeds(Array.isArray(colSeeds) ? colSeeds : [colSeeds])
    return {
      colName: updatedCol.colName,
      numArchives: updatedCol.numArchives,
      size: updatedCol.size,
      seeds: updatedCol.seeds,
      lastUpdated: updatedCol.lastUpdated
    }
  }

  async addWarcsToCol ({col, warcs, lastUpdated, seed}) {
    let addedCount
    try {
      addedCount = await PyWb.addWarcsToCol({col, warcs})
    } catch (addError) {

    }
    let updateWho = {colName: col}, colSeedIdQ = {_id: `${col}-${seed.url}`}
    const findA = {$where () { return this.forCol === col}}
    const size = await ColSeedsDb.getColSize({col})
    const theUpdateCol = {$inc: {numArchives: addedCount}, $set: {size, lastUpdated}}
    let updatedCol
    try {
      updatedCol = await this._collections.update(updateWho, theUpdateCol, updateSingleOpts)
    } catch (updateError) {

    }
    let colSeed
    try {
      colSeed = await this._colSeeds.findOne(colSeedIdQ)
    } catch (findError) {

    }
    let colSeeds
    if (ColSeedsDb.foundSeedChecker(colSeed)) {
      let theUpdateColSeed = {
        $set: {lastUpdated},
        $inc: {mementos: 1}
      }
      if (!colSeed.jobIds.includes(seed.jobId)) {
        theUpdateColSeed.$push = {jobIds: seed.jobId}
      }
      colSeeds = await this._colSeeds.updateFindAll(colSeedIdQ, theUpdateColSeed, updateSingleOpts, findA)
    } else {
      seed._id = colSeedIdQ._id
      seed.mementos = 1
      seed.jobIds = [seed.jobId]
      colSeeds = await this._colSeeds.insertFindAll(seed, findA)
    }
    updatedCol.seeds = cleanSeeds(Array.isArray(colSeeds) ? colSeeds : [colSeeds])
    return {
      colName: updatedCol.colName,
      numArchives: updatedCol.numArchives,
      size: updatedCol.size,
      seeds: updatedCol.seeds,
      lastUpdated: updatedCol.lastUpdated
    }
  }

  async createCollection (ncol) {
    let {col, metadata} = ncol
    try {
      await PyWb.createCol({col})
    } catch (createError) {

    }
    let colpath = path.join(settings.get('warcs'), 'collections', col), created = moment().format()
    try {
      await ColSeedsDb.ensureColDirs(colpath, 'index')
    } catch (ensureError) {

    }
    let toCreate = {
      _id: col, name: col, colpath, created,
      size: '0 B', lastUpdated: created,
      archive: path.join(colpath, 'archive'),
      indexes: path.join(colpath, 'indexes'),
      colName: col, numArchives: 0, metadata,
      hasRunningCrawl: false
    }

    let newCol
    try {
      newCol = await this._collections.insert(toCreate)
    } catch (insertError) {

    }
    return {
      seeds: [],
      ...newCol
    }

  }

  async createDefaultCol (ensure = false) {
    let colpath = path.join(settings.get('warcs'), 'collections', 'default')
    let created = moment().format()
    let toCreate = {
      _id: 'default',
      name: 'default',
      colpath,
      archive: path.join(colpath, 'archive'),
      indexes: path.join(colpath, 'indexes'),
      colName: 'default',
      numArchives: 0,
      metadata: {title: 'Default', description: 'Default Collection'},
      size: '0 B',
      created,
      lastUpdated: created,
      hasRunningCrawl: false
    }
    if (!ensure) {
      await execute('', {})
    } else {
      await ColSeedsDb.ensureColDirs(colpath, 'both')
    }
    const newCol = await this._collections.insert(toCreate)
    newCol.seeds = []
    return newCol
  }
}

const colDb = new DataStore({autoload: true, filename: 'home/john/my-fork-wail/wail-config/database/archives.db'})
const colSeedsDb = new DataStore({
  autoload: true,
  filename: '/home/john/my-fork-wail/wail-config/database/archiveSeeds.db'
})

const ensureColDirs = (colPath, which) => {
  return new Promise((resolve, reject) => {
    if (which === 'both') {
      fs.ensureDir(path.join(colPath, 'archive'), errA => {
        if (errA) {
          reject(new EnsureColDirError(errA, 'archive'))
        } else {
          fs.ensureFile(path.join(colPath, 'indexes', 'index.cdxj'), errI => {
            if (errI) {
              reject(new EnsureColDirError(errI, 'index'))
            } else {
              resolve()
            }
          })
        }
      })
    } else if (which === 'index') {
      fs.ensureFile(path.join(colPath, 'indexes', 'index.cdxj'), errI => {
        if (errI) {
          reject(new EnsureColDirError(errI, 'index'))
        } else {
          resolve()
        }
      })
    } else {
      fs.ensureDir(path.join(colPath, 'archive'), errA => {
        if (errA) {
          reject(new EnsureColDirError(errA, 'archive'))
        } else {
          resolve()
        }
      })
    }
  })
}

const colFromSeedsColDirExists = async (colPath, col, seeds) => {
  const aColStats = await getFsStats(colPath)
  const colCreateTime = moment(aColStats.birthtime)
  let colLastUpdated
  if (seeds.length > 0) {
    moment.max(seeds.map(s => moment(s.lastUpdated)))
  } else {
    colLastUpdated = moment().format()
  }
  let colSize = '0 B', ensures = 'index'
  const colWarcP = path.join(colPath, 'archive')
  if (await checkPathExists(colWarcP)) {
    colSize = await getColSize(colWarcP)
  } else {
    ensures = 'both'
  }
  try {
    await ensureColDirs(colPath, ensures)
  } catch (ensureError) {
    console.error(ensureError)
  }
  let backUpMdata = {description: `Recreated by WAIL after found to be not existing`, title: col}
  let metadata
  try {
    metadata = await getYamlOrWriteIfAbsent(path.join(colPath, 'metadata.yaml'), backUpMdata)
  } catch (getYamlError) {
    backUpMdata.description = `${backUpMdata.description} but could not create file on disk.`
  }
  return {
    _id: col, name: col, colPath, size: colSize, lastUpdated: colLastUpdated.format(),
    created: colCreateTime.format(), numArchives: seeds.length, archive: path.join(colWarcP, 'archive'),
    indexes: path.join(colWarcP, 'indexes'), hasRunningCrawl: false, metadata
  }
}

const colFromSeedsNoColDir = async (colPath, col, seeds) => {
  let createdFailed = false, createError = null
  try {
    await createCol(col)
  } catch (createFailed) {
    createdFailed = true
  }
  if (createdFailed) {
    try {
      await ensureColDirs(colPath, 'both')
    } catch (ensureFailed) {
      createError = ensureFailed
    }
  }
  if (createdFailed) {
    throw createError
  }
  const colCreateTime = moment().format()
  let colLastUpdated
  if (seeds.length > 0) {
    moment.max(seeds.map(s => moment(s.lastUpdated)))
  } else {
    colLastUpdated = colCreateTime
  }
  let colSize = '0 B'
  const colWarcP = path.join(colPath, 'archive')
  let metadata = {description: `Recreated by WAIL after found to be not existing`, title: col}
  try {
    await writeYaml(path.join(colPath, 'metadata.yaml'), metadata)
  } catch (writeError) {
    metadata.description = `${metadata.description} but could not create file on disk.`
  }
  return {
    _id: col, name: col, colPath, size: colSize, lastUpdated: colLastUpdated.format(),
    created: colCreateTime.format(), numArchives: seeds.length, archive: path.join(colWarcP, 'archive'),
    indexes: path.join(colWarcP, 'indexes'), hasRunningCrawl: false, metadata
  }
}

// const it = async () => {
//   const collectionsPath = path.join(bPath, 'collections')
//   const seeds = await colSeedsDb.getAllApplyFun(transSeeds)
//   for (const col of Object.keys(seeds)) {
//     const colPath = path.join(collectionsPath, col)
//     let recreatedCol
//     if (await checkPathExists(colPath)) {
//       recreatedCol = await colFromSeedsColDirExists(colPath, col, seeds[col])
//     } else {
//       recreatedCol = await colFromSeedsNoColDir(colPath, col, seeds[col])
//     }
//   }
// }

const runChecker = (aPath) => new Promise((resolve, reject) => {
  cp.execFile('/home/john/my-fork-wail/bundledApps/listUris/listUris', ['-d', aPath], (err, stdout, stderrr) => {
    if (err) {
      reject(err)
    } else {
      resolve({stdout, stderrr})
    }
  })
})

const it = async () => {
  console.log(_.isObject(' '))
}

const it2 = async () => {
  console.log(typeof ' ')
}

it().then(() => {

}).catch(error => {
  console.error(error)
})

// const readTweets = async () => {
//   const tweets = await fs.readJSONAsync('wsdlTweet.json')
//   console.log(tweets)
//   tweets.forEach(t => {
//     console.log(t.entities)
//   })
//   // searcher.addDocuments(tweets)
//   // searcher.search('unarchivable').forEach(it => {
//   //   console.log(it)
//   // })
// }

// readTweets()