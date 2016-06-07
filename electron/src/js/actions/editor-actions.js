import fs from "fs-extra";

export function readCode(path) {
   /*
    fs.readFileAsync(path,'utf8')
    .then(cb)
    .catch(error=>console.log(`error loading file ${path}`,error))
    */
   let text = fs.readFileSync(path, 'utf8')
   console.log(text)
   return text

}

export function saveCode(path, text, errorHandler) {
   fs.writeFile(path, text, 'utf8', errorHandler)
}