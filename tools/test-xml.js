const moment = require('moment')
// require('moment-precise-range-plugin')
// const EventEmitter = require('eventemitter3')
const DB = require('nedb')
const shelljs = require('shelljs')
const named = require('named-regexp')
const _ = require('lodash')
const util = require('util')
// const Immutable = require('immutable')
const path = require('path')
const Promise = require('bluebird')
const S = require('string')
const cp = require('child_process')
const fp = require('lodash/fp')
const fs = require('fs-extra')
const through2 = require('through2')
const split = require('split2')
// const prettyBytes = require('pretty-bytes')
// const path = require('path')
// const schedule = require('node-schedule')
// const Twit = require('twit')
// const request = require('request')
// const progress = require('request-progress')
// const prettyMs = require('pretty-ms')
// const prettySeconds = require('pretty-seconds')
// const Rx = require('rxjs')
// const delay = require('lodash/delay')
const findP = require('find-process')
// const Twit = require('twit')
const tld = require('tldjs')
const rp = require('request-promise')
const chokidar = require('chokidar')
const isRunning = require('is-running')
const pathExists = require('path-exists')
const ElectronSettings = require('electron-settings')


findP('name','wayback').then(it => {
  console.log(it)
})

// const pathChecker = async path => {
//   return await pathExists(path)
// }
//
// pathExists('/home/john/Documents/WAIL_ManagedCollections').then(exists => {
//   console.log(exists)
// })
//
// pathExists('/home/john/Documents/WAIL_Managed_Crawls').then(exists => {
//   console.log(exists)
// })

// const dbPath = path.join(cwd, 'wail-config/database/crawls.db')
// const crawls = new DB({
//   filename: dbPath,
//   autoload: true
// })
//
//
// crawls.find({}, (err, docs) => {
//   let ndocs = docs.map(r => {
//     console.log(r.latestRun)
//     return {
//       jobId: r.jobId,
//       timestamp: moment(r.latestRun.timestamp)
//     }
//   })
//   ndocs.sort(momentSortRev)
//   console.log(inspect(trans(ndocs)))
// })
// replaceOldCrawlPath().then(result => {
//   if (result.wasError) {
//     let {err, where} = result
//     console.error(where, err)
//   } else {
//     console.log(inspect(result.docs))
//   }
// })

// const groups = {}
//
// madge('/home/john/my-fork-wail/wail-ui/wail.js')
//   .then((res) => {
//     let nes = _.toPairs(res.obj())
//     for (let [node, edges] of nes) {
//       console.log()
//       let gs = node.split('/')
//       let keyPath = '', len = gs.length, i = 0
//       for (; i < len; ++i) {
//         if (i + 1 < len) {
//           keyPath += gs[i]
//           let have = _.get(groups, keyPath)
//           // if (!)
//         }
//
//       }
//     }
//   })
