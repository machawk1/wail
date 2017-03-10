const _ = require('lodash')
const DB = require('nedb')
const util = require('util')
const Path = require('path')
const Promise = require('bluebird')
const S = require('string')
const cp = require('child_process')
const fp = require('lodash/fp')
const moment = require('moment')
const fs = require('fs-extra')
const prettyBytes = require('pretty-bytes')
const through2 = require('through2')
const Rx = require('rxjs/Rx')
const rp = require('request-promise')
const normalizeUrl = require('normalize-url')
const findP = require('find-process')
const isRunning = require('is-running')
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
S.TMPL_OPEN = '{'
S.TMPL_CLOSE = '}'

// findP('name', 'wayback').then(ret => {
//   console.log(ret)
// }).catch(error => {
//   console.error(error)
// })

console.log(isRunning(29260))