import 'babel-polyfill'
import fs from 'fs-extra'
import Promise from 'bluebird'
import S from 'string'
import {encode, compare} from 'bytewise'
import through2 from 'through2'
import streamSort from 'sort-stream2'
import path from 'path'
import util from 'util'
import shelljs from 'shelljs'
import cp from 'child_process'
import named from 'named-regexp'
import autobind from 'autobind-decorator'
import Esettings from 'electron-settings'
import chokidar from 'chokidar'
import isRunning from 'is-running'
import rp from 'request-promise'
import cheerio from 'cheerio'
import moment from 'moment'
import psTree from 'ps-tree'
// import CrawlStatsManager from '../wail-core/managers/crawlStatsMonitor'


// const base = path.join(path.resolve('.'),'bundledApps/heritrix/jobs/**/progress-statistics.log')
// console.log(base)

// const jobRunningRe = /[a-zA-Z0-9\-:]+\s(?:CRAWL\s((?:RUNNING)|(?:EMPTY))\s-\s)(?:(?:Running)|(?:Preparing))/
// const jobEndingRe = /[a-zA-Z0-9\-:]+\s(?:CRAWL\sEND(?:ING).+)/
// const jobEndRe = /[a-zA-Z0-9\-:]+\s(?:CRAWL\sEND(?:(?:ING)|(?:ED)).+)/
// const jobStatusRec = /(:<timestamp>[a-zA-Z0-9\-:]+)\s+(:<discovered>[0-9]+)\s+(:<queued>[0-9]+)\s+(:<downloaded>[0-9]+)\s.+/
// const jobStatusRe = /([a-zA-Z0-9\-:]+)\s+([0-9]+)\s+([0-9]+)\s+([0-9]+)\s.+/
// let jobStatus = named.named(jobStatusRec)

console.log(path.resolve('/Users/jberlin/WebstormProjects/wail/bundledApps/heritrix/jobs/1473386133521/20160913224309/logs/progress-statistics.log','../../'))
console.log(path.normalize(`/Users/jberlin/WebstormProjects/wail/bundledApps/heritrix/jobs/1473386133521/20160913224309/logs/progress-statistics.log/../../warcs/*.warc`))

// let logWatcher = chokidar.watch(base,{
//   followSymlinks: true,
// })
//
// logWatcher.on('add',path => console.log(`File ${path} has been added`))
// logWatcher.on('change',path => console.log(`File ${path} has been changed`))


// psTree(32516,(err, kids) => {
//   if(err) {
//     console.error(err)
//   } else {
//     console.log(kids)
//     if(kids.length > 0) {
//       console.log('we have length')
//     } else {
//       console.log('we have no length')
//       process.kill(32516, 'SIGTERM')
//     }
//   }
// })


// S.TMPL_CLOSE = '}'
// S.TMPL_OPEN= '{'
// //
// // // // let hpidre = named.named(/[a-zA-z0-9\s:]+\(pid+\s(:<hpid>[0-9]+)\)/)
// // // // let hpidre2 = named.named(/\(pid+\s(:<hpid>[0-9]+)\)/g)
// // // let pather = new Pather(path.resolve('.'))
// // // console.log(util.inspect(pather,{depth: null,colors: true}))
// let configDirPath = path.join('.','waillogs/wail-settings')
//
// let settings = new Esettings({ configDirPath })
// let opts = {
//   cwd: settings.get('warcs')
// }
// let tmplVal = { col: 'ghhhkjlhkj' ,warcs: '/Users/jberlin/WebstormProjects/wail/bundledApps/heritrix/jobs/1473573838942/20160911060401/warcs/*.warc'}
// let tmplVal2 = {col: 'Wail'}
// let command = S(settings.get('pywb.addWarcsToCol')).template(tmplVal).s
// cp.exec(command, opts, (error, stdout, stderr) => {
//   if (error) {
//     console.error(error,stderr,stdout)
//   } else {
//     let c1 = ((stdout || ' ').match(/INFO/g) || []).length
//     let c2 = ((stderr || ' ').match(/INFO/g) || []).length
//     let count = c1 === 0 ? c2 : c1
//
//     console.log('added warcs to collection iy',count)
//     console.log('stdout', stdout)
//     console.log('stderr', stderr)
//   }
//
// })

//
// let opts = {
//   cwd: settings.get('warcs')
// }
//
// cp.exec(command,opts,(error,stdout,stderr) => {
//   if (error) {
//     console.error(`exec error: ${error}`)
//     console.log(`stdout: ${stdout}`)
//     console.log(`stderr: ${stderr}`)
//     return
//   }
//
//   console.log(`stdout: ${stdout}`)
//   console.log(`stderr: ${stderr}`)
// })

// var hStart
// if (process.platform === 'darwin') {
//   hStart = settings.get('heritrixStartDarwin')
// } else {
//   hStart = settings.get('heritrixStart')
// }
// cp.exec(hStart, (err, stdout, stderr) => {
//   if (err) {
//     console.error('heritrix could not be started due to an error', err, stderr, stdout)
//   } else {
//     console.log(stdout, stderr)
//   }
// })

// let opts = {
//   transform: (body) => cheerio.load(body),
//   uri: `${settings.get('pywb.url')}Wail/*/http://cs.odu.edu`
// }
// rp(opts)
//   .then(response => {
//     // POST succeeded...
//     console.log(response.html())
//
//   })
//   .catch(err => {
//     console.log('error in querying wayback', err)
//   })
// let opts = {
//   cwd: settings.get('pywb.home'),
//   shell: false,
//   detached: true,
//   stdio:  ['ignore', 'ignore', 'ignore']
// }
// let exec = settings.get('pywb.wayback')
// let wayback = cp.spawn(exec, [ '-d', settings.get('warcs') ], opts)
// console.log('wayback pid',wayback.pid)
// wayback.unref()

// let hStart = settings.get('heritrixStart')
// let ret = hpidre.exec('Thu Sep  1 00:19:14 EDT 2016 Heritrix starting (pid 24256)')
// console.log(ret)
// cp.exec(hStart, (err, stdout, stderr) => {
//   // console.log(hStart)
//   if (err) {
//
//   } else {
//     let soutLines = S(stdout).lines()
//     let pidLine = soutLines[ 0 ]
//     let maybepid = hpidre.exec(pidLine)
//     if (maybepid) {
//       let pid = maybepid.capture('hpid')
//       console.log(pidLine, pid)
//       let mbp2 = hpidre2.exec(stdout)
//       if(mbp2) {
//         console.log('global found',mbp2)
//       }
//     } else {
//       console.log('fail')
//       console.log(pidLine)
//       console.log(soutLines)
//
//     }
//   }
//
//   // console.log('stdout',stdout)
// })
// let heritrixPath = settings.get('heritrix.path')
// let opts = {
//   env: {
//     JAVA_HOME: settings.get('jdk'),
//     JRE_HOME: settings.get('jre'),
//     HERITRIX_HOME: heritrixPath
//   },
//   shell: true,
//   stdio: [ 'ignore', 'ignore', 'ignore' ]
// }
// let heritrix = cp.spawn('/home/john/wail/bundledApps/heritrix/bin/heritrix',['-a', 'lorem:ipsum'],opts)
//
// heritrix.on('data', (data) => {
//   console.log(`stdout: ${data}`)
// })
//
// heritrix.on('data', (data) => {
//   console.log(`stderr: ${data}`)
// })
//
// heritrix.on('close', (code) => {
//   console.log(`child process exited with code ${code}`)
// })

// const pathMan = new Pather(path.resolve('.'))
//
// // let here = path.resolve('.')
// // console.log(pathMan.base,pathMan.normalizeJoin('it/aswell'))
// let opts = {
//   cwd: pathMan.join('bundledApps/pywb')
//   // detached: true,
//   // shell: true,
//   // stdio: [ 'ignore', 'ignore', 'ignore' ]
// }
// //
// let wayback = cp.spawn(pathMan.join('bundledApps/pywb/wayback'),['-d',pathMan.join('archives')], opts)
// wayback.stdout.on('data', (data) => {
//   console.log(`stdout: ${data}`)
// })
//
// wayback.stderr.on('data', (data) => {
//   console.log(`stderr: ${data}`)
// })

// mongodb_prebuilt.start_server({
//   version: "3.2.9",
//   auto_shutdown: false,
//   args: {
//     logpath: path.join(path.resolve('.'),'waillogs/mongodb-prebuilt.log'),
//     dbpath: path.join(path.resolve('.'),'database')
//   }
// }, function(err) {
//   if (err) {
//     console.log('mongod didnt start:', err);
//   } else {
//     console.log('mongod is started');
//   }
// })

// let ret = shelljs.ls(`/Users/jberlin/WebstormProjects/wail/archives/*.warc`)
// ret.forEach(warc => {
//   console.log(warc)
//   console.log('--------------')
// })

//
// let managed = {
//   port: '8080',
//   url: 'http://localhost:{port}/',
//   newCollection: 'bundledApps/pywb/wb-manager init {col}',
//   addWarcsToCol: 'bundledApps/pywb/wb-manager add {col} {warcs}',
//   addMetadata: 'bundledApps/pywb/wb-manager metadata {col} --set {metadata}',
//   reindexCol: 'bundledApps/pywb/wb-manager reindex {col}',
//   convertCdx: 'bundledApps/pywb/wb-manager convert-cdx {cdx}',
//   autoIndexCol: 'bundledApps/pywb/wb-manager autoindex {col}',
//   autoIndexDir: 'bundledApps/pywb/wb-manager autoindex {dir}',
//   sortedCombinedCdxj: 'bundledApps/pywb/cdx-indexer --sort -j combined.cdxj {warcs}',
//   sortedCombinedCdx: 'bundledApps/pywb/cdx-indexer --sort combined.cdx {warcs}',
//   cdxjPerColWarc: 'bundledApps/pywb/cdx-indexer --sort -j {cdx} {warc}',
//   cdxPerColWarc: 'bundledApps/pywb/cdx-indexer --sort {cdx} {warc}',
//   wayback: 'bundledApps/pywb/wayback',
//   waybackPort: 'bundledApps/pywb/wayback -p {port}',
//   waybackReplayDir: 'bundledApps/pywb/wayback -d {dir}',
//   waybackReplayDirPort: 'bundledApps/pywb/wayback -p {port} -d {dir}'
// }
//
// S.TMPL_OPEN = '{'
// S.TMPL_CLOSE = '}'
//
// let pywb = _.mapValues(managed,(v,k) => {
//   console.log(v,k)
//   if(k !== 'port' && k !== 'url') {
//     v = path.normalize(path.join('/home/john/my-fork-wail', v))
//   }
//   if(k === 'url') {
//     v = S(v).template({port: managed.port}).s
//   }
//   return v
// })
//
// console.log(pywb)

// const socket = io('http://localhost:3030', { pingTimeout: 120000,timeout: 120000  })
// const app = feathers()
//   .configure(hooks())
//   .configure(socketio(socket, { pingTimeout: 120000,timeout: 120000  }))
//
//
// const memgator = app.service('/archivesManager')
// memgator.update('xyz' , { existingWarcs: '/Users/jberlin/WebstormProjects/wail/archives/*.warc'}, { query: {action: 'addWarcs' } })
//   .then(data => {
//     console.log(data)
//     process.exit(0)
//   })
//   .catch(error => {
//     console.error(error)
//     process.exit(0)
//   })
// memgator.find({}).then(data => {
//   console.log(data)
//   memgator.create({ name: 'xyz' })
//     .then(created => {
//       console.log(created)
//       process.exit(0)
//
//     })
//     .catch(err => {
//       console.error(err)
//       process.exit(0)
//     })
//
// })
//   .catch(error => {
//     console.error(error)
//     process.exit(0)
//   })

// console.log(path.join(path.resolve('.'),'database'))

// let it = mongodb_prebuilt.start_server({
//   version: "3.2.9",
//   auto_shutdown: false,
//   args: {
//     logpath: path.join(path.resolve('.'),'waillogs/mongodb-prebuilt.log'),
//     dbpath: path.join(path.resolve('.'),'database')
//   }
// },function (err) {
//   if (err) {
//     console.log('mongod didnt start:', err)
//   } else {
//     console.log('mongod is started')
//   }
// })
//
// console.log(it)
//

//
//
// memgator.update('xyz',{ metadata: ['title="Test"','description="Makeing sure this works"']},{query: {action: 'addMetadata'}})
//   .then(data => {
//     console.log(data)
//     process.exit(0)
//   })
//   .catch(error => {
//     console.error(error)
//     process.exit(0)
//   })

//
// let managed = {
//   port: '8080',
//   url: 'http://localhost:{port}/',
//   newCollection: 'bundledApps/pywb/wb-manager init {col}',
//   addWarcsToCol: 'bundledApps/pywb/wb-manager add {col} {warcs}',
//   addMetadata: 'bundledApps/pywb/wb-manager metadata {col} --set {metadata}',
//   reindexCol: 'bundledApps/pywb/wb-manager reindex {col}',
//   convertCdx: 'bundledApps/pywb/wb-manager convert-cdx {cdx}',
//   autoIndexCol: 'bundledApps/pywb/wb-manager autoindex {col}',
//   autoIndexDir: 'bundledApps/pywb/wb-manager autoindex {dir}',
//   sortedCombinedCdxj: 'bundledApps/pywb/cdx-indexer --sort -j combined.cdxj {warcs}',
//   sortedCombinedCdx: 'bundledApps/pywb/cdx-indexer --sort combined.cdx {warcs}',
//   cdxjPerColWarc: 'bundledApps/pywb/cdx-indexer --sort -j {cdx} {warc}',
//   cdxPerColWarc: 'bundledApps/pywb/cdx-indexer --sort {cdx} {warc}',
//   wayback: 'bundledApps/pywb/wayback',
//   waybackPort: 'bundledApps/pywb/wayback -p {port}',
//   waybackReplayDir: 'bundledApps/pywb/wayback -d {dir}',
//   waybackReplayDirPort: 'bundledApps/pywb/wayback -p {port} -d {dir}'
// }
//
// S.TMPL_OPEN = '{'
// S.TMPL_CLOSE = '}'
//
// let pywb = _.mapValues(managed,(v,k) => {
//   console.log(v,k)
//   if(k !== 'port' && k !== 'url') {
//     v = path.normalize(path.join('/home/john/my-fork-wail', v))
//   }
//   if(k === 'url') {
//     v = S(v).template({port: managed.port}).s
//   }
//   return v
// })
//
// console.log(pywb)
