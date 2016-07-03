import fs from 'fs-extra'
import EditorDispatcher from '../dispatchers/editorDispatcher'
import wc from '../constants/wail-constants'

export function fetchCode () {
  EditorDispatcher.dispatch({
    type: wc.EventTypes.FETCH_CODE
  })
}

export function readCode (path) {
  /*
   fs.readFileAsync(path,'utf8')
   .then(cb)
   .catch(error=>console.log(`error loading file ${path}`,error))
   */
  return fs.readFileSync(path, 'utf8')
}

export function saveCode (path, text, errorHandler) {
  fs.writeFile(path, text, 'utf8', errorHandler)
}
