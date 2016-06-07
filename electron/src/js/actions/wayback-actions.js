import child_process from "child_process";
import rp from "request-promise";
import fs from "fs-extra";
import through2 from "through2";
import path from "path";
import S from "string";
import os from "os";
import del from "del";
import streamSort from "sort-stream2";
import {encode, compare} from "bytewise";
import wailConstants from "../constants/wail-constants";
import ServiceDispatcher from "../dispatchers/service-dispatcher";

const EventTypes = wailConstants.EventTypes
const Wayback = wailConstants.Wayback
const paths = wailConstants.Paths


export function waybackAccesible() {
   console.log("checking wayback accessibility")

   rp({uri: Wayback.uri_wayback})
      .then(success => {
         console.log("wayback success", success)
         ServiceDispatcher.dispatch({
            type: EventTypes.WAYBACK_STATUS_UPDATE,
            status: true,
         })
      }).catch(err => {
      console.log("wayback err", err)
      ServiceDispatcher.dispatch({
         type: EventTypes.WAYBACK_STATUS_UPDATE,
         status: false,
      })
   }).finally(() => console.log("wayback finally"))
}


export function startWayback() {
   child_process.exec(`sh ${ wailConstants.Paths.tomcatStart}`, (err, stdout, stderr) => {
      console.log(err, stdout, stderr)
   })
}

export function killWayback() {
   child_process.exec(`sh ${ wailConstants.Paths.tomcatStop}`, (err, stdout, stderr) => {
      console.log(err, stdout, stderr)
   })
}

export function generatePathIndex() {
   let onlyWarf = through2.obj(function (item, enc, next) {
      if (!item.stats.isDirectory() && path.extname(item.path) === '.warc')
         this.push(item)
      next()
   })

   let index = []

   fs.walk(paths.warcs)
      .on('error', (err) => onlyWarf.emit('error', err)) // forward the error on
      .pipe(onlyWarf)
      .on('data', item => {
         console.log(item)
         console.log(item.path)
         console.log(path.basename(item.path))
         index.push(`${path.basename(item.path)}\t${item.path}`)
      })
      .on('end', () => {
         fs.writeFile(paths.index, index.join('\n'), 'utf8', err => console.log('done generating path index', err))
      })

}

//implements bytewise sorting of export LC_ALL=C; sort
function unixSort(a, b) {
   return compare(encode(a), encode(b))
}

export function generateCDX() {
   let replace = /.warc+$/g
   let cdxHeaderIncluded = false

   let onlyWorf = through2.obj(function (item, enc, next) {
      if (!item.stats.isDirectory() && path.extname(item.path) === '.warc')
         this.push(item)
      next()
   })


   let worfToCdx = through2.obj(function (item, enc, next) {
      let through = this //hope this ensures that this is through2.obj
      let cdx = path.basename(item.path).replace(replace, '.cdx')
      let cdxFile = `${wailConstants.Paths.cdx}/${cdx}`
      child_process.exec(`${ wailConstants.Paths.cdxIndexer} ${ wailConstants.Paths.warcs}/${item.path} ${cdxFile}`, (err, stdout, stderr) => {
         fs.readFile(cdxFile, 'utf8', (errr, value)=> {
            console.log(errr)
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


   let writeStream = fs.createWriteStream(wailConstants.Paths.indexCDX)
   
   fs.walk(wailConstants.Paths.warcs)
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
         del([`${wailConstants.Paths.cdx}/*.cdx`, `!${wailConstants.Paths.cdx}/index.cdx`], {force: true})
            .then(paths => console.log('Deleted files and folders:\n', paths.join('\n')))

      })
}

