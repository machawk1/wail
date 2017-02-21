import _ from 'lodash'
import path from 'path'
import fs from 'fs-extra'
import Promise from 'bluebird'
import { checkPathExists, removeFile } from '../util/fsHelpers'

export class DataStoreError extends Error {
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

export default class DataStore {
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
