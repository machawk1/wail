const _ = require('lodash')
const DB = require('nedb')
const util = require('util')
const path = require('path')
const Promise = require('bluebird')
const S = require('string')
const cp = require('child_process')
const fp = require('lodash/fp')
const fs = require('fs-extra')
const DropBox = require('dropbox')
const prettyBytes = require('pretty-bytes')
const through2 = require('through2')
const streamSort = require('sort-stream2')
const Twit = require('twit')
const jsSearch = require('js-search')
const Rx = require('rxjs/Rx')
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
  let exePath = S(template).template({ path }).s
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

const readDir = (dir, addSuffix) => new Promise((resolve, reject) => {
  fs.readdir(dir, (err, stuff) => {
    if (err) {
      resolve({ wasError: true, value: err })
    } else {
      if (addSuffix) {
        resolve({ wasError: false, value: stuff.map(it => path.join(dir, it, addSuffix)) })
      } else {
        resolve({ wasError: false, value: stuff.map(it => path.join(dir, it)) })
      }
    }
  })
})

const bPath = '/home/john/Documents/WAIL_ManagedCollections'

const asyncTry = async (fun, args = []) => {
  try {
    return { wasError: false, value: await fun.apply(null, args) }
  } catch (e) {
    return { wasError: true, value: e }
  }
}

const asyncTryNamed = async (returnName, fun, args = []) => {
  try {
    return { wasError: false, [returnName]: await fun.apply(null, args) }
  } catch (e) {
    return { wasError: true, [returnName]: e }
  }
}

const checkWarcs = async () => {
  const tryCols = await asyncTry(readDir, [ bPath, 'archive' ])
  if (!tryCols.wasError) {
    let it = await Promise.map(tryCols.value, col => asyncTry(isWarcValid, [ col, 'd' ]))
    let bad = []
    it.forEach(({ wasError, value }) => {
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
        return resolve({ wasError: true, value: err })
      }
      badWarc.filep = newName
      resolve(badWarc)
    })
  })

function renameBadWarcs (badWarcs) {
  if (Array.isArray(badWarcs)) {
    return Promise.map(badWarcs, warcRenamer, { concurrency: 1 })
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
    if (colSeeds[ col.colName ]) {
      col.seeds = colSeeds[ col.colName ]
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
      resolve({ wasError: true, didNotExist: 'warcs' })
    } else {
      fs.stat(path.join(bPath, 'collections'), (err2, stats) => {
        if (err2) {
          resolve({ wasError: true, didNotExist: 'collections' })
        } else {
          resolve({ wasError: false })
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

const checkCollDirExistence = () => new Promise((resolve, reject) => {
  fs.access(bPath, fs.constants.R_OK, err => {
    if (err) {
      resolve({ wasError: true, didNotExist: 'warcs' })
    } else {
      fs.access(path.join(bPath, 'collections'), fs.constants.R_OK, err2 => {
        if (err2) {
          resolve({ wasError: true, didNotExist: 'collections' })
        } else {
          resolve({ wasError: false })
        }
      })
    }
  })
})

const checkCollDirExistence2 = () => new Promise((resolve, reject) => {
  fs.access(bPath, fs.constants.R_OK, err => {
    if (err) {
      reject(new ColDirExistsError('warcs'))
    } else {
      fs.access(path.join(bPath, 'collections'), fs.constants.R_OK, err2 => {
        if (err2) {
          reject(new ColDirExistsError('collections'))
        } else {
          resolve(true)
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

  backUp (clear = false) {
    const backUpTime = new Date().getTime()
    return new Promise((resolve, reject) => {
      fs.copy(oa, `${this.filePath}.${backUpTime}.bk`, (err) => {
        if (err) {
          reject(new DataStoreError(err, `backing up ${this.humanName}`))
        } else {
          if (clear) {
            return this.remove({}, { multi: true })
              .then((ret) => { resolve(ret) })
              .catch(errRm => { reject(new DataStoreError(errRm, `clearing ${this.humanName}`))})
          } else {
            resolve()
          }
        }
      })
    })
  }

  update (updateWho, theUpdate, opts = {}) {
    return new Promise((resolve, reject) => {
      this.db.update(updateWho, theUpdate, opts, (err, numAffected, affectedDocuments, upsert) => {
        if (err) {
          resolve({ wasError: true, value: err })
        } else {
          resolve({ wasError: false, value: { numAffected, affectedDocuments, upsert } })
        }
      })
    })
  }

  getAll () {
    return this.find({})
  }

  async getAllCheckExists (prop) {
    let docs, existCheck = { exist: [], empty: false, doNotExist: [] }
    try {
      docs = await this._find({})
    } catch (e) {
      return { wasError: true, value: new DataStoreError(e, `finding ${this.humanName}`) }
    }
    if (docs.length === 0) {
      existCheck.empty = true
      return { wasError: false, value: existCheck }
    } else {
      let len = docs.length, i = 0
      for (; i < len; ++i) {
        if (await checkPathExists(docs[ i ][ prop ])) {
          existCheck.exist.push(docs[ i ])
        } else {
          existCheck.doNotExist.push(docs[ i ])
        }
      }
      return { wasError: false, value: existCheck }
    }
  }

  _find (query) {
    return new Promise((resolve, reject) => {
      this.db.find(query, (err, doc) => {
        if (err) {
          reject(err)
        } else {
          resolve(doc)
        }
      })
    })
  }

  find (query) {
    return new Promise((resolve, reject) => {
      this.db.find(query, (err, doc) => {
        if (err) {
          resolve({ wasError: true, value: err })
        } else {
          resolve({ wasError: false, value: doc })
        }
      })
    })
  }

  findSelect (query, select) {
    return new Promise((resolve, reject) => {
      this.db.find(query, select, (err, docs) => {
        if (err) {
          resolve({ wasError: true, value: err })
        } else {
          resolve({ wasError: false, value: docs })
        }
      })
    })
  }

  findOne (query) {
    return new Promise((resolve, reject) => {
      this.db.findOne(query, (err, doc) => {
        if (err) {
          resolve({ wasError: true, value: err })
        } else {
          resolve({ wasError: false, value: doc })
        }
      })
    })
  }

  findOneSelect (query, select) {
    return new Promise((resolve, reject) => {
      this.db.findOne(query, select, (err, docs) => {
        if (err) {
          resolve({ wasError: true, value: err })
        } else {
          resolve({ wasError: false, value: docs })
        }
      })
    })
  }

  insert (insertMe) {
    return new Promise((resolve, reject) => {
      this.db.insert(insertMe, (err, docs) => {
        if (err) {
          resolve({ wasError: true, value: err })
        } else {
          resolve({ wasError: false, value: docs })
        }
      })
    })
  }

  count (what) {
    return new Promise((resolve, reject) => {
      this.db.count(what, (err, count) => {
        if (err) {
          resolve({ wasError: true, value: err })
        } else {
          resolve({ wasError: false, value: count })
        }
      })
    })
  }

  remove (query, opts = {}) {
    return new Promise((resolve, reject) => {
      this.db.remove(query, opts, (err, rmc) => {
        if (err) {
          resolve({ wasError: true, value: err })
        } else {
          resolve({ wasError: false, value: rmc })
        }
      })
    })
  }

  removeNoError (query, opts = {}) {
    return new Promise((resolve) => {
      this.db.remove(query, opts, (err, rmc) => {
        resolve({ wasError: false, value: rmc })
      })
    })
  }
}

class ColSeedsDb {
  constructor (colOpts, seedOpts) {
    this._collections = new DataStore(colOpts)
    this._colSeeds = new DataStore(seedOpts)
  }

  async _handleTrackedColsNotExisting (cols, seeds) {
    const tempDb = new DataStore({
      autoload: true,
      filename: `${new Date().getTime()}.trackedCollectionsNoLongerExisting.db`
    })
    const insertGood = await tempDb.insert(cols)
    if (!insertGood.wasError) {
      const removeFromExisting = cols.map(col => {
        return { _id: col._id }
      })
      this._collections.remove(removeFromExisting, { multi: true })
    }
    return
  }

  async getAllCollections () {
    const colDirsExisting = await checkCollDirExistence()
    if (!colDirsExisting.wasError) {
      // WAIL_ManagedCollections && WAIL_ManagedCollections/collections exist
      // check cols
      const colSeeds = await this._colSeeds.getAll()
      const colsExists = await this._collections.getAllCheckExists('colpath')
      if (!colsExists.wasError) {
        const { exist, empty, doNotExist } = colsExists.value
        if (!empty) {
          if (doNotExist.length === 0) {

          } else {

          }
        }
      }
    } else {
      // they do not exist but who dont
      const getCols = await this._collections.getAll()
      if (colDirsExisting.didNotExist === 'warcs') {
        // probably the first time but check
        if (!getCols.wasError) {
          if (getCols.value.length !== 0) {
            // someone deleted WAIL_ManagedCollections

          } else {
            // this is the first time WAIL is ran
            const createDefault = await this.createDefaultCol()
            if (!createDefault.wasError) {
              await moveStartingCol()
              return createDefault.value
            } else {
              throw createDefault.value
            }
          }
        }
      } else if (colDirsExisting.didNotExist === 'collections') {

      }

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
      metadata: { title: 'Default', description: 'Default Collection' },
      size: '0 B',
      created,
      lastUpdated: created,
      hasRunningCrawl: false
    }
    const insert = this._collections.insert(toCreate)
    if (!insert.wasError) {
      insert.value.seeds = []
      return insert
    } else {
      return insert
    }
  }
}

const colDb = new DataStore({ autoload: true, filename: '/home/john/wail/wail-config/database/archives.db' })

const it = async () => {
  const getCols = await colDb.getAllCheckExists('colpath')
  if (!getCols.wasError) {
    const { exist, empty, doNotExist } = getCols.value
    console.log(exist, doNotExist)
  }
}

it().then(() => console.log('done'))
  .catch(error => {
    console.error(error)
    console.log(error instanceof Error)
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