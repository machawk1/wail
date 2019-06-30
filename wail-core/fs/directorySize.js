import walk from 'klaw'
import Promise from 'bluebird'

function directorySize (dirPath, options) {
  return new Promise((resolve, reject) => {
    const ret = {size: 0, errors: []}
    walk(dirPath, options)
      .on('data', item => {
        if (!item.stats.isDirectory()) {
          ret.size += item.stats.size
        }
      })
      .on('error', (error, item) => {
        ret.errors.push({error, item})
      })
      .on('end', () => {
        resolve(ret)
      })
  })
}

function directorySizePiped (dirPath, thePipe, options) {
  return new Promise((resolve, reject) => {
    const ret = {size: 0, errors: []}
    walk(dirPath, options)
      .pipe(thePipe)
      .on('data', item => {
        ret.size += item.stats.size
      })
      .on('error', (error, item) => {
        ret.errors.push({error, item})
      })
      .on('end', () => {
        resolve(ret)
      })
  })
}

export default {
  directorySize,
  directorySizePiped,
  dirSize: directorySize,
  dirSizePiped: directorySizePiped
}
