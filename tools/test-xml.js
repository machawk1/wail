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
// const madge = require('madge')
// const groups = {}

console.log(path.normalize(path.join('/home/it/WAIL 2.app')))
// const ESettings = require('electron-settings')

fs.stat(path.join('/home/it/WAIL 2.app'), (err, stats) => {
  console.log(err, stats)
})
//
// const settings = new ESettings({ configDirPath: '/home/john/my-fork-wail/wail-config/wail-settings' })
//
// S.TMPL_OPEN = '{'
// S.TMPL_CLOSE = '}'
//
// console.log('starting wayback')
// let exec = settings.get('pywb.wayback')
// let opts = {
//   cwd: settings.get('warcs'),
//   shell: true
// }
//
// let wayback = cp.spawn(exec, opts)
//
// wayback.stdout.on('data', (data) => {
//   console.log(`stdout: ${data}`);
// });
//
// wayback.stderr.on('data', (data) => {
//   console.log(`stderr: ${data}`);
// });
//
// wayback.on('close', (code) => {
//   console.log(`child process exited with code ${code}`);
// })
/*
 .then((res) => res.dot())
 .then((output) => {
 console.log(output)
 })
 */