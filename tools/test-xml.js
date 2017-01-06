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
const ESettings = require('electron-settings')

const settings = new ESettings({ configDirPath: 'A:\\WebstromProjects\\wail\\wail-config\\wail-settings' })

S.TMPL_OPEN = '{'
S.TMPL_CLOSE = '}'

let heritrixPath = settings.get('heritrix.path')
let opts = {
  cwd: heritrixPath,
  env: {
    JAVA_HOME: settings.get('jdk'),
    JRE_HOME: settings.get('jre'),
    HERITRIX_HOME: heritrixPath
  }
}

let usrpwrd = `${settings.get('heritrix.username')}:${settings.get('heritrix.password')}`
let pid = -1
let args = [ '-a', `${usrpwrd}`, '--jobs-dir', `${settings.get('heritrix.jobsDir')}` ]
cp.execFile('bin\\heritrix.cmd', args, opts,(err,stderr,stdout) => {
  if (err) {
    console.error(err)
    console.error(stderr,stdout)
  } else {
    console.log(stderr,stdout)
  }
})
/*
 .then((res) => res.dot())
 .then((output) => {
 console.log(output)
 })
 */