import * as fs from 'fs-extra'
import Promise from 'bluebird'

function pathExists (path, cb) {
  fs.stat(path, (error, stats) => {
    if (error) {
      if (error.code === 'ENOENT') {
        cb(null, false)
      } else {
        cb(error, null)
      }
    } else {
      cb(null, true)
    }
  })
}

function pathExistsQuick (path, cb) {
  fs.access(path, fs.constants.R_OK, err => {
    cb(!err)
  })
}

function pathExistsAsync (path) {
  return new Promise((resolve, reject) => {
    fs.stat(path, error => {
      if (error) {
        if (error.code === 'ENOENT') {
          resolve(false)
        } else {
          reject(error)
        }
      } else {
        resolve(true)
      }
    })
  })
}

function pathExistsQuickAsync (path) {
  return new Promise((resolve) => {
    fs.access(path, fs.constants.R_OK, err => {
      resolve(!err)
    })
  })
}

function pathExistsSync (path) {
  try {
    fs.statSync(path)
  } catch (error) {
    if (error.code === 'ENOENT') {
      return false
    } else {
      throw error
    }
  }
  return true
}

function pathExistsQuickSync (path) {
  try {
    fs.accessSync(path, fs.constants.R_OK)
  } catch (error) {
    return false
  }
  return true
}

export default {
  pathExists,
  pathExistsQuick,
  pathExistsAsync,
  pathExistsQuickAsync,
  pathExistsSync,
  pathExistsQuickSync
}
