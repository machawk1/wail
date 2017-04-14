import * as fs from 'fs-extra'
import Promise from 'bluebird'

function pathIs (path, cb) {
  fs.lstat(path, (error, stats) => {
    if (error) {
      if (error.code === 'ENOENT') {
        cb(null, 'nonExistent')
      } else {
        cb(error, null)
      }
    } else if (stats.isDirectory()) {
      cb(null, 'dir')
    } else if (stats.isFile()) {
      cb(null, 'file')
    } else if (stats.isSymbolicLink()) {
      cb(null, 'symlink')
    } else if (stats.isBlockDevice()) {
      cb(null, 'blockDevice')
    } else if (stats.isCharacterDevice()) {
      cb(null, 'characterDevice')
    } else if (stats.isCharacterDevice()) {
      cb(null, 'characterDevice')
    } else if (stats.isFIFO()) {
      cb(null, 'fifo')
    } else {
      cb(null, 'other')
    }
  })
}

function pathIsSync (path) {
  let stats
  try {
    stats = fs.statSync(path)
  } catch (error) {
    if (error.code === 'ENOENT') {
      return 'nonExistent'
    } else {
      throw error
    }
  }
  if (stats.isDirectory()) {
    return 'dir'
  } else if (stats.isFile()) {
    return 'file'
  } else if (stats.isSymbolicLink()) {
    return 'symlink'
  } else if (stats.isBlockDevice()) {
    return 'blockDevice'
  } else if (stats.isCharacterDevice()) {
    return 'characterDevice'
  } else if (stats.isCharacterDevice()) {
    return 'characterDevice'
  } else if (stats.isFIFO()) {
    return 'fifo'
  } else {
    return 'other'
  }
}

function pathIsAsync (path) {
  return new Promise((resolve, reject) => {
    fs.lstat(path, (error, stats) => {
      if (error) {
        if (error.code === 'ENOENT') {
          return resolve('nonExistent')
        } else {
          return reject(error)
        }
      } else if (stats.isDirectory()) {
        return resolve('dir')
      } else if (stats.isFile()) {
        return resolve('file')
      } else if (stats.isSymbolicLink()) {
        return resolve('symlink')
      } else if (stats.isBlockDevice()) {
        return resolve('blockDevice')
      } else if (stats.isCharacterDevice()) {
        return resolve('characterDevice')
      } else if (stats.isCharacterDevice()) {
        return resolve('characterDevice')
      } else if (stats.isFIFO()) {
        return resolve('fifo')
      } else {
        return resolve('other')
      }
    })
  })
}

export default {
  pathIs,
  pathIsSync,
  pathIsAsync
}
