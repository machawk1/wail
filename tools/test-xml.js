const moment = require('moment')
// require('moment-precise-range-plugin')
const EventEmitter = require('eventemitter3')
const DB = require('nedb')
const _ = require('lodash')
const util = require('util')
const Immutable = require('immutable')
const Promise = require('bluebird')
const S = require('string')
const cp = require('child_process')
const fs = require('fs-extra')
const through2 = require('through2')
const prettyBytes = require('pretty-bytes')
const path = require('path')
const schedule = require('node-schedule')
const Twit = require('twit')
const request = require('request')
const progress = require('request-progress')
const prettyMs = require('pretty-ms')
const prettySeconds = require('pretty-seconds')
const Rx = require('rxjs')
const delay = require('lodash/delay')
// */5 * * * *
// const Twit = require('twit')
//
const inspect = _.partialRight(util.inspect, {depth: null, colors: true})
let toMove = '/home/john/my-fork-wail/archives2/*'
let moveWhere = '/home/john/Documents/WAIL_ManagedCollections/'

const iterb = function* () {
  yield 6
  yield 7
  yield 8
  yield 9
  yield 10
}

const iterBIter = iterb()

const iter = function * () {
  yield 1
  yield 2
  yield 3
  yield 4
  yield 5
  yield * iterBIter
}()
// const pumpProgress = Rx.Observable.fromEvent(monitorEvent, 'progress')
//
// pumpProgress.subscribe(({ time: { elapsed, remaining }, percent, speed, size: { total, transferred } }) => {
//   console.log(`Time Elapsed ${prettySeconds(elapsed)}. Time Remaining ${remaining === null ? 'infinity' : prettySeconds(remaining)}`)
//   console.log(`Percent downloaded ${percent * 100}%`)
//   console.log(`Download speed ${prettyBytes(speed === null ? 0 : speed)}/s`)
//   console.log(`Total Size ${prettyBytes(total)}. Have ${prettyBytes(transferred)}`)
const jdkDLOpts = {
  saveLoc: 'jdk-osx.dmg',//'/tmp/java7.dmg',
  url: 'http://matkelly.com/wail/support/jdk-7u79-macosx-x64.dmg'
}



// const dlOb = Rx.Observable.merge(
//   Rx.Observable.fromEvent(dler, 'progress'),
//   Rx.Observable.fromEvent(dler, 'error'),
//   Rx.Observable.fromEvent(dler, 'finished')
// ).subscribe(value => console.log('value', value))
//
//
// dler.start()
// const progressMonitor = Rx.Observable.fromEvent(dler, 'progress')
// const errorMonitor = Rx.Observable.fromEvent(dler, 'error')
// const finishMonitor = Rx.Observable.fromEvent(dler, 'finished')
//
// progressMonitor.subscribe((prog) => console.log(inspect(prog)))

// const monitorEvent = progress(request('http://matkelly.com/wail/support/jdk-7u79-macosx-x64.dmg'), {
//   // throttle: 2000,                    // Throttle the progress event to 2000ms, defaults to 1000ms
//   // delay: 1000,                       // Only start to emit after 1000ms delay, defaults to 0ms
//   // lengthHeader: 'x-transfer-length'  // Length header to use, defaults to content-length
// }).on('error', function (err) {
//   // Do something with err
//   console.log('error happened')
// })
//   .on('end', function () {
//     // Do something after request finishes
//     console.log('done downloading')
//   })
//   .pipe(fs.createWriteStream('jdk-osx.dmg'))
//
// const pumpProgress = Rx.Observable.fromEvent(monitorEvent, 'progress')
//
// pumpProgress.subscribe(({ time: { elapsed, remaining }, percent, speed, size: { total, transferred } }) => {
//   console.log(`Time Elapsed ${prettySeconds(elapsed)}. Time Remaining ${remaining === null ? 'infinity' : prettySeconds(remaining)}`)
//   console.log(`Percent downloaded ${percent * 100}%`)
//   console.log(`Download speed ${prettyBytes(speed === null ? 0 : speed)}/s`)
//   console.log(`Total Size ${prettyBytes(total)}. Have ${prettyBytes(transferred)}`)
// })

// progress(request('http://matkelly.com/wail/support/jdk-7u79-macosx-x64.dmg'), {
//   // throttle: 2000,                    // Throttle the progress event to 2000ms, defaults to 1000ms
//   // delay: 1000,                       // Only start to emit after 1000ms delay, defaults to 0ms
//   // lengthHeader: 'x-transfer-length'  // Length header to use, defaults to content-length
// }).on('progress', function (state) {
//   // The state is an object that looks like this:
//   // {
//   //     percent: 0.5,               // Overall percent (between 0 to 1)
//   //     speed: 554732,              // The download speed in bytes/sec
//   //     size: {
//   //         total: 90044871,        // The total payload size in bytes
//   //         transferred: 27610959   // The transferred payload size in bytes
//   //     },
//   //     time: {
//   //         elapsed: 36.235,        // The total elapsed seconds since the start (3 decimals)
//   //         remaining: 81.403       // The remaining seconds to finish (3 decimals)
//   //     }
//   // }
//   let {time: {elapsed, remaining}, percent, speed, size: {total, transferred}} = state
//   console.log(`Time Elapsed ${prettySeconds(elapsed)}. Time Remaining ${remaining === null ? 'infinity' : prettySeconds(remaining)}`)
//   console.log(`Percent downloaded ${percent * 100}%`)
//   console.log(`Download speed ${prettyBytes(speed === null ? 0 : speed)}/s`)
//   console.log(`Total Size ${prettyBytes(total)}. Have ${prettyBytes(transferred)}`)
// })
//   .on('error', function (err) {
//     // Do something with err
//     console.log('error happened')
//   })
//   .on('end', function () {
//     // Do something after request finishes
//     console.log('done downloading')
//   })
//   .pipe(fs.createWriteStream('jdk-osx.dmg'))

// const archives = new DB({
//   filename: '/home/john/my-fork-wail/dev_coreData/database (copy)/archives2.db',
//   autoload: true
// })
// const makeRequest = () => {
//   const signIn = {
//     consumer_key: "K1y1GmSdDfUmBNMJeX1lf8Ono",
//     consumer_secret: "Ksd87lVkQWRVeXUIYjqqPF7mfUZuRq1aU1fgAFJHdDz3AY7NTY",
//     access_token: "4844579470-y1a1kQePvEohKDp8RDfESX1whNRhlTm856JHWn3",
//     access_token_secret: "46R2ynfMC8CmHzsd76UReneRGcPbuOaPAIhZVeMLKZD2f",
//     timeout_ms: 60 * 1000,
//   }
// //
//   const twit = new Twit(signIn)
// //
//   twit.get('statuses/user_timeline', { screen_name: 'machawk1', count: 200 })
//     .then(result => {
//       let { data } = result
//       console.log(inspect(data))
//       fs.writeJson('mytl.json', data, er => console.log(er))
//     })
//     .catch(error => {
//       console.log('error')
//       console.error(error)
//     })
// }
// let text = 'Any text editor that can edit WARCs w/o corrupting them? @emacs @sublimehq &amp; @atomeditor md5s don\'t match w/ 1 char swap, save, revert, save'
//
// const fuzzy = require('fuzzy')
// const Fuze = require('fuse.js')
// const JsSearch = require('js-search')
//
// class TextSearch {
//   constructor (lookFor) {
//     this._search = new JsSearch.Search('id_str')
//     this._search.addIndex('text')
//     this._lookFor = lookFor
//   }
//
//   arrayStrategy () {
//     let found = []
//     let fIds = new Set()
//     this._lookFor.forEach(lf => {
//       this._search.search(lf).forEach(tweet => {
//         if (!fIds.has(tweet.id_str)) {
//           found.push(`https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`)
//           fIds.add(tweet.id_str)
//         }
//       })
//     })
//     return found
//   }
//
//   termStrategy () {
//     let found = []
//     let fIds = new Set()
//     this._search.search(this._lookFor).forEach(tweet => {
//       if (!fIds.has(tweet.id_str)) {
//         found.push(`https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`)
//         fIds.add(tweet.id_str)
//       }
//     })
//     return found
//   }
//
//   searchTweets (tweets) {
//     this._search.documents_ = []
//     this._search.addDocuments(tweets)
//     if (Array.isArray(this._lookFor)) {
//       return this.arrayStrategy()
//     } else {
//       return this.termStrategy()
//     }
//
//   }
// }
//
// fs.readJSON('mytl.json', (err, json) => {
//
//
//   // json.map((tweets, i) => {
//   //
//   // })
//   // let tweets = _.map(json, tweet => {
//   //   // keys[ tweet.id_str ] = {
//   //   //   url: `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`
//   //   // }
//   //   console.log(fuzzy.match('emacs', tweet.text))
//   //   return {
//   //     id: tweet.id_str,
//   //     url: `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`,
//   //     text: tweet.text
//   //   }
//   // })
//   // let fuze = new Fuze(tweets, {
//   //   keys: [ 'text' ],  shouldSort: true,
//   //   tokenize: true,
//   //   threshold: 0.6,
//   // })
//   let search = new TextSearch('emacs')
//   console.log(search.searchTweets(json))
//
// })
// const fuzzyFilter = (searchText, key) => {
//   const compareString = key.toLowerCase()
//   searchText = searchText.toLowerCase()
//
//   let searchTextIndex = 0
//   for (let index = 0; index < searchText.length; index++) {
//     if (compareString[ index ] === searchText[ searchTextIndex ]) {
//       searchTextIndex += 1
//     }
//   }
//
//   return searchTextIndex === searchText.length
// }
//
// const fuzzy = require('fuzzy')
//
// console.log(text.indexOf('emacs'))
// console.log(fuzzy.match('emacs',text))

// const changeColLocs = () => {
//   const archives = new DB({
//     filename: '/home/john/my-fork-wail/dev_coreData/database/archives.db',
//     autoload: true
//   })
//
//   const seeds = new DB({
//     filename: '/home/john/my-fork-wail/dev_coreData/database/archiveSeeds.db',
//     autoload: true
//   })
//
//   let changeKeys = [
//     'colpath',
//     'archive',
//     'indexes',
//   ]
//
//   let from = '/home/john/my-fork-wail/archives2/'
//
//   archives.findAsync({})
//     .then(docs => {
//       let nDocs = docs.map(doc =>
//         _.mapValues(doc, (v, k) => {
//           if (changeKeys.includes(k)) {
//             return S(v).replaceAll(from, moveWhere).s
//           } else {
//             return v
//           }
//         })
//       )
//       console.log(inspect(nDocs))
//       return archives.removeAsync({}, { multi: true })
//         .then(() => archives.insertAsync(nDocs)
//           .then(() => {
//             console.log('done')
//           })
//           .catch(error => {
//             console.error('inserting failed', error)
//           })
//         ).catch(error => {
//           console.error('removing faild', error)
//         })
//     })
//     .catch(error => {
//       console.error(error)
//     })
// }
//
// let p2 = '/home/john/my-fork-wail/bundledApps/warcChecker/warcChecker -d /home/john/Documents/WAIL_ManagedCollections/collections/Wail'
// let p = '/home/john/my-fork-wail/bundledApps/listUris/listUris -d /home/john/Documents/WAIL_ManagedCollections/collections/Wail'
//
// class WarcUtilError extends Error {
//   constructor (oError, where) {
//     super()
//     Object.defineProperty(this, 'name', {
//       value: this.constructor.name
//     })
//     this.oError = oError
//     this.where = where
//     Error.captureStackTrace(this, WarcUtilError)
//   }
// }
//
// const extractSeed = exePath =>
//   new Promise((resolve, reject) => {
//     cp.exec(exePath, (error, stdout, stderr) => {
//       if (error) {
//         console.error(error)
//         console.log(stdout, stderr)
//         return reject(new WarcUtilError(error, 'executing'))
//       } else {
//         let extractedSeeds
//         try {
//           extractedSeeds = JSON.parse(stdout)
//         } catch (e) {
//           return reject(new WarcUtilError(e, 'parsing json'))
//         }
//         console.log(inspect(extractedSeeds))
//         resolve(extractedSeeds)
//       }
//     })
//   })
//
// const warcRenamer = badWarc =>
//   new Promise((resolve, reject) => {
//     let newName = `${badWarc.filep}.invalid`
//     fs.rename(badWarc.filep, newName, err => {
//       if (err) {
//         return reject(err)
//       }
//       badWarc.filep = newName
//       resolve(badWarc)
//     })
//   })
//
// const renameBadWarc = hadErrors => Promise.map(hadErrors, warcRenamer, { concurrency: 1 })
//
// //-d /home/john/my-fork-wail/archives2/collections/Wail/archive
// const isWarcValid = checkPath =>
//   new Promise((resolve, reject) => {
//     cp.exec(checkPath, (error, stdout, stderr) => {
//       if (error) {
//         console.error(error)
//         console.log(stdout, stderr)
//         return reject(new WarcUtilError(error, 'executing'))
//       } else {
//         let extractedSeeds
//         try {
//           extractedSeeds = JSON.parse(stdout)
//         } catch (e) {
//           return reject(new WarcUtilError(e, 'parsing json'))
//         }
//         console.log(inspect(extractedSeeds))
//         resolve(extractedSeeds)
//       }
//     })
//   })

// extractSeed(p)
//   .then(seeds => {
//     if (seeds.hadErrors.length > 0) {
//       console.log(inspect(seeds.hadErrors))
//       Promise.map(seeds.hadErrors, renameBadWarc, { concurrency: 1 })
//         .each(reNamedWarc => {
//           console.log(reNamedWarc)
//         })
//         .catch(error => {
//           console.error('error while renmaing warcs')
//           console.error(error)
//         })
//     }
//   })
//   .catch(ExtractSeedError, ese => {
//     console.log(ese)
//   })
//   .catch(error => {
//     console.log('error normal', error)
//   })

// let theDur = { val: 5, what: 'minutes' }
//
// let times = [ { val: 5, what: 'minutes' },
//   { val: 10, what: 'minutes' },
//   { val: 15, what: 'minutes' },
//   { val: 20, what: 'minutes' },
//   { val: 25, what: 'minutes' },
//   { val: 30, what: 'minutes' },
//   { val: 35, what: 'minutes' },
//   { val: 40, what: 'minutes' },
//   { val: 45, what: 'minutes' },
//   { val: 50, what: 'minutes' },
//   { val: 55, what: 'minutes' },
//   { val: 1, what: 'hours' },
//   { val: 2, what: 'hours' },
//   { val: 3, what: 'hours' },
//   { val: 4, what: 'hours' },
//   { val: 5, what: 'hours' },
//   { val: 6, what: 'hours' },
//   { val: 7, what: 'hours' },
//   { val: 8, what: 'hours' },
//   { val: 9, what: 'hours' },
//   { val: 10, what: 'hours' } ]
//
// const buildRecurrenceRule = (dur) => {
//   let now = moment()
//   let rule = new schedule.RecurrenceRule()
//   let increase = moment().add(dur.val, dur.what).add(2, 'minutes')
//
//   if (increase.day() > now.day()) {
//     console.log('we have moved to the next day')
//     console.log(now.format('MMM DD YYYY h:mm:s:SSa'))
//     console.log(increase.format('MMM DD YYYY h:mm:s:SSa'))
//   } else {
//     if (increase.hour() > now.hour()) {
//       console.log('we have moved to next hour')
//       console.log(now.format('MMM DD YYYY h:mm:s:SSa'))
//       console.log(increase.format('MMM DD YYYY h:mm:s:SSa'))
//     }
//   }
// }
//
// const buildRecurrenceRule2 = (dur) => {
//   let start = new Date(Date.now())
//   return {
//     start,
//     stop: new Date(start.getTime() + moment.duration(dur.val, dur.what).asMilliseconds()),
//     rule: '*/2 * * * *'
//   }
// }
// // const parser = require('cron-parser')
//
// class Job {
//   constructor (dur, execute, onStop) {
//     this.stopWhen = moment().add(dur.val, dur.what).startOf('minute')
//     this.timer = moment.duration(1, 'm')
//       .timer({ loop: true }, () => {
//         execute()
//         if (moment().isSameOrAfter(this.stopWhen)) {
//           this.timer.stop()
//           onStop()
//         }
//       })
//   }
//
//   start () {
//     this.timer.start()
//   }
//
//   stop () {
//     this.timer.stop()
//   }
//
//   isStoped () {
//     return this.timer.isStoped()
//   }
//
// }
//
// // let count = 0
// const execute = () => {
//   count += 1
//   console.log('1 miniutes has happened', count)
//   console.log(moment().format('MMM DD YYYY h:mm:sa'))
// }
//
// const onStop = () => {
//   console.log('Stopping', moment().format('MMM DD YYYY h:mm:sa'))
// }
// let j = new Job(theDur, execute, onStop)
// j.start()

// let rule = new schedule.RecurrenceRule()
// rule.minute = [ 0, new schedule.Range(5, 55, 5) ]
// console.log(rule)
// let rule = buildRecurrenceRule(theDur)
// let start = new Date(Date.now())
// let interval = parser.parseExpression('0 */2 * * * *', {
//   currentDate: start,
//   endDate: new Date(start.getTime() + moment.duration(5, theDur.what).asMilliseconds()),
//   iterator: true
// })
//
// let next = interval.next()
// while (!next.done) {
//   console.log(next.value.toString())
//   next = interval.next()
// }
//
// let rule = buildRecurrenceRule(theDur)

// console.log(rule.start.toLocaleString())
// console.log(rule.stop.toLocaleString())
//

// process.on('SIGTERM',() => {
//   console.log('by')
//   job.cancel()
// })
//
// process.on('SIGINT',() => {
//   console.log('by')
//   job.cancel()
// })

//
// const selectFriendDets = user => ({
//   name: user.name,
//   screen_name: user.screen_name,
//   link: `https://twitter.com/${user.screen_name}`,
//   user_id: user.id_str,
//   profile_image: user.profile_image_url
// })
//
// const urlToTweet = tweet => `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`
//
//

// fs.readFile('cshtml.html', 'utf8', (err, data) => {
//   console.log()
//   statBody('http://odu.edu/compsci', data)
//
// })

// fs.readFile('yt.html', 'utf8', (err, data) => {
//   console.log()
//   statBody('https://www.youtube.com/watch?v=lEVY8ZRsxvI', data)
// })
// const inpect = _.partialRight(util.inspect, { depth: null, colors: true })

// Promise.promisifyAll(fs)
// const lunr = require('lunr')
// const buildIdx = () => {
//   const tp = path.resolve('.', 'tweets.json')
//   fs.readJSONAsync(tp)
//     .then(tweets => {
//       // 'https://twitter.com/Galsondor/status/800512053156974596'
//       let myIdx = lunr(function () {
//         this.ref('id_str')
//         this.field('hashtags')
//         this.field('text')
//       })
//       let snameToTweet = {}
//       tweets.forEach(tweet => {
//         snameToTweet[ tweet.id_str ] = {
//            tweet.user.screen_name,
//            tweet.id_str,
//           text: tweet.text,
//           hashtags: tweet.entities.hashtags.map(ht => ht.text)
//         }
//         let doc = {
//            snameToTweet[ tweet.id_str ].id_str,
//           text: snameToTweet[ tweet.id_str ].text,
//           hashtags: snameToTweet[ tweet.id_str ].hashtags
//         }
//
//         myIdx.add(doc)
//         // console.log(`https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`)
//         // if (tweet.entities.hashtags.length > 0) {
//         //   console.log(inspect(tweet))
//         // }
//         console.log('------------------------------------------')
//       })
//       fs.writeJson('idx.json', { idTt: snameToTweet, idx: myIdx })
//     })
//     .catch(error => {
//       console.error(error)
//     })
// }
//
// const tp = path.resolve('.', 'idx.json')
// fs.readJSONAsync(tp)
//   .then(midx => {
//     // 'https://twitter.com/Galsondor/status/800512053156974596'
//     let { idTt, idx } = midx
//     // console.log(idTt)
//     let myIdx = lunr.Index.load(idx)
//     _.orderBy(myIdx.search('Trump'), [ 'score' ], [ 'desc' ])
//       .forEach(ret => {
//         console.log(ret)
//         console.log(idTt[ ret.ref ].text)
//       })
//     // console.log(inspect())
//     // let snameToTweet = {}
//     // tweets.forEach(tweet => {
//     //   snameToTweet[ tweet.id_str ] = tweet.user.screen_name
//     //   let doc = {
//     //      tweet.id_str,
//     //     text: tweet.text,
//     //     hashtags: tweet.entities.hashtags.map(ht => ht.text)
//     //   }
//     //
//     //   myIdx.add(doc)
//     //   // console.log(`https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`)
//     //   // if (tweet.entities.hashtags.length > 0) {
//     //   //   console.log(inspect(tweet))
//     //   // }
//     //   console.log('------------------------------------------')
//     // })
//     // fs.writeJson('idx.json', { nTt: snameToTweet, idx: myIdx })
//   })
//   .catch(error => {
//     console.error(error)
//   })

// const { CollectionEvents } = {
//   CollectionEvents: keyMirror({
//     GOT_ALL_COLLECTIONS: null,
//     CREATED_COLLECTION: null,
//     ADD_METADATA_TO_COLLECTION: null,
//     ADDED_WARCS_TO_COLL: null,
//   })
// }
//
// const vals = Object.values(CollectionEvents)
// const colActions = new Set(vals)
// var suite = new Benchmark.Suite()
//
// // add tests
// suite.add('Array#indexOf#found', function () {
//   vals.indexOf('ADDED_WARCS_TO_COLL')
// }).add('Array#indexOf#notfound', function () {
//   vals.indexOf('xyz')
// }).add('Array#includes#found', function () {
//   vals.includes('ADDED_WARCS_TO_COLL')
// }).add('Array#includes#notfound', function () {
//   vals.includes('xyz')
// })
//   .add('Set#has#found', function () {
//     colActions.has('ADDED_WARCS_TO_COLL')
//   }).add('Set#has#notFound', function () {
//   colActions.has('xyz')
// })
// // add listeners
//   .on('cycle', function (event) {
//     console.log(String(event.target));
//   })
//   .on('complete', function () {
//     console.log('Fastest is ' + this.filter('fastest').map('name'));
//   })
//   // run async
//   .run({  true })
// console.log(...colActions)

// let sss = [ { url: 'http://cs.odu.edu', jobId: 1473098189935 },
//   { url: 'http://matkelly.com', jobId: 1473828972667 },
//   { url: 'http://matkelly.com', jobId: 1473828972667 },
//   { url: 'http://matkelly.com', jobId: 1473828972667 },
//   { url: 'http://matkelly.com', jobId: 1473828972667 },
//   { url: 'http://matkelly.com', jobId: 1473828972667 },
//   { url: 'cs.odu.edu/~jberlin', jobId: 1475010467129 },
//   { url: 'cs.odu.edu/~jberlin', jobId: 1475012345753 },
//   { url: 'cs.odu.edu/~jberlin', jobId: 1475014488646 },
//   { url: 'cs.odu.edu/~jberlin', jobId: 1475014754339 },
//   { url: 'cs.odu.edu', jobId: 1475473536070 } ]

// let trans = _.chain(sss)
//   .groupBy(it => it.url)
//   .mapValues(ar => {
//     let it = ar.map(it => it.jobId)
//     let jobIds = _.uniq(it)
//     return {
//       mementos: it.length,
//       jobIds
//     }
//   })
//   .toPairs()
//   .flatMap(it => {
//     return {
//       url: it[ 0 ],
//       jobIds: it[ 1 ].jobIds,
//       mementos: it[ 1 ].mementos
//     }
//   }).value()
// console.log(util.inspect(trans, { colors: true, depth: null }))

// console.log('hi')

//
// const cleanSeeds = seeds =>
//   seeds.map(seed => {
//     delete seed._id
//     delete seed.forCol
//     return seed
//   })
//
// const transformSeeds = seedDocs =>
//   _.chain(seedDocs)
//     .groupBy(seed => seed.forCol)
//     .mapValues(cleanSeeds)
//     .value()
//
// const joinArchiveToSeeds = (archives, aSeeds) => {
//   let archiveSeeds = transformSeeds(aSeeds)
//   return archives.map(archive => {
//     if (archiveSeeds[ archive.colName ]) {
//       archive.seeds = archiveSeeds[ archive.colName ]
//     } else {
//       archive.seeds = []
//     }
//     return archive
//   })
// }
//
// const forColWhereQ = (col) => {
//   return {
//     $where() {
//       return this.forCol === col
//     }
//   }
// }
//
// archives.find({}, (err, docs) => {
//   let forCol = 'Wail'
//   seeds.find(forColWhereQ(forCol), (errs, docs2) => {
//     console.log(docs2)
//
//   })
// })
//
// const c = new DB({
//   filename: '/home/john/my-fork-wail/dev_coreData/database/crawls.db',
//   autoload: true
// })
//
function *updateGen (iterate) {
  for (let it of iterate)
    yield it
}

function update (iter, updateFun) {
  let {done, value} = iter.next()
  if (!done) {
    updateFun(value)
      .then(() => {
        update(iter, updateFun)
      })
      .catch(error => {
        console.error(error)
      })
  }
}

//
const runsToLatest = (db, run) => new Promise((resolve, reject) => {
  run.hasRuns = true
  db.insert(run, (err) => {
    if (err) {
      reject(err)
    } else {
      resolve()
    }
  })
})
//
// // const updater = _.partial(runsToLatest, c)
// c.find({}, (err, crawls) => {
//   // c.remove({}, { multi: true }, function (err, numRemoved) {
//   //   update(updateGen(crawls), updater)
//   // })
//   let cs = _.keyBy(crawls, crawl => crawl.jobId)
//   let newA = []
//   a.find({}, (erra, archives) => {
//     console.log(inpect(archives))
//     // archives.forEach(ar => {
//     //   // console.log(inpect(ar))
//     //   if (ar.seeds.length > 0) {
//     //     ar.seeds = ar.seeds.map(s => {
//     //       s.added = moment(cs[ Math.min(...s.jobIds) ].jobId).format()
//     //       s.lastUpdated = moment(cs[ Math.max(...s.jobIds) ].latestRun.timestamp).format()
//     //       return s
//     //     })
//     //   }
//     //   newA.push(ar)
//     // })
//     // console.log(inpect(newA))
//     // a.remove({}, { multi: true }, function (err, numRemoved) {
//     //   a.insert(newA, (err) => {
//     //     console.log(err)
//     //   })
//     // })
//   })
//
// })

//

// {"_id":"sdas2","name":"sdas2","colpath":"/home/john/my-fork-wail/archives2/collections/sdas","archive":"/home/john/my-fork-wail/archives2/collections/sdas/archive","indexes":"/home/john/my-fork-wail/archives2/collections/sdas/indexes","colName":"sdas2","numArchives":0,"metadata":{"title":"klajsdlk;asjdk","description":"jkhdsakjlh"},"hasRunningCrawl":false,"lastUpdated":"2016-11-13T18:52:11-05:00","seeds":[{"booo":{"url":"cs.odu.edu","jobIds":[1475473841435],"mementos":1}}],"created":"2016-11-13T18:52:11-05:00","size":"0 B"}

// let booo = { "url": "cs.odu.edu", "jobIds": [ 1475473841435 ], "mementos": 1 }
//
// a.findOne({ colName: 'sdas2' }, (err, doc) => {
//   if (!_.find(doc.seeds, { url: booo.url })) {
//     console.log('its not in')
//     a.update({ colName: 'sdas2' }, { $push: { seeds: booo } }, { returnUpdatedDocs: true }, (err, numUpdated, updated) => {
//       console.log(err, numUpdated, updated)
//     })
//   } else {
//     console.log('its in')
//     console.log(doc.seeds)
//     let updatedSeeds = doc.seeds.map(seed => {
//       if (seed.url === booo.url) {
//         seed.jobIds.push(booo.jobIds[ 0 ])
//         seed.mementos += 1
//       }
//       return seed
//     })
//     console.log(updatedSeeds)
//     a.update({ colName: 'sdas2' }, { $set: { seeds: updatedSeeds } }, { returnUpdatedDocs: true }, (err, ...rest) => {
//       console.log(err, ...rest)
//     })
//   }
// })



