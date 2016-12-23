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
const moment = require('moment')
const path = require('path')
const schedule = require('node-schedule')
const Rx = require('rxjs')
const Twit = require('twit')
const http = require('http')
require('http-shutdown').extend()
const inspect = _.partialRight(util.inspect, {depth: null, colors: true})

const server = http.createServer((request, response) => {
  console.log('request ' + request.url)
  // response.writeHead(200, {
  //   'Content-Length': 206457694,
  //   'Content-Type': 'application/x-apple-diskimage'
  // })
  let rs = fs.createReadStream('jdk-osx.dmg')
  Rx.Observable.fromEvent(rs, 'data')
    .throttleTime(1000)
    .subscribe(data => {
      console.log('data')
      response.write(data)
    })
  rs.on('end', function () {
    response.end()
  })
}).withShutdown()

server.listen(9066)
process.on('SIGTERM', () => {
  console.log('Stopping proxy server')
  server.shutdown(() => {
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('Stopping proxy server')
  server.shutdown(() => {
    process.exit(0)
  })
})

process.once('SIGUSR2', () => {
  server.shutdown(() => {
    process.kill(process.pid, 'SIGUSR2')
  })
})