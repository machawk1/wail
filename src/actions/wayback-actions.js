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

const EventTypes = wc.EventTypes
const Wayback = wc.Wayback
const paths = wc.Paths



export function writeWaybackConf() {
   let wayBackConflines = [
      '\nwayback.url.scheme.default=http',
      'wayback.url.host.default=localhost',
      'wayback.url.port.default=8080',
      "wayback.basedir=#{ systemEnvironment['WAYBACK_BASEDIR'] ?: '${wayback.basedir.default}' }",
      "wayback.url.scheme=#{ systemEnvironment['WAYBACK_URL_SCHEME'] ?: '${wayback.url.scheme.default}' }",
      "wayback.url.host=#{ systemEnvironment['WAYBACK_URL_HOST'] ?: '${wayback.url.host.default}' }",
      "wayback.url.port=#{ systemEnvironment['WAYBACK_URL_PORT'] ?: '${wayback.url.port.default}' }",
      "wayback.url.prefix.default=${wayback.url.scheme}://${wayback.url.host}:${wayback.url.port}" ,
      "wayback.url.prefix=#{ systemEnvironment['WAYBACK_URL_PREFIX'] ?: '${wayback.url.prefix.default}' }",
      'wayback.archivedir.1=${wayback.basedir}/files1/',
      'wayback.archivedir.2=${wayback.basedir}/files2/',
   ]
   fs.readFile(wc.Code.wayBackConf,'utf8',(err,val)=>{
      if(err){
         console.error(err)
      }
      /*
       'wail.basedir=/Applications/WAIL.app',
       'wayback.basedir.default=/Applications/WAIL.app/bundledApps/tomcat/webapps/ROOT',
       */
      let $ = cheerio.load(val,{ xmlMode: true})
      let config = $('bean[class="org.springframework.beans.factory.config.PropertyPlaceholderConfigurer"]').find('value')
      wayBackConflines.push(`wail.basedir=${wc.Paths.base}`)
      wayBackConflines.push(`wayback.basedir.default=${wc.Paths.base}/bundledApps/tomcat/webapps/ROOT\n`)
      config.text(wayBackConflines.join('\n'))
      fs.writeFile(wc.Code.wayBackConf,$.xml(),err => {
         console.log(err)
      })
   })

}

export function waybackAccesible(forground = true) {
   console.log("checking wayback accessibility")
   if (forground) {
      rp({uri: Wayback.uri_wayback})
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
         rp({uri: Wayback.uri_wayback})
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
   let command = `export JAVA_HOME=${wc.Paths.jdk}; export JRE_HOME=${wc.Paths.jre}; sh ${ wc.Paths.tomcatStart}`
   child_process.exec(command, (err, stdout, stderr) => {
      console.log(err, stdout, stderr)
   })
}

export function killWayback() {
   child_process.exec(`sh ${ wc.Paths.tomcatStop}`, (err, stdout, stderr) => {
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


   let worfToCdx = through2.obj(function (item, enc, next) {
      let through = this //hope this ensures that this is through2.obj
      let cdx = path.basename(item.path).replace(replace, '.cdx')
      let cdxFile = `${wc.Paths.cdx}/${cdx}`
      child_process.exec(`${wc.Paths.cdxIndexer} ${item.path} ${cdxFile}`, (err, stdout, stderr) => {
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


   let writeStream = fs.createWriteStream(wc.Paths.indexCDX)

   fs.walk(wc.Paths.warcs)
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
         del([`${wc.Paths.cdx}/*.cdx`, `!${wc.Paths.cdx}/index.cdx`], {force: true})
            .then(paths => console.log('Deleted files and folders:\n', paths.join('\n')))

      })
}

