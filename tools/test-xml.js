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
const lfp = require('lodash/fp')
// const fs = require('fs-extra')
// const through2 = require('through2')
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
// const findP = require('find-process')
// */5 * * * *
// const Twit = require('twit')
//
const tld = require('tldjs')
const rp = require('request-promise')
const chokidar = require('chokidar')
// const madge = require('madge')
const inspect = _.partialRight(util.inspect, {depth: null, colors: true})


const electronMainConfig = {
  detectiveOptions: {
    webpackConfig: '/home/john/my-fork-wail/webpackConfigs/ui/webpack.config.electron.js'
  }
}

function normalizeJoin (...paths) {
  console.log(arguments)
  return path.normalize(path.join(...paths))
}


//
// //allRuns.map(r => r.jobId)
const dbPath = path.join(cwd, 'wail-config/database/crawls.db')
const crawls = new DB({
  filename: dbPath,
  autoload: true
})
//
const trans = lfp.map(r => ({
  jobId: r.jobId,
  timestamp: moment(r.latestRun.timestamp)
}))

const momentSortRev = (m1, m2) => {
  let t1 = m1.timestamp
  let t2 = m2.timestamp
  if (t1.isBefore(t2)) {
    return 1
  } else if (t1.isSame(t2)) {
    return 0
  } else {
    return -1
  }
}

const t =  async () => {
  const bar = await Promise.resolve('bar')
  console.log(bar)
}

t()
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
