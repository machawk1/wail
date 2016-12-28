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
const cwd = path.resolve('.')

const electronMainConfig = {
  detectiveOptions: {
    webpackConfig: '/home/john/my-fork-wail/webpackConfigs/ui/webpack.config.electron.js'
  }
}

function normalizeJoin (...paths) {
  console.log(arguments)
  return path.normalize(path.join(...paths))
}

const replaceOldCrawlPath = () => {
  console.log(cwd)
  const dbPath = path.join(cwd, 'wail-config/database/crawls.db')
  const newPath = '/home/john/Documents/WAIL_Managed_Crawls'
  const oldPath = path.join(cwd, 'bundledApps/heritrix/jobs')
  console.log(oldPath, newPath)
  const crawls = new DB({
    filename: dbPath,
    autoload: true
  })
  return new Promise((resolve, reject) => {
    crawls.find({}, (errFind, docs) => {
      if (errFind) {
        resolve({
          wasError: true,
          where: 'finding',
          err: errFind
        })
      } else {
        let ndocs = docs.map(ac => {
          ac.path = S(ac.path).replaceAll(oldPath, newPath).s
          ac.confP = S(ac.confP).replaceAll(oldPath, newPath).s
          return ac
        })
        crawls.remove({}, {multi: true}, (errRemove, nremoved) => {
          if (errRemove) {
            console.error(errRemove)
            resolve({
              wasError: true,
              where: 'removing',
              err: errRemove
            })
          } else {
            console.log(nremoved)
            crawls.insert(ndocs, (errInsert, iDocs) => {
              resolve({
                wasError: false,
                docs: iDocs
              })
            })
          }
        })
      }
    })
  })
}

//allRuns.map(r => r.jobId)
const dbPath = path.join(cwd, 'wail-config/database/crawls.db')
const crawls = new DB({
  filename: dbPath,
  autoload: true
})

const trans = lfp.compose(
  lfp.map(
    lfp.pick(['jobId', 'latestRun.timestamp'])
  ),
  lfp.assign()
)

crawls.find({}, (err, docs) => {
  console.log(inspect(trans(docs)))
})
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
