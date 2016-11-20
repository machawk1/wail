import Promise from 'bluebird'

export function update (db, ...args) {
  return new Promise((resolve, reject) => {
    db.update(...args, (err, ...rest) => {
      if (err) {
        reject(err)
      } else {
        resolve({ ...rest })
      }
    })
  })
}

export function findOne (db, ...args) {
  return new Promise((resolve, reject) => {
    db.findOne(...args, (err, doc) => {
      if (err) {
        reject(err)
      } else {
        resolve(doc)
      }
    })
  })
}

export function find (db, ...args) {
  return new Promise((resolve, reject) => {
    db.find(...args, (err, docs) => {
      if (err) {
        reject(err)
      } else {
        resolve(docs)
      }
    })
  })
}

export function insert (db, ...args) {
  return new Promise((resolve, reject) => {
    db.insert(...args, (err, doc) => {
      if (err) {
        reject(err)
      } else {
        resolve(doc)
      }
    })
  })
}

