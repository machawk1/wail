import fs from 'fs-extra'

export function readCode(path) {
  /*
   fs.readFileAsync(path,'utf8')
   .then(cb)
   .catch(error=>console.log(`error loading file ${path}`,error))
   */
  return fs.readFileSync(path, 'utf8')
}

export function saveCode(path, text, errorHandler) {
  fs.writeFile(path, text, 'utf8', errorHandler)
}
