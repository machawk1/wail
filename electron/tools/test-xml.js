import 'babel-polyfill'
var realFs = require('fs')
var gracefulFs = require('graceful-fs')
gracefulFs.gracefulify(realFs)
import fs from 'fs-extra'
import path from 'path'
import Promise from 'bluebird'
Promise.promisifyAll(fs)
import cheerio from 'cheerio'
import through2 from 'through2'
import S from 'string'
import child_process from 'child_process'
import split2 from 'split2'
import os from 'os'
import del from 'del'
import streamSort from 'sort-stream2'
import {encode, compare} from 'bytewise'
import shelljs from 'shelljs'


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

const base = path.resolve('../')
const warcsp = path.join(path.resolve(base), '/archives')
const indexp = path.join(path.resolve(base), '/config/path-index.txt')
const aIndexp = path.join(path.resolve(base), '/archiveIndexes')
const cdxTempp = path.join(path.resolve(base), 'archiveIndexes/combined_unsorted2.cdxt')
const indexCDX = path.join(path.resolve(base), 'archiveIndexes/index.cdx')
const cdxIndexerp = path.join(path.resolve(base), 'bundledApps/tomcat/webapps/bin/cdx-indexer')
const cdxp = path.join(path.resolve(base), 'archiveIndexes')

function generatePathIndex() {
   let onlyWarf = through2.obj(function (item, enc, next) {
      if (!item.stats.isDirectory() && path.extname(item.path) === '.warc')
         this.push(item)
      next()
   })

   let index = []

   fs.walk(warcsp)
      .on('error', (err) => onlyWarf.emit('error', err)) // forward the error on
      .pipe(onlyWarf)
      .on('data', item => {
         console.log(item)
         console.log(item.path)
         console.log(path.basename(item.path))
         index.push(`${path.basename(item.path)}\t${item.path}`)
      })
      .on('end', () => {
         fs.writeFile(indexp, index.join('\n'), 'utf8', err => console.log('done generating path index', err))
      })

}


function unixSort(a, b) {
   return compare(encode(a), encode(b))
}

function generateCDX() {
   let replace = /.warc+$/g
   let cdxData = []
   let worfs = []
   let cdxHeaderIncluded = false

   let onlyWorf = through2.obj(function (item, enc, next) {
      if (!item.stats.isDirectory() && path.extname(item.path) === '.warc')
         this.push(item)
      next()
   })


   let worfToCdx = through2.obj(function (item, enc, next) {
      let through = this //hope this ensures that this is through2.obj
      let cdx = path.basename(item.path).replace(replace, '.cdx')
      // console.log(cdx)
      let cdxFile = `${cdxp}/${cdx}`
      child_process.exec(`${cdxIndexerp} ${item.path} ${cdxFile}`, (err, stdout, stderr) => {
         // console.log('cdxIndexerp execution result',err, stdout, stderr)
         // through.push(cdxFile)
         // next()
         fs.readFile(cdxFile, 'utf8', (errr, value)=> {
            // console.log('reading cdxFile result',errr)
            through.push(value)
            next()
         })
      })
   })

   let uniqueLines = new Set()


   let cdxToLines = through2.obj(function (item, enc, next) {
      let through = this
      S(item).lines().forEach((line, index) => {
         if (!uniqueLines.has(line)) {
            if (index > 0) {
               through.push(line + os.EOL)
            } else if (!cdxHeaderIncluded) {
               through.push(line + os.EOL)
               cdxHeaderIncluded = true
            }
            uniqueLines.add(line)
         }
      })
      next()
   })


   // [`${aIndexp}/*.cdx`, `!${aIndexp}/index.cdx`]
   let writeStream = fs.createWriteStream(cdxTempp)
   // let readStream = fs.createWriteStream(cdxTempp)
   // del([`${aIndexp}/*.cdx`, `!${aIndexp}/index.cdx`], {force: true}).then(paths => console.log('Deleted files and folders:\n', paths.join('\n')))
   // fs.walk(aIndexp)
   //    .on('data', item => console.log(item.path))
   fs.walk(warcsp)
      .on('error', (err) => onlyWorf.emit('error', err)) // forward the error on please....
      .pipe(onlyWorf)
      .on('error', (err) => worfToCdx.emit('error', err)) // forward the error on please....
      .pipe(worfToCdx)
      .pipe(cdxToLines)
      .pipe(streamSort(unixSort))
      .pipe(writeStream)
      .on('close', () => {
         writeStream.destroy()
         console.log('we have closed')
         // readStream
         del([`${aIndexp}/*.cdx`, `!${aIndexp}/index.cdx`], {force: true})
            .then(paths => console.log('Deleted files and folders:\n', paths.join('\n')))

      })
   //
   // child_process.exec(`export LC_ALL=C; sort -u ${cdxTempp} > ${cdxp}/index.cdx`, (err, stdout, stderr) => {
   //    console.log('we are ending')
   //    console.log(err, stdout, stderr)
   //
   // })


}
// generatePathIndex()
generateCDX()

// let fileter = (item, enc, next) => {
//    // console.log(item)
//    // if(!item.stats.isDirectory())
//    this.push(item)
//    next()
// }
//
// let onlyWarc = through2.obj(function (item, enc, next) {
//    if (!item.stats.isDirectory())
//       this.push(item)
//    next()
// })
//
// let onlyWarc2 = through2.obj(function (item, enc, next) {
//    if (path.extname(item.path) === '.cxml')
//       this.push(item)
//    next()
// })
//
//
// fs.walk('/home/john/my-fork-wail/wail/bundledApps/heritrix-3.2.0/jobs')
//    .on('error', (err) => onlyWarc.emit('error', err)) // forward the error on
//    .pipe(onlyWarc)
//    .pipe(onlyWarc2)
//    .on('data', item => {
//       // console.log(item)
//       console.log(item.path)
//       console.log(path.basename(item.path))
//
//
//    })
//
// var stuff = "My name is JP\nJavaScript is my fav language\r\nWhat is your fav language?"
// var lines = S(stuff).lines()
// lines.forEach((line, index)=> {
//    console.log(line, index)
// })
