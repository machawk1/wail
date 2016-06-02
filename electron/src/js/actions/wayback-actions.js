import wailConstants from '../constants/wail-constants'
import child_process from 'child_process'
import rp from 'request-promise'
import fs from 'fs-extra'
import through2 from 'through2'
import path from 'path'
import S from 'string'
import ServiceDispatcher from '../dispatchers/service-dispatcher'

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
   child_process.exec(`sh ${paths.tomcatStart}`, (err, stdout, stderr) => {
      console.log(err, stdout, stderr)
   })
}

export function killWayback() {
   child_process.exec(`sh ${paths.tomcatStop}`, (err, stdout, stderr) => {
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
         fs.writeFile(paths.index, index.join('\n'), 'utf8', err => console.log(err))
      })

}


export function generateCDX() {
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
      let cdxFile = `${paths.cdx}/${cdx}`
      child_process.exec(`${paths.cdxIndexer} ${paths.warcs}/${item.path} ${cdxFile}`, (err, stdout, stderr) => {
         console.log(err, stdout, stderr)
         fs.readFile(cdx, 'utf8', (err, value)=> {
            fs.unlink(cdx, err => {
               through.push(value)
               next()
            })
         })
      })
   })


   let cdxToLines = through2.obj(function (item, enc, next) {
      let through = this
      S(item).lines().forEach((line, index) => {
         if (index > 0) {
            through.push(line)
         } else if (!cdxHeaderIncluded) {
            through.push(line)
            cdxHeaderIncluded = true
         }
      })
      next()
   })


   fs.walk(paths.warcs)
      .on('error', (err) => onlyWorf.emit('error', err)) // forward the error on please....
      .pipe(onlyWorf)
      .pipe(worfToCdx)
      .pipe(cdxToLines)
      .pipe(fs.createWriteStream(paths.cdxTemp))
      .on('end', () => {
         child_process.exec(`export LC_ALL=C; sort -u ${paths.cdxTemp} > ${paths.cdx}/index.cdx`, (err, stdout, stderr) => {
            console.log(err, stdout, stderr)

         })
      })


}

