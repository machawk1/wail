import Promise from 'bluebird'
import fs from 'fs-extra'
import path from 'path'
import through2 from 'through2'
import prettyBytes from 'pretty-bytes'

class CollectionUtilsError extends Error {
  constructor (oError, where) {
    super(`CollectionsUtilErrorr[${where}]`)
    Object.defineProperty(this, 'name', {
      value: this.constructor.name
    })
    this.oError = oError
    this.where = where
    Error.captureStackTrace(this, CollectionUtilsError)
  }

  errorReport (message, title = 'Error') {
    return {
      wasError: true,
      err: this.oError,
      message: {
        title,
        level: 'error',
        autoDismiss: 0,
        message: message,
        uid: message
      }
    }
  }
}

export default class CollectionsUtils {
  static ensureColDirsNR (colPath, which) {
    return new Promise((resolve, reject) => {
      if (which === 'both') {
        fs.ensureDir(path.join(colPath, 'archive'), errA => {
          fs.ensureFile(path.join(colPath, 'indexes', 'index.cdxj'), errI => {
            resolve()
          })
        })
      } else if (which === 'index') {
        fs.ensureFile(path.join(colPath, 'indexes', 'index.cdxj'), errI => {
          resolve()
        })
      } else {
        fs.ensureDir(path.join(colPath, 'archive'), errA => {
          resolve()
        })
      }
    })
  }

  static ensureColDirs (colPath, which) {
    return new Promise((resolve, reject) => {
      if (which === 'both') {
        fs.ensureDir(path.join(colPath, 'archive'), errA => {
          if (errA) {
            reject(new CollectionUtilsError(errA, 'archive'))
          } else {
            fs.ensureFile(path.join(colPath, 'indexes', 'index.cdxj'), errI => {
              if (errI) {
                reject(new CollectionUtilsError(errI, 'index'))
              } else {
                resolve()
              }
            })
          }
        })
      } else if (which === 'index') {
        fs.ensureFile(path.join(colPath, 'indexes', 'index.cdxj'), errI => {
          if (errI) {
            reject(new CollectionUtilsError(errI, 'index'))
          } else {
            resolve()
          }
        })
      } else {
        fs.ensureDir(path.join(colPath, 'archive'), errA => {
          if (errA) {
            reject(new CollectionUtilsError(errA, 'archive'))
          } else {
            resolve()
          }
        })
      }
    })
  }

  static manualCreateCol (colPath) {
    return new Promise((resolve, reject) => {
      fs.ensureDir(colPath, errColDir => {
        if (errColDir) {
          reject(new CollectionUtilsError(errColDir, 'colPath'))
        } else {
          fs.ensureDir(path.join(colPath, 'archive'), errA => {
            if (errA) {
              reject(new CollectionUtilsError(errA, 'archive'))
            } else {
              fs.ensureFile(path.join(colPath, 'indexes', 'index.cdxj'), errI => {
                if (errI) {
                  reject(new CollectionUtilsError(errI, 'index'))
                } else {
                  resolve()
                }
              })
            }
          })
        }
      })
    })
  }

  static getColSize (pathToWarcs) {
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

  static checkCollDirExistence (managedCollections) {
    return new Promise((resolve, reject) => {
      fs.access(managedCollections, fs.constants.R_OK, err => {
        if (err) {
          reject(new CollectionUtilsError(err, 'warcs'))
        } else {
          fs.access(path.join(managedCollections, 'collections'), fs.constants.R_OK, err2 => {
            if (err2) {
              reject(new CollectionUtilsError(err2, 'collections'))
            } else {
              resolve()
            }
          })
        }
      })
    })
  }
}