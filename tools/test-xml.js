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
const madge = require('madge')
// const groups = {}
const inspect = _.partialRight(util.inspect, {depth: null, colors: true})

const wbp = '/home/john/my-fork-wail/bundledApps/pywb/runPywb.sh'
let opts = {
  cwd: '/home/john/my-fork-wail/bundledApps/pywb',
  detached: true,
  shell: true
}
const spawned = cp.spawn(wbp, ['/home/john/Documents/WAIL_ManagedCollections'],opts)
spawned.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

spawned.stderr.on('data', (data) => {
  console.log(`stderr: ${data}`);
});

spawned.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});
/*
 .then((res) => res.dot())
 .then((output) => {
 console.log(output)
 })
 */