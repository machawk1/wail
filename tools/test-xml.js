import 'babel-polyfill'
import fs from 'fs-extra'
import Promise from 'bluebird'
import S from 'string'
import { encode, compare } from 'bytewise'
import _ from 'lodash'
import feathers from 'feathers/client'
import socketio from 'feathers-socketio/client'
import hooks from 'feathers-hooks'
import io from 'socket.io-client'
import yaml from 'yamljs'


fs.readFile('/home/john/my-fork-wail/bundledApps/pywb/config.yaml','utf8',(err,data) => {
  if(err) {
    console.error(err)
  } else {
    let config = yaml.parse(data)
    console.log(config)
  }
})

// const socket = io('http://localhost:3030')
// const app = feathers()
//   .configure(hooks())
//   .configure(socketio(socket))
//
// const memgator = app.service('/archivesManager')
// // memgator.find().then(data => {
// //   console.log(data)
// // })
//
// memgator.create({ name: 'xyz', existingWarcs: '/home/john/my-fork-wail/archives/*.warc'})
//   .then(data => {
//     console.log(data)
//     process.exit(0)
//   })
//   .catch(err => {
//     console.error(err)
//     process.exit(0)
//   })


// let heritrix = {
//   uri_heritrix: 'https://127.0.0.1:8443',
//   uri_engine: 'https://localhost:8443/engine/',
//   port: '8843',
//   username: 'lorem',
//   password: 'ipsum',
//   login: '-a lorem:ipsum',
//   path: '',
//   jobConf: 'crawler-beans.cxml',
//   jobConfWin: 'crawler-beans-win.cxml',
//   web_ui: 'https://lorem:ipsum@localhost:8443',
//   addJobDirectoryOptions: {
//     method: 'POST',
//     url: 'https://localhost:8443/engine',
//     headers: { 'content-type': 'application/x-www-form-urlencoded' },
//     timeout: 15000,
//     form: {
//       action: 'add',
//       addPath: '',
//     },
//     auth: {
//       username: 'lorem',
//       password: 'ipsum',
//       sendImmediately: false
//     },
//     strictSSL: false,
//     rejectUnauthorized: false,
//     resolveWithFullResponse: true,
//   },
//   sendActionOptions: {
//     method: 'POST',
//     url: 'https://localhost:8443/engine/job/',
//     headers: { 'content-type': 'application/x-www-form-urlencoded' },
//     timeout: 15000,
//     form: {
//       action: ''
//     },
//     auth: {
//       username: 'lorem',
//       password: 'ipsum',
//       sendImmediately: false
//     },
//     strictSSL: false,
//     rejectUnauthorized: false,
//     resolveWithFullResponse: true,
//   },
//   killOptions: {
//     method: 'POST',
//     url: 'https://localhost:8443/engine',
//     timeout: 15000,
//     body: 'im_sure=on&action=exit java process',
//     headers: {
//       'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:47.0) Gecko/20100101 Firefox/47.0',
//       Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
//       'Accept-Language': 'en-US,en;q=0.5',
//       'Connection': 'keep-alive'
//     },
//     auth: {
//       username: 'lorem',
//       password: 'ipsum',
//       sendImmediately: false
//     },
//     strictSSL: false,
//     rejectUnauthorized: false,
//     resolveWithFullResponse: true,
//   },
//   launchJobOptions: {
//     method: 'POST',
//     url: 'https://localhost:8443/engine/job/',
//     timeout: 15000,
//     headers: { 'content-type': 'application/x-www-form-urlencoded' },
//     form: {
//       action: 'launch'
//     },
//     auth: {
//       username: 'lorem',
//       password: 'ipsum',
//       sendImmediately: false
//     },
//     strictSSL: false,
//     rejectUnauthorized: false,
//     resolveWithFullResponse: true,
//   },
//   optionEngine: {
//     method: 'GET',
//     url: 'https://localhost:8443/engine',
//     timeout: 15000,
//     auth: {
//       username: 'lorem',
//       password: 'ipsum',
//       sendImmediately: false
//     },
//     strictSSL: false,
//     rejectUnauthorized: false,
//     resolveWithFullResponse: true,
//   },
//   buildOptions: {
//     method: 'POST',
//     url: 'https://localhost:8443/engine/job/',
//     timeout: 15000,
//     headers: { 'content-type': 'application/x-www-form-urlencoded' },
//     form: {
//       action: 'build'
//     },
//     auth: {
//       username: 'lorem',
//       password: 'ipsum',
//       sendImmediately: false
//     },
//     strictSSL: false,
//     rejectUnauthorized: false,
//     resolveWithFullResponse: true,
//   },
//   reScanJobs: {
//     method: 'POST',
//     url: 'https://localhost:8443/engine',
//     timeout: 5000,
//     headers: { 'content-type': 'application/x-www-form-urlencoded' },
//     form: {
//       action: 'rescan'
//     },
//     auth: {
//       username: 'lorem',
//       password: 'ipsum',
//       sendImmediately: false
//     },
//     strictSSL: false,
//     rejectUnauthorized: false,
//     resolveWithFullResponse: true,
//   }
//
// }
//
// let mutate = S('export JAVA_HOME=/Users/jberlin/WebstormProjects/wail/bundledApps/openjdk; export JRE_HOME=/Users/jberlin/WebstormProjects/wail/bundledApps/openjdk; /Users/jberlin/WebstormProjects/wail/bundledApps/heritrix-3.3.0/bin/heritrix -a lorem:ipsum')
//
// if(mutate.contains('-a lorem:ipsum')) {
//   console.log(mutate.replaceAll('-a lorem:ipsum','-a john:berlin').s)
// }
//

// let usr = 'John'
// let pwd = 'Berlin'
// let nh = _.mapValues(heritrix, (v, k) => {
//
//   // var nv = _.cloneDeep(v)
//   if(_.has(v,'auth')) {
//     console.log(v)
//     let auth = v.auth
//     v.auth.username = 'John'
//     v.auth.password = 'Berlin'
//   }
//
//   return v
// })
//
// nh.username = usr
// nh.password = pwd
// nh.web_ui = S(nh.web_ui).replaceAll(heritrix.username,usr).replaceAll(heritrix.password,pwd).s
// nh.login = S(nh.login).replaceAll(heritrix.username,usr).replaceAll(heritrix.password,pwd).s
//
// _.forOwn(nh,(v,k) => {
//   console.log(k,v)
// })

// import tm from '/home/john/my-fork-wail/wail/test/csodu.timemap.json'

// let it = S('yay')
//
// console.log(it)
//
// it.setValue('')
//
// console.log(it,it.isEmpty())

// let archiveExtractor = named.named()

// cp.exec('/home/john/my-fork-wail/wail/memgators/memgator-linux-amd64 --arcs=/home/john/my-fork-wail/wail/config/archives.json --format=json http://cs.odu.edu',(err, stdout, stderr) => {
//   if(err) {
//     console.error(err)
//   } else {
//     // let tm = JSON.parse()
//     // console.log(tm)
//     fs.writeFile('/home/john/my-fork-wail/wail/test/csodu.timemap.json', stdout,'utf8',(err) =>{
//       if(err){
//         console.error(err)
//       }
//     })
//   }
// })

// require('pretty-error').start()
//
// let opts = {
//   cwd: 'A:\\wail-electron',
//   detached: true,
//   shell: false,
//   stdio: [ 'ignore', 'ignore', 'ignore' ]
// }
//
// fs.readFile('A:\\wail-electron\\bundledApps\\heritrix-3.3.0\\jobs\\1469503104218\\20160726031827\\logs\\progress-statistics.log','utf8', (err, data) => {
//   if(err) {
//     console.error(err)
//   }
//
//   console.log(data)
// })

// import depcheck from 'depcheck'
//
// console.log(util.inspect(depcheck,{depth:null,colors: true}))
//
// const options = {
//   withoutDev: false, // [DEPRECATED] check against devDependencies
//   ignoreBinPackage: false, // ignore the packages with bin entry
//   ignoreDirs: [ // folder with these names will be ignored
//     'sandbox',
//     'dist',
//     'bower_components',
//     'node_modules',
//     '.idea',
//     'archiveIndexes',
//     'archives',
//     'build',
//     'buildResources',
//     'bundledApps',
//     'support',
//     'images',
//     'waillogs',
//     'zips',
//     'memgators',
//     'release',
//     'config'
//   ],
//   ignoreMatches: [ // ignore dependencies that matches these globs
//     'grunt-*',
//     'eslint',
//     'babel'
//   ],
//   parsers: { // the target parsers
//     '*.js': depcheck.parser.es7,
//     '*.jsx?': depcheck.parser.jsx
//   },
//   detectors: [ // the target detectors
//     depcheck.detector.requireCallExpression,
//     depcheck.detector.importDeclaration
//   ],
//   specials: [ // the target special parsers
//     // depcheck.special.eslint,
//     // depcheck.special.babel,
//     // depcheck.special.webpack,
//     depcheck.special.bin,
//     depcheck.special['feross-standard']
//   ],
// }
// depcheck('A:\\wail-electron', options, (unused) => {
//   console.log('unused deps')
//   console.log(util.inspect(unused.dependencies,{depth:null,colors: true}))
//   console.log('---------------------------------------------')
//   console.log('unused dev-deps')
//   console.log(util.inspect(unused.devDependencies,{depth:null,colors: true}))
//   console.log('---------------------------------------------')
//   console.log('missing')
//   console.log(util.inspect(unused.missing,{depth:null,colors: true}))
//   console.log('---------------------------------------------')
//   // console.log(unused.dependencies); // an array containing the unused dependencies
//   // console.log(unused.devDependencies); // an array containing the unused devDependencies
//   // console.log(unused.missing); // an array containing the dependencies missing in `package.json`
//   // console.log(unused.using); // a lookup indicating each dependency is used by which files
//   console.log(unused.invalidFiles); // files that cannot access or parse
//   // console.log(unused.invalidDirs); // directories that cannot access
//   //
//   // console.log(util.inspect(options,{depth:null,colors: true}))
//   // console.log(util.inspect(unused,{depth:null,colors: true}))
// })

// let lines = [
//   '\nwayback.url.scheme.default=http',
//   'wayback.url.host.default=localhost',
//   'wayback.url.port.default=8080',
//   "wayback.basedir=#{ systemEnvironment['WAYBACK_BASEDIR'] ?: '${wayback.basedir.default}' }",
//   "wayback.url.scheme=#{ systemEnvironment['WAYBACK_URL_SCHEME'] ?: '${wayback.url.scheme.default}' }",
//   "wayback.url.host=#{ systemEnvironment['WAYBACK_URL_HOST'] ?: '${wayback.url.host.default}' }",
//   "wayback.url.port=#{ systemEnvironment['WAYBACK_URL_PORT'] ?: '${wayback.url.port.default}' }",
//   "wayback.url.prefix.default=${wayback.url.scheme}://${wayback.url.host}:${wayback.url.port}",
//   "wayback.url.prefix=#{ systemEnvironment['WAYBACK_URL_PREFIX'] ?: '${wayback.url.prefix.default}' }",
//   'wayback.archivedir.1=${wayback.basedir}/files1/',
//   'wayback.archivedir.2=${wayback.basedir}/files2/',
// ]
//
// fs.readFile('/home/john/my-fork-wail/wail/bundledApps/tomcat/webapps/ROOT/WEB-INF/wayback.xml', 'utf8', (err, val)=> {
//   /*
//    'wail.basedir=/Applications/WAIL.app',
//    'wayback.basedir.default=/Applications/WAIL.app/bundledApps/tomcat/webapps/ROOT',
//    */
//   let $ = cheerio.load(val, { xmlMode: true })
//   let config = $('bean[class="org.springframework.beans.factory.config.PropertyPlaceholderConfigurer"]').find('value')
//   let base = path.resolve('./')
//   lines.push(`wail.basedir=${base}`)
//   lines.push(`wayback.basedir.default=${base}/bundledApps/tomcat/webapps/ROOT\n`)
//   console.log(lines)
//   console.log(config.text(lines.join('\n')).text())
//
//   fs.writeFile('/home/john/my-fork-wail/wail/bundledApps/tomcat/webapps/ROOT/WEB-INF/wayback.xml', $.xml(), err => {
//     console.log(err)
//   })
// })

//
// function* sequentialActions(actions) {
//    let index = 0
//    let options = {
//       method: 'POST',
//       url: `https://localhost:8443/engine/job/${12213}`,
//       headers: {
//          Accept: "application/xml",
//          /* 'Content-type': 'application/x-www-form-urlencoded' */ // Set automatically
//       },
//       form: {
//          action: ''
//       },
//       auth: {
//          usr: 'asdas',
//          pass: 'asdas'
//       },
//       resolveWithFullResponse: true,
//    }
//    while(index < actions.length){
//       options.form.action = actions[index++]
//       yield options
//    }
//
//
// }
//
// let actions = sequentialActions(['hi','hello','goodBy'])
// let a
// while(!(a = actions.next()).done){
//    console.log(a)
// }
//
// console.log(typeof actions,actions instanceof  sequentialActions)

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
//             timestap: moment(fields[0]).format("MM/DD/YYYY, h:mm:ssa"),
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
//       let jobsConfs = {}
//       _.forOwn(jobs, jb => {
//          jobsConfs[jb.jobId] = jb.crawlBean
//       })
//      
//      
//     
//    })
//    .on('error', function (err, item) {
//       console.log(err.message)
//       console.log(item.path) // the file the error occurred on
//    })

// // process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
// //
// // let options = {
// //    url: "https://localhost:8443/engine",
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

// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
// var Nightmare = require('nightmare');
// var nightmare = Nightmare({
//     show: true,
//     switches: {
//         'ignore-certificate-errors': true
//     }
// })
//
// /*
//  'username': 'lorem',
//  'password': 'ipsum',
//  https://localhost:8443/engine/
//  */
//
// nightmare
//     .goto('https://lorem:ipsum@localhost:8443/engine/')
//     .wait('#main')
//     .evaluate(function () {
//        return document.querySelector('#main .searchCenterMiddle li a').href
//     })
//     .end()
//     .then(function (result) {
//        console.log(result)
//     })
//     .catch(function (error) {
//        console.error('Search failed:', error);
//     });