import 'babel-polyfill'
var realFs = require('fs')
var gracefulFs = require('graceful-fs')
gracefulFs.gracefulify(realFs)
import fs from 'fs-extra'
import path from 'path'
import Promise from 'bluebird'
import cheerio from 'cheerio'
import through2 from 'through2'
import S from 'string'

Promise.promisifyAll(fs)
//
// fs.readFileAsync(path.join(path.resolve('./'),'crawler-beans.cxml'), "utf8")
//    .then(data => {
//       let doc = cheerio.load(data,{
//          xmlMode: true
//       })
//        // console.log(doc.xml())
//        'bean[id="warcWriter"]'
//        let urls = doc('bean[id="longerOverrides"]')
//        // console.log(doc.childNodes())
//        // console.log(root.name())
//        // console.log(root.text())
//        console.log(urls.text())
//        // console.log(urls.xml())
//
//    })

let fileter = (item, enc, next) => {
   // console.log(item)
   // if(!item.stats.isDirectory())
   this.push(item)
   next()
}

let onlyWarc = through2.obj(function (item, enc, next) {
   if (!item.stats.isDirectory())
      this.push(item)
   next()
})

let onlyWarc2 = through2.obj(function (item, enc, next) {
   if (path.extname(item.path) === '.cxml')
      this.push(item)
   next()
})


fs.walk('/home/john/my-fork-wail/wail/bundledApps/heritrix-3.2.0/jobs')
   .on('error', (err) => onlyWarc.emit('error', err)) // forward the error on
   .pipe(onlyWarc)
   .pipe(onlyWarc2)
   .on('data', item => {
      // console.log(item)
      console.log(item.path)
      console.log(path.basename(item.path))


   })

var stuff = "My name is JP\nJavaScript is my fav language\r\nWhat is your fav language?"
var lines = S(stuff).lines()
lines.forEach((line, index)=> {
   console.log(line, index)
})
