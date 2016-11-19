const DB = require('nedb')
const _ = require('lodash')
const util = require('util')
const Promise = require('bluebird')
const S = require('string')
const cp = require('child_process')
const fs = require('fs-extra')
const through2 = require('through2')
const prettyBytes = require('pretty-bytes')
const moment = require('moment')
const keyMirror = require('keymirror')
const Immutable = require('immutable')
const Benchmark = require('benchmark')
Promise.promisifyAll(DB.prototype)
const {CALL_HISTORY_METHOD} = require('react-router-redux')
// console.log(util.inspect(rrr, { depth: null, colors: true }))
console.log(CALL_HISTORY_METHOD)
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
//   .run({ 'async': true })
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
//
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
// const a = new DB({
//   filename: '/home/john/my-fork-wail/dev_coreData/database/archives.db',
//   autoload: true
// })
//
// const c = new DB({
//   filename: '/home/john/my-fork-wail/dev_coreData/database/crawls.db',
//   autoload: true
// })

//
// // c.find({}, (err, runs) => {
// //   console.log(util.inspect(runs, { depth: null, colors: true }))
// // })
//
// function *updateGen (col) {
//   for (let it of col)
//     yield it
// }
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
// const transformSeeds = seeds => _.chain(seeds)
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
//
// let newCols = []
// const update = (iter, collections, runs) => {
//   let { done, value: col } = iter.next()
//   if (!done) {
//     runs.find({ forCol: col.colName }, (err, colRuns) => {
//       if (colRuns.length > 0) {
//         let seeds = []
//         let rms = []
//         colRuns.forEach(cur => {
//           if (Array.isArray(cur.urls)) {
//             cur.urls.forEach(it => {
//               seeds.push({
//                 url: it,
//                 jobId: cur.jobId
//               })
//             })
//           } else {
//             seeds.push({
//               url: cur.urls,
//               jobId: cur.jobId
//             })
//           }
//           if (cur.runs.length > 0) {
//             rms = rms.concat(cur.runs.map(r => moment(r.timestamp)))
//           }
//         })
//         col.lastUpdated = rms.length > 0 ? moment.max(rms).format() : moment().format()
//         col.seeds = transformSeeds(seeds)
//       } else {
//         col.lastUpdated = moment().format()
//         col.seeds = []
//       }
//       col.created = moment().format()
//       let size = 0
//       fs.walk(col.archive)
//         .pipe(through2.obj(function (item, enc, next) {
//           if (!item.stats.isDirectory()) this.push(item)
//           next()
//         }))
//         .on('data', item => {
//           size += item.stats.size
//         })
//         .on('end', () => {
//           col.size = prettyBytes(size)
//           delete col.crawls
//           newCols.push(col)
//           update(iter, collections, runs)
//         })
//     })
//   } else {
//     console.log(util.inspect(newCols, { depth: null, colors: true }))
//     a.remove({}, { multi: true }, (x, y) => {
//       a.insert(newCols, (erri, newDocs) => {
//         console.log(newDocs)
//       })
//     })
//   }
// }
//
// a.find({}, (err, collections) => {
//   console.log(util.inspect(collections, { depth: null, colors: true }))
//   // update(updateGen(collections), a, c)
//   // collections.forEach(col => {
//   //   c.find({ forCol: col.colName }, (err, colRuns) => {
//   //     console.log(util.inspect(col, { depth: null, colors: true }))
//   //     console.log(util.inspect(colRuns, { depth: null, colors: true }))
//   //     if (colRuns.length > 0) {
//   //       let seeds = colRuns.map(r => r.urls)
//   //       console.log(seeds)
//   //     } else {
//   //       console.log('no seeds')
//   //       a.update({ _id: col._id },)
//   //     }
//   //     console.log('------------------------------')
//   //   })
//   // })
// })

// class ItRec extends Immutable.Record({ a: 1, b: 2 }) {
//   updateMe (k, v) {
//     return this.set(k, v)
//   }
// }
//
// let it = new ItRec()
// console.log(it.a, it.b)
// let it2 = it.updateMe('b', 5)
// let it3 = it2.updateMe('a', 5)
// console.log(it2.a, it2.b)
// console.log(it3.a, it3.b)
// console.log(it === it2)
// console.log(it === it3)
// console.log(it2 === it3)