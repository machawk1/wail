import Promise from 'bluebird'

export class CompoundNedbError extends Error {
  constructor (oError, where) {
    super(`CompoundNedbError[${where}]`)
    Object.defineProperty(this, 'name', {
      value: this.constructor.name
    })
    this.oError = oError
    this.where = where
    Error.captureStackTrace(this, CompoundNedbError)
  }
}

export function update (db, updateWho, theUpdate, opts = {}) {
  return new Promise((resolve, reject) => {
    db.update(updateWho, theUpdate, opts, (err, numAffected, affectedDocuments, upsert) => {
      if (err) {
        reject(err)
      } else {
        resolve({numAffected, affectedDocuments, upsert})
      }
    })
  })
}

export function updateSingle (db, updateWho, theUpdate, opts) {
  return new Promise((resolve, reject) => {
    db.update(updateWho, theUpdate, opts, (err, numAffected, affectedDocuments, upsert) => {
      if (err) {
        reject(err)
      } else {
        resolve(affectedDocuments)
      }
    })
  })
}

export function updateAndFindAll (db, updateWho, theUpdate, upOpts, findQ) {
  return new Promise((resolve, reject) => {
    db.update(updateWho, theUpdate, upOpts, (errU, numAffected, affectedDocuments, upsert) => {
      if (errU) {
        reject(new CompoundNedbError(errU, 'update'))
      } else {
        db.find(findQ, (errF, docs) => {
          if (errF) {
            reject(new CompoundNedbError(errF, 'findAfterUpdate'))
          } else {
            resolve(docs)
          }
        })
      }
    })
  })
}

export function findOne (db, query) {
  return new Promise((resolve, reject) => {
    db.findOne(query, (err, doc) => {
      if (err) {
        reject(err)
      } else {
        resolve(doc)
      }
    })
  })
}

export function findOneSelect (db, query, select) {
  return new Promise((resolve, reject) => {
    db.findOne(query, select, (err, doc) => {
      if (err) {
        reject(err)
      } else {
        resolve(doc)
      }
    })
  })
}

export function findOneFromBoth (db1, db1Query, db2, db2Q) {
  return new Promise((resolve, reject) => {
    db1.findOne(db1Query, (err1, doc1) => {
      if (err1) {
        reject(new CompoundNedbError(err1, 'find1 db1'))
      } else {
        db2.findOne(db2, db2Q, (err2, doc2) => {
          if (err2) {
            reject(new CompoundNedbError(err2, 'find2 db2'))
          } else {
            resolve({
              doc1: doc1,
              doc2: doc2
            })
          }
        })
      }
    })
  })
}

export function find (db, query) {
  return new Promise((resolve, reject) => {
    db.find(query, (err, docs) => {
      if (err) {
        reject(err)
      } else {
        resolve(docs)
      }
    })
  })
}

export function findSelect (db, query, select) {
  return new Promise((resolve, reject) => {
    db.find(query, select, (err, docs) => {
      if (err) {
        reject(err)
      } else {
        resolve(docs)
      }
    })
  })
}

export function insert (db, insertMe) {
  return new Promise((resolve, reject) => {
    db.insert(insertMe, (err, docs) => {
      if (err) {
        reject(err)
      } else {
        resolve(docs)
      }
    })
  })
}

export function inserAndFindAll (db, insertMe, findQ) {
  return new Promise((resolve, reject) => {
    db.insert(insertMe, (errI, docs) => {
      if (errI) {
        reject(new CompoundNedbError(errI, 'insert'))
      } else {
        db.find(findQ, (errF, all) => {
          if (errF) {
            reject(new CompoundNedbError(errF, 'findAllAfterInsert'))
          }
          resolve(all)
        })
      }
    })
  })
}

export function count (db, what) {
  return new Promise((resolve, reject) => {
    db.count(what, (err, count) => {
      if (err) {
        reject(err)
      } else {
        resolve(count)
      }
    })
  })
}

export function remove (db) {
  return new Promise((resolve, reject) => {
    db.remove({}, {multi: true}, (err, rmc) => {
      resolve(rmc)
    })
  })
}
