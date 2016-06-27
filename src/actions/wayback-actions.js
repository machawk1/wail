import child_process from "child_process"
import rp from "request-promise"
import fs from "fs-extra"
import through2 from "through2"
import path from "path"
import S from "string"
import os from "os"
import del from "del"
import streamSort from "sort-stream2"
import bytewise from "bytewise"
import Promise from 'bluebird'
import wc from "../constants/wail-constants"
import ServiceDispatcher from "../dispatchers/service-dispatcher"
import cheerio from 'cheerio'
import settings from '../settings/settings'

const EventTypes = wc.EventTypes


export function writeWaybackConf() {
   let wayBackConflines = [
      '\nwayback.url.scheme.default=http',
      'wayback.url.host.default=localhost',
      'wayback.url.port.default=8080',
      "wayback.basedir=#{ systemEnvironment['WAYBACK_BASEDIR'] ?: '${wayback.basedir.default}' }",
      "wayback.url.scheme=#{ systemEnvironment['WAYBACK_URL_SCHEME'] ?: '${wayback.url.scheme.default}' }",
      "wayback.url.host=#{ systemEnvironment['WAYBACK_URL_HOST'] ?: '${wayback.url.host.default}' }",
      "wayback.url.port=#{ systemEnvironment['WAYBACK_URL_PORT'] ?: '${wayback.url.port.default}' }",
      "wayback.url.prefix.default=${wayback.url.scheme}://${wayback.url.host}:${wayback.url.port}",
      "wayback.url.prefix=#{ systemEnvironment['WAYBACK_URL_PREFIX'] ?: '${wayback.url.prefix.default}' }",
      'wayback.archivedir.1=${wayback.basedir}/files1/',
      'wayback.archivedir.2=${wayback.basedir}/files2/',
   ]
   let wbConfPath = settings.get('wayBackConf')
   let base = settings.get('base')
   fs.readFile(wbConfPath, 'utf8', (err, val)=> {
      if (err) {
         console.error(err)
      }
      /*
       'wail.basedir=/Applications/WAIL.app',
       'wayback.basedir.default=/Applications/WAIL.app/bundledApps/tomcat/webapps/ROOT',
       */
      let $ = cheerio.load(val, {xmlMode: true})
      let config = $('bean[class="org.springframework.beans.factory.config.PropertyPlaceholderConfigurer"]').find('value')
      wayBackConflines.push(`wail.basedir=${base}`)
      wayBackConflines.push(`wayback.basedir.default=${base}/bundledApps/tomcat/webapps/ROOT${os.EOL}`)
      config.text(wayBackConflines.join(os.EOL))
      fs.writeFile(wbConfPath, $.xml(), err => {
         console.log(err)
      })
   })

}

export function waybackAccesible(forground = true) {
   console.log("checking wayback accessibility")
   let wburi = settings.get('wayback.uri_wayback')
   if (forground) {
      rp({uri: wburi})
         .then(success => {
            console.log("wayback success", success)
            ServiceDispatcher.dispatch({
               type: EventTypes.WAYBACK_STATUS_UPDATE,
               status: true,
            })

         })
         .catch(err => {
            console.log("wayback err", err)
            ServiceDispatcher.dispatch({
               type: EventTypes.WAYBACK_STATUS_UPDATE,
               status: false,
            })
         }).finally(() => console.log("wayback finally"))
   } else {
      return new Promise((resolve, reject)=> {
         rp({uri: wburi})
            .then(success => {
               resolve({status: true})
            })
            .catch(err => {
               resolve({status: false, error: err})
            })
      })
   }

}


export function startWayback() {
   child_process.exec(settings.get('tomcatStart'), (err, stdout, stderr) => {
      console.log(err, stdout, stderr)
   })
}

export function killWayback() {
   child_process.exec(settings.get('tomcatStop'), (err, stdout, stderr) => {
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

   fs.walk(settings.get('warcs'))
      .on('error', (err) => onlyWarf.emit('error', err)) // forward the error on
      .pipe(onlyWarf)
      .on('data', item => {
         console.log(item)
         console.log(item.path)
         console.log(path.basename(item.path))
         index.push(`${path.basename(item.path)}\t${item.path}`)
      })
      .on('end', () => {
         fs.writeFile(settings.get('index'), index.join(os.EOL), 'utf8', err => console.log('done generating path index', err))
      })

}

//implements bytewise sorting of export LC_ALL=C; sort
function unixSort(a, b) {
   return bytewise.compare(bytewise.encode(a), bytewise.encode(b))
}

export function generateCDX() {
   let replace = /.warc+$/g
   let cdxHeaderIncluded = false

   let onlyWorf = through2.obj(function (item, enc, next) {
      if (!item.stats.isDirectory() && path.extname(item.path) === '.warc')
         this.push(item)
      next()
   })

   let cdxp = settings.get('cdx')
   let cdxIndexer = settings.get('cdxIndexer')

   let worfToCdx = through2.obj(function (item, enc, next) {
      let through = this //hope this ensures that this is through2.obj
      let cdx = path.basename(item.path).replace(replace, '.cdx')
      let cdxFile = `${cdxp}/${cdx}`
      child_process.exec(`${cdxIndexer} ${item.path} ${cdxFile}`, (err, stdout, stderr) => {
         console.log('worfToCdx err,stdout,stderr', err, stdout, stderr)
         fs.readFile(cdxFile, 'utf8', (errr, value)=> {
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


   let writeStream = fs.createWriteStream(settings.get('indexCDX'))

   fs.walk(settings.get('warcs'))
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
         del([settings.get('wayback.allCDX'), settings.get('wayback.notIndexCDX')], {force: true})
            .then(paths => console.log('Deleted files and folders:\n', paths.join('\n')))

      })
}

