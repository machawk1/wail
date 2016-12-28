const moment = require('moment')
// require('moment-precise-range-plugin')
// const EventEmitter = require('eventemitter3')
// const DB = require('nedb')
const shelljs =  require('shelljs')
const named = require('named-regexp')
const _ = require('lodash')
const util = require('util')
// const Immutable = require('immutable')
// const Promise = require('bluebird')
const S = require('string')
// const cp = require('child_process')
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
// const madge = require('madge')

const inspect = _.partialRight(util.inspect, {depth: null, colors: true})

const electronMainConfig = {
  detectiveOptions: {
    webpackConfig: '/home/john/my-fork-wail/webpackConfigs/ui/webpack.config.electron.js'
  }
}

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
