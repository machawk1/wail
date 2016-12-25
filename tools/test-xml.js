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
const findP = require('find-process')
// */5 * * * *
// const Twit = require('twit')
//
const inspect = _.partialRight(util.inspect, {depth: null, colors: true})

let result = [{
  pid: '2508',
  ppid: '2445',
  uid: '1000',
  gid: '1000',
  name: 'java',
  cmd: '/home/john/WebStorm/jre/jre/bin/java -Xbootclasspath/a:/home/john/WebStorm/lib/boot.jar -classpath /home/john/WebStorm/lib/bootstrap.jar:/home/john/WebStorm/lib/extensions.jar:/home/john/WebStorm/lib/util.jar:/home/john/WebStorm/lib/jdom.jar:/home/john/WebStorm/lib/log4j.jar:/home/john/WebStorm/lib/trove4j.jar:/home/john/WebStorm/lib/jna.jar -Xms1028m -Xmx1750m -XX:ReservedCodeCacheSize=500m -XX:+UseConcMarkSweepGC -XX:SoftRefLRUPolicyMSPerMB=50 -ea -Dsun.io.useCanonCaches=false -Djava.net.preferIPv4Stack=true -XX:+HeapDumpOnOutOfMemoryError -XX:-OmitStackTraceInFastThrow -Dawt.useSystemAAFontSettings=lcd -Dsun.java2d.renderer=sun.java2d.marlin.MarlinRenderingEngine -XX:ErrorFile=/home/john/java_error_in_WEBIDE_%p.log -XX:HeapDumpPath=/home/john/java_error_in_WEBIDE.hprof -Didea.paths.selector=WebStorm2016.3 -Djb.vmOptionsFile=/home/john/WebStorm/bin/webstorm64.vmoptions -Didea.platform.prefix=WebStorm com.intellij.idea.Main'
},
  {
    pid: '12451',
    ppid: '1806',
    uid: '1000',
    gid: '1000',
    name: 'java',
    cmd: '/home/john/my-fork-wail/bundledApps/openjdk/bin/java -Dname=heritrix -Dheritrix.home=/home/john/my-fork-wail/bundledApps/heritrix -Djava.protocol.handler.pkgs=org.archive.net -Dheritrix.out=/home/john/my-fork-wail/bundledApps/heritrix/heritrix_out.log -Xmx256m org.archive.crawler.Heritrix -a lorem:ipsum'
  }]

const bundledHeritrix = `bundledApps${path.sep}heritrix`
const hFindRegx = /(heritrix)|(java)/i
const heritrixFinder = result => {
  let len = result.length, i = 0
  let findReport = {found: false, pid: -1, isWails: false}
  for (; i < len; ++i) {
    let {pid, cmd} = result[i]
    if (cmd.indexOf('heritrix') > 0) {
      findReport.found = true
      findReport.pid = pid
      if (cmd.indexOf(bundledHeritrix) > 0) {
        findReport.isWails = true
      }
      break
    }
  }
  return findReport
}

const doFind = () =>
  findP('name', hFindRegx)
    .then(heritrixFinder)

doFind().then(({found, pid, isWails}) => {
  if (found) {
    console.log(`there is a heritrix instance running pid=${pid}`)
    if (isWails) {
      console.log('it is wails')
    } else {
      console.log('it is not wails')
    }
  } else {
    console.log('no heritrix instance running')
  }
})
