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

let statP = 'A:\\Documents\\WAIL_Managed_Crawls\\1483597436878\\20170105062359\\logs\\progress-statistics.log'



const findWarcsWin = where => new Promise((resolve, reject) => {
  let command = `dir /B /s ${where}`
  cp.exec(command, (err, stdout, stderr) => {
    if (err) {
      reject(err)
    } else {
      //get rid of \r from windows
      stdout = stdout.replace(/\r/g, "")
      let files = stdout.split('\n')
      //remove last entry because it is empty
      files.splice(-1, 1)
      resolve(files[ 0 ])
    }
  })
})

findWarcsWin(path.normalize(`${statP}}/../../warcs/*.warc`))
  .then(warcs => {
    console.log(warcs)
    // let opts = {
    //   cwd: settings.get('warcs')
    // }
    // let exec = S(settings.get('pywb.addWarcsToCol')).template({
    //   col: 'default',
    //   warcs
    // }).s
    // cp.exec(exec, opts, (error, stdout, stderr) => {
    //   if (error) {
    //     console.error(error)
    //     console.error(stdout, stderr)
    //   } else {
    //     console.log(stdout, stderr)
    //   }
    // })
  })
  .catch(error => {
    console.error(error)
  })

/*
 .then((res) => res.dot())
 .then((output) => {
 console.log(output)
 })
 */