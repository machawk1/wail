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
const streamSort = require('sort-stream2')
const Twit = require('twit')
const jsSearch = require('js-search')
const Rx = require('rxjs/Rx')
const yaml = require('js-yaml')
const normalizeUrl = require('normalize-url')

Promise.promisifyAll(fs)
Promise.promisifyAll(DB.prototype)

Set.prototype.isSuperset = function (subset) {
  for (var elem of subset) {
    if (!this.has(elem)) {
      return false;
    }
  }
  return true;
}

Set.prototype.union = function (setB) {
  var union = new Set(this);
  for (var elem of setB) {
    union.add(elem);
  }
  return union;
}

Set.prototype.intersection = function (setB) {
  var intersection = new Set();
  for (var elem of setB) {
    if (this.has(elem)) {
      intersection.add(elem);
    }
  }
  return intersection;
}

Set.prototype.difference = function (setB) {
  var difference = new Set(this);
  for (var elem of setB) {
    difference.delete(elem);
  }
  return difference;
}

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

  update (updateWho, theUpdate, opts = {}) {
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

class ColSeedsDb {
  constructor (colOpts, seedOpts) {
    this._collections = new DataStore(colOpts)
    this._colSeeds = new DataStore(seedOpts)
  }

  async _handleTrackedNotExisting (cols, seeds) {
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

  async _loadDbsFallBackHard () {

  }

  async _loadColsDb () {
    const result = {wasError: false, backupFail: false, fatal: false}
    let colLoadFail = false
    try {
      await this._collections.loadDb()
    } catch (err) {
      colLoadFail = true
      result.wasError = true
    }
    if (colLoadFail) {
      try {
        result.colBackup = await this._collections.backUpHardClearDb()
      } catch (errBackUp) {
        result.backupFail = true
      }
      try {
        await this._collections.loadDb()
      } catch (err) {
        result.fatal = true
      }
    }
    return result
  }

  async _loadSeedsDb () {
    const result = {wasError: false, backupFail: false, fatal: false}
    let colLoadFail = false
    try {
      await this._colSeeds.loadDb()
    } catch (err) {
      colLoadFail = true
      result.wasError = true
    }
    if (colLoadFail) {
      try {
        result.seedsBackup = await this._colSeeds.backUpHardClearDb()
      } catch (errBackUp) {
        result.backupFail = true
      }
      try {
        await this._colSeeds.loadDb()
      } catch (err) {
        result.fatal = true
      }
    }
    return result
  }

  async _loadDbsQuite () {
    const result = {hadToBackup: false}
    let colLoadFail = false, seedsLoadFail = false
    try {
      await this._collections.loadDb()
    } catch (err) {
      colLoadFail = true

    }
    if (colLoadFail) {
      try {
        await this._colSeeds.backUpHardClearDb()
      } catch (errBackUp) {
        result.backupFail = true
      }
      await this._colSeeds.loadDb()
    }

    try {
      await this._colSeeds.loadDb()
    } catch (err) {
      seedsLoadFail = true
    }
    if (seedsLoadFail) {
      try {
        await this._colSeeds.backUpHardClearDb()
      } catch (errBackUp) {
        result.backupFail = true
      }
      await this._colSeeds.loadDb()
    }
    return result
  }

  async _handleColDirNoExistence (errExist) {
    if (errExist.didNotExist === 'warcs') {
      // probably the first time but check
      await this._loadDbsQuite()
      if (!getCols.wasError && !getColSeeds.wasError) {
        let cols = getCols.value, seeds = getColSeeds.value
        if (cols.length === 0 && seeds.length === 0) {
          // this is the first time for all intents and purposes
          let defaultCol
          try {
            defaultCol = await this.createDefaultCol()
          } catch (errorCreateDefault) {
            throw errorCreateDefault
          }
          return defaultCol
        } else {
          let seedsBackup = await this._colSeeds.backUp()
          let colsBackup = await this._collections.backUp()
        }
      }
    } else if (errExist.didNotExist === 'collections') {

    }

    /*
     if (getCols.value.length !== 0 && colSeeds) {
     // someone deleted WAIL_ManagedCollections

     } else {
     // this is the first time WAIL is ran
     let defaultCol = await this.createDefaultCol()

     if (!createDefault.wasError) {
     await moveStartingCol()
     return createDefault.value
     } else {
     throw createDefault.value
     }
     }
     */
  }

  _ensureColDirs (colPath, which) {
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
      await this._ensureColDirs(colPath, ensures)
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
        await this._ensureColDirs(colPath, 'both')
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
    for (const col of Object.keys(seeds)) {
      const colPath = path.join(collectionsPath, col)
      let recreatedCol
      if (await checkPathExists(colPath)) {
        recreatedCol = await this._colFromSeedsColDirExists(colPath, col, seeds[col])
      } else {
        recreatedCol = await this._colFromSeedsNoColDir(colPath, col, seeds[col])
      }
    }
  }

  async _getSeedsAndColsWithCheck () {
    let colSeeds, colsExistCheck
    try {
      colsExistCheck = await this._collections.getAllCheckExists('colpath')
    } catch (errFind) {
      throw new DataStoreError(errFind, 'colExistCheck')
    }

    try {
      colSeeds = await this._colSeeds.getAllApplyFun(transSeeds)
    } catch (errSeedFind) {
      throw new DataStoreError(errSeedFind, 'finding seeds')
    }

    let {exist, empty, doNotExist} = colsExistCheck

    if (empty) {
      const maybeExistingCols = await readDir(path.join(bPath, 'collections'))
      if (colSeeds.length === 0) {

      } else {

      }
      // let defaultColPath = path.join(bPath, 'collections', 'default')
      // if (!await checkPathExists(defaultColPath)) {
      //   //something is up our db is empty and collections dir exists but default does not
      //   if (colSeeds.length !== 0) {
      //     let defaultSeeds = .filter(colS => colS.forCol === 'default')
      //     let {bkupName, didInsert} = await backupDbInsert('', 'defaultColSeeds', colSeeds)
      //   }
      // }
    }

    return {colsExistCheck, colSeeds}
  }

  async getAllCollections () {
    try {
      await checkCollDirExistence()
    } catch (noExist) {
      return await this._handleColDirNoExistence(noExist)
    }
    // WAIL_ManagedCollections && WAIL_ManagedCollections/collections exist check cols
    let {colsExistCheck, colSeeds} = await this._getSeedsAndColsWithCheck()

    if (!colsExists.wasError) {
      const {exist, empty, doNotExist} = colsExists.value
      if (!empty) {
        if (doNotExist.length === 0) {

        } else {

        }
      }
    }
    if (!colDirsExisting.wasError) {

    } else {

    }
    // if (!colDirsExisting.wasError) {
    //   if (!getCols.wasError && getCols.value.length === 0) {
    //     // more than likely the first time we are
    //
    //   }
    // } else {
    //   if (colDirsExisting.didNotExist === 'warcs') {
    //     if (!getCols.wasError && getCols.value.length === 0) {
    //       const createDefault = await this.createDefaultCol()
    //       if (!createDefault.wasError) {
    //         await moveStartingCol()
    //         resolve(createDefault.value)
    //       } else {
    //         reject(createDefault.value)
    //       }
    //     }
    //
    //   }
    // }
    //
    // const getColSeeds = await this._colSeeds.getAll()
    // if (!getCols.wasError && !getColSeeds.wasError) {
    //   let docs = joinColsSeeds(getCols.value, getColSeeds.value)
    //   if (docs.length === 0) {
    //     const createDefault = await this.createDefaultCol()
    //     if (!createDefault.wasError) {
    //       await moveStartingCol()
    //       return createDefault.value
    //     } else {
    //       throw createDefault.value
    //     }
    //   } else {
    //
    //     if (!colDirsExisting.wasError) {
    //       const getColDirs = await readDir(path.join(bPath, 'collections'))
    //       if (!getColDirs.wasError) {
    //         let gone = []
    //         getColDirs.value.forEach()
    //       }
    //     } else {
    //
    //     }
    //   }
    // } else {
    //   if (getCols.wasError && getColSeeds.wasError) {
    //
    //   } else if (getCols.wasError) {
    //
    //   } else {
    //
    //   }
    // }
  }

  async backUpDbs (clear = false) {
    const bkC = await this._collections.backUp(clear)
    const bkCs = await this._colSeeds.backUp(clear)
  }

  async createDefaultCol () {
    // `${settings.get('warcs')}${path.sep}collections${path.sep}${col}`
    let colpath = path.join(settings.get('warcs'), 'collections', 'default')
    // description: Default Collection
    // title: Default
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
    await execute('', {})
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

const fail = () => new Promise((resolve, reject) => {
  reject(new Error('dummy'))
})

const it = async () => {
  let db = new DataStore({filename: '/home/john/my-fork-wail/hi.db'})
  try {
    await db.loadDb()
  } catch (corrupted) {
    console.error(corrupted)
    await removeFile('/home/john/my-fork-wail/hi.db')
    await db.loadDb()
  }
  let inserted = await db.insert({hi: 'hello'})
  console.log(inserted)

  // await db.loadDb()
  inserted = await db.insert({hi: 'hello'})

  console.log(inserted)
  console.log(process.cwd())
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