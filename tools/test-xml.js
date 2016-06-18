// import 'babel-polyfill'
// var realFs = require('fs')
// var gracefulFs = require('graceful-fs')
// gracefulFs.gracefulify(realFs)
// import fs from 'fs-extra'
// import path from 'path'
// import Promise from 'bluebird'
// Promise.promisifyAll(fs)
// import cheerio from 'cheerio'
// import through2 from 'through2'
// import S from 'string'
// import child_process from 'child_process'
// import split2 from 'split2'
// import os from 'os'
// import del from 'del'
// import streamSort from 'sort-stream2'
// import {encode, compare} from 'bytewise'
// import shelljs from 'shelljs'
// import validUrl from 'valid-url'
// import validator from 'validator'
// import keyMirror from 'keymirror'
// import rp from "request-promise"
// import _ from 'lodash'
// import moment from 'moment'
//
// import named from 'named-regexp'
//
// let base = '.'
// const tomcatStart = path.join(path.resolve(base), 'bundledApps/tomcat/bin/startup.sh')
// const tomcatStop = path.join(path.resolve(base), 'bundledApps/tomcat/bin/shutdown.sh')
// const jdkhome = path.join(path.resolve(base), 'bundledApps/openjdk7u80')
// const jrehome = path.join(path.resolve(base), 'bundledApps/openjdk7u80/jre')
// const catalina = path.join(path.resolve(base), 'bundledApps/tomcat/bin/catalina.sh')
// const heritrixJob = path.join(path.resolve(base), 'bundledApps/heritrix-3.2.0/jobs')
//
// const jobLaunch = named.named(/[a-zA-Z0-9-/.]+jobs\/(:<job>\d+)\/(:<launch>\d+)\/logs\/progress\-statistics\.log$/)
// const job = named.named(/[a-zA-Z0-9-/.]+jobs\/(:<job>\d+)/)
//
//
// let jobs = {}
//
// let onlyJobLaunchsProgress = through2.obj(function (item, enc, next) {
//    let didMath = jobLaunch.exec(item.path)
//    if (didMath) {
//       jobs[didMath.capture('job')].log = true
//       jobs[didMath.capture('job')].launch = didMath.capture('launch')
//       jobs[didMath.capture('job')].path = item.path
//       this.push(jobs[didMath.capture('job')])
//    } else {
//       if (item.stats.isDirectory()) {
//          let jid = job.exec(item.path)
//          if (jid) {
//             jobs[jid.capture('job')] = {
//                log: false,
//                jobId: jid.capture('job'),
//                launch: '',
//                path: '',
//                progress: [],
//                crawlBean: fs.readFileSync(`${heritrixJob}/${jid.capture('job')}/crawler-beans.cxml`, "utf8"),
//
//             }
//          }
//       }
//    }
//
//    next()
// })
//
//
// let launchStats = through2.obj(function (item, enc, next) {
//    fs.readFile(item.path, "utf8", (err, data)=> {
//       if (err) throw err
//       // console.log(data)
//       let lines = data.trim().split('\n')
//       let lastLine = S(lines[lines.length - 1])
//
//       if (lastLine.contains('Ended by operator')) {
//          // jobs[item.jobId].progress.ended = true
//          let nextToLast = S(lines[lines.length - 2])
//          let nextLastfields = nextToLast.collapseWhitespace().s.split(' ')
//          jobs[item.jobId].progress.push({
//             ended: true,
//             endedOn: moment(lastLine.collapseWhitespace().s).format("MM/DD/YYYY, h:mm:ssa"),
//             timestap: moment(nextLastfields[0]).format("MM/DD/YYYY, h:mm:ssa"),
//             discovered: nextLastfields[1],
//             queued: nextLastfields[2],
//             downloaded: nextLastfields[3],
//          })
//
//       } else {
//          let fields = lastLine.collapseWhitespace().s.split(' ')
//          jobs[item.jobId].progress.push({
//             ended: false,
//             endedOn: '',
//             timestap: moment(nextLastfields[0]).format("MM/DD/YYYY, h:mm:ssa"),
//             discovered: fields[1],
//             queued: fields[2],
//             downloaded: fields[3],
//          })
//
//       }
//
//    })
//    this.push(item)
//    next()
// })
//
//
// fs.walk(heritrixJob)
//    .pipe(onlyJobLaunchsProgress)
//    .pipe(launchStats)
//    .on('data', item => {
//       return
//    })
//    .on('end', function () {
//       // console.log('end', jobs)
//       // console.log(_.values(jobs))
//       _.forOwn(jobs, jb => console.log(jb))
//    })
//    .on('error', function (err, item) {
//       console.log(err.message)
//       console.log(item.path) // the file the error occurred on
//    })
//
// // process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
// //
// // let options = {
// //    uri: "https://localhost:8443/engine",
// //    'auth': {
// //       'username': 'lorem',
// //       'password': 'ipsum',
// //       'sendImmediately': false
// //    },
// //    transform: body => cheerio.load(body),
// //    rejectUnauthorized: false,
// //    resolveWithFullResponse: true,
// // }
//
// // rp( options)
// //    .then(data=>{
// //       console.log(data)
// //    })
//
// // child_process.exec(`sh ${tomcatStop}`, (err, stdout, stderr) => {
// //    console.log(err, stdout, stderr)
// // })
// //
// // child_process.exec(`export JAVA_HOME=${jdkhome}; export JRE_HOME=${jrehome} ${tomcatStart}`, (err, stdout, stderr) => {
// //    console.log(err, stdout, stderr)
// // })
//
//
// // const consts = {
// //    From: keyMirror({
// //       BASIC_ARCHIVE_NOW: null,
// //       NEW_CRAWL_DIALOG: null,
// //    }),
// //    EventTypes: keyMirror({
// //       HAS_VAILD_URI: null,
// //       GOT_MEMENTO_COUNT: null,
// //       BUILD_CRAWL_JOB: null,
// //       BUILT_CRAWL_CONF: null,
// //       BUILT_CRAWL_JOB: null,
// //       LAUNCHED_CRAWL_JOB: null,
// //       HERITRIX_STATUS_UPDATE: null,
// //       WAYBACK_STATUS_UPDATE: null,
// //    }),
// //    Paths: {
// //       memgator: path.join(path.resolve(base), 'bundledApps/memgator'),
// //       archives: path.join(path.resolve(base), 'config/archives.json'),
// //       heritrix: path.join(path.resolve(base), 'bundledApps/heritrix-3.2.0'),
// //       heritrixBin: path.join(path.resolve(base), 'bundledApps/heritrix-3.2.0/bin/heritrix'),
// //       heritrixJob: path.join(path.resolve(base), 'bundledApps/heritrix-3.2.0/jobs'),
// //       tomcat: path.join(path.resolve(base), 'bundledApps/tomcat'),
// //       tomcatStart: path.join(path.resolve(base), 'bundledApps/tomcat/bin/startup.sh'),
// //       tomcatStop: path.join(path.resolve(base), 'bundledApps/tomcat/bin/shutdown.sh'),
// //       catalina: path.join(path.resolve(base), 'bundledApps/tomcat/bin/catalina.sh'),
// //       warcs: path.join(path.resolve(base), '/archives'),
// //       index: path.join(path.resolve(base), '/config/path-index.txt'),
// //       cdxIndexer: path.join(path.resolve(base), 'bundledApps/tomcat/webapps/bin/cdx-indexer'),
// //       cdx: path.join(path.resolve(base), 'archiveIndexes'),
// //       cdxTemp: path.join(path.resolve(base), 'archiveIndexes/combined_unsorted.cdxt'),
// //       indexCDX: path.join(path.resolve(base), 'archiveIndexes/index.cdx'),
// //
// //    },
// //
// //    Heritrix: {
// //       uri_heritrix: "https://127.0.0.1:8443",
// //       username: 'lorem',
// //       password: 'ipsum',
// //       jobConf: path.join(path.resolve('.'), 'crawler-beans.cxml'),
// //       web_ui: "https://lorem:ipsum@localhost:8443",
// //    },
// //    Wayback: {
// //       uri_tomcat: "http://localhost:8080/",
// //       uri_wayback: "http://localhost:8080/wayback/"
// //    },
// //    Code: {
// //       crawlerBean: path.join(path.resolve('.'), 'crawler-beans.cxml'),
// //       wayBackConf: path.join(path.resolve('.'), 'bundledApps/tomcat/webapps/ROOT/WEB-INF/wayback.xml'),
// //       which: keyMirror({
// //          WBC: null,
// //          CRAWLBEAN: null,
// //       }),
// //    }
// // }
// //
// // console.log(consts)
//
// // const test = 'matkelly.com'
// // console.log("weburi", validator.isURL(test))
//
// // console.log("weburi",validUrl.isWebUri(test))
// // console.log("weburi",validUrl.is_web_uri(test))
// //
// // fs.readFileAsync(path.join(path.resolve('./'),'crawler-beans.cxml'), "utf8")
// //    .then(data => {
// //       let doc = cheerio.load(data,{
// //          xmlMode: true
// //       })
// //        // console.log(doc.xml())
// //        'bean[id="warcWriter"]'
// //        let urls = doc('bean[id="longerOverrides"]')
// //        // console.log(doc.childNodes())
// //        // console.log(root.name())
// //        // console.log(root.text())
// //        console.log(urls.text())
// //        // console.log(urls.xml())
// //
// //    })
// //
// // const base = path.resolve('./')
// // const warcsp = path.join(path.resolve(base), '/archives')
// // const indexp = path.join(path.resolve(base), '/config/path-index.txt')
// // const aIndexp = path.join(path.resolve(base), '/archiveIndexes')
// // const cdxTempp = path.join(path.resolve(base), 'archiveIndexes/combined_unsorted2.cdxt')
// // const indexCDX = path.join(path.resolve(base), 'archiveIndexes/index.cdx')
// // const cdxIndexerp = path.join(path.resolve(base), 'bundledApps/tomcat/webapps/bin/cdx-indexer')
// // const cdxp = path.join(path.resolve(base), 'archiveIndexes')
// // //
// // function generatePathIndex() {
// //    let onlyWarf = through2.obj(function (item, enc, next) {
// //       if (!item.stats.isDirectory() && path.extname(item.path) === '.warc')
// //          this.push(item)
// //       next()
// //    })
// //
// //    let index = []
// //
// //    fs.walk(warcsp)
// //       .on('error', (err) => onlyWarf.emit('error', err)) // forward the error on
// //       .pipe(onlyWarf)
// //       .on('data', item => {
// //          console.log(item)
// //          console.log(item.path)
// //          console.log(path.basename(item.path))
// //          index.push(`${path.basename(item.path)}\t${item.path}`)
// //       })
// //       .on('end', () => {
// //          fs.writeFile(indexp, index.join('\n'), 'utf8', err => console.log('done generating path index', err))
// //       })
// //
// // }
// //
// //
// // function unixSort(a, b) {
// //    return compare(encode(a), encode(b))
// // }
// //
// // function generateCDX() {
// //    let replace = /.warc+$/g
// //    let cdxData = []
// //    let worfs = []
// //    let cdxHeaderIncluded = false
// //
// //    let onlyWorf = through2.obj(function (item, enc, next) {
// //       if (!item.stats.isDirectory() && path.extname(item.path) === '.warc')
// //          this.push(item)
// //       next()
// //    })
// //
// //
// //    let worfToCdx = through2.obj(function (item, enc, next) {
// //       let through = this //hope this ensures that this is through2.obj
// //       let cdx = path.basename(item.path).replace(replace, '.cdx')
// //       // console.log(cdx)
// //       let cdxFile = `${cdxp}/${cdx}`
// //       child_process.exec(`${cdxIndexerp} ${item.path} ${cdxFile}`, (err, stdout, stderr) => {
// //          console.log('cdxIndexerp execution result',err, stdout, stderr)
// //          // through.push(cdxFile)
// //          // next()
// //
// //          fs.readFile(cdxFile, 'utf8', (errr, value)=> {
// //             // console.log('reading cdxFile result',errr)
// //             through.push(value)
// //             next()
// //          })
// //       })
// //    })
// //
// //    let uniqueLines = new Set()
// //
// //
// //    let cdxToLines = through2.obj(function (item, enc, next) {
// //       let through = this
// //       console.log('cdx to lines',item)
// //       S(item).lines().forEach((line, index) => {
// //          if (!uniqueLines.has(line)) {
// //             if (index > 0) {
// //                through.push(line + os.EOL)
// //             } else if (!cdxHeaderIncluded) {
// //                through.push(line + os.EOL)
// //                cdxHeaderIncluded = true
// //             }
// //             uniqueLines.add(line)
// //          }
// //       })
// //       next()
// //    })
// //
// //
// //    // [`${aIndexp}/*.cdx`, `!${aIndexp}/index.cdx`]
// //    let writeStream = fs.createWriteStream(indexCDX)
// //    // let readStream = fs.createWriteStream(cdxTempp)
// //    // del([`${aIndexp}/*.cdx`, `!${aIndexp}/index.cdx`], {force: true}).then(paths => console.log('Deleted files and folders:\n', paths.join('\n')))
// //    // fs.walk(aIndexp)
// //    //    .on('data', item => console.log(item.path))
// //    fs.walk(warcsp)
// //       .on('error', (err) => onlyWorf.emit('error', err)) // forward the error on please....
// //       .pipe(onlyWorf)
// //       .on('error', (err) => worfToCdx.emit('error', err)) // forward the error on please....
// //       .pipe(worfToCdx)
// //       .pipe(cdxToLines)
// //       .pipe(streamSort(unixSort))
// //       .pipe(writeStream)
// //       .on('close', () => {
// //          writeStream.destroy()
// //          console.log('we have closed')
// //          // readStream
// //          // del([`${aIndexp}/*.cdx`, `!${aIndexp}/index.cdx`], {force: true})
// //          //    .then(paths => console.log('Deleted files and folders:\n', paths.join('\n')))
// //
// //       })
// //    //
// //    // child_process.exec(`export LC_ALL=C; sort -u ${cdxTempp} > ${cdxp}/index.cdx`, (err, stdout, stderr) => {
// //    //    console.log('we are ending')
// //    //    console.log(err, stdout, stderr)
// //    //
// //    // })
// //
// //
// // }
// // // generatePathIndex()
// // generateCDX()
//
// // let fileter = (item, enc, next) => {
// //    // console.log(item)
// //    // if(!item.stats.isDirectory())
// //    this.push(item)
// //    next()
// // }
// //
// // let onlyWarc = through2.obj(function (item, enc, next) {
// //    if (!item.stats.isDirectory())
// //       this.push(item)
// //    next()
// // })
// //
// // let onlyWarc2 = through2.obj(function (item, enc, next) {
// //    if (path.extname(item.path) === '.cxml')
// //       this.push(item)
// //    next()
// // })
// //
// //
// // fs.walk('/home/john/my-fork-wail/wail/bundledApps/heritrix-3.2.0/jobs')
// //    .on('error', (err) => onlyWarc.emit('error', err)) // forward the error on
// //    .pipe(onlyWarc)
// //    .pipe(onlyWarc2)
// //    .on('data', item => {
// //       // console.log(item)
// //       console.log(item.path)
// //       console.log(path.basename(item.path))
// //
// //
// //    })
// //
// // var stuff = "My name is JP\nJavaScript is my fav language\r\nWhat is your fav language?"
// // var lines = S(stuff).lines()
// // lines.forEach((line, index)=> {
// //    console.log(line, index)
// // })
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
var Nightmare = require('nightmare');
var nightmare = Nightmare({
    show: true,
    switches: {
        'ignore-certificate-errors': true
    }
})

/*
 'username': 'lorem',
 'password': 'ipsum',
 https://localhost:8443/engine/
 */

nightmare
    .goto('https://lorem:ipsum@localhost:8443/engine/')
    .wait('#main')
    .evaluate(function () {
       return document.querySelector('#main .searchCenterMiddle li a').href
    })
    .end()
    .then(function (result) {
       console.log(result)
    })
    .catch(function (error) {
       console.error('Search failed:', error);
    });