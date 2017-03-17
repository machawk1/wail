const _ = require('lodash')
const DB = require('nedb')
const util = require('util')
const Path = require('path')
const Promise = require('bluebird')
const S = require('string')
const cp = require('child_process')
const fp = require('lodash/fp')
const moment = require('moment')
const psTree = require('ps-tree')
const fs = require('fs-extra')
const EventEmitter = require('eventemitter3')
const prettyBytes = require('pretty-bytes')
const through2 = require('through2')
const Rx = require('rxjs/Rx')
const split2 = require('split2')
const rp = require('request-promise')
const normalizeUrl = require('normalize-url')
const findP = require('find-process')
const isRunning = require('is-running')
const keyMirror = require('keymirror')
const ElectronSettings = require('electron-settings')
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
S.TMPL_OPEN = '{'
S.TMPL_CLOSE = '}'

const settings = new ElectronSettings({configDirPath: '/home/john/my-fork-wail/wail-config/wail-settings'})
console.log(settings.get())

