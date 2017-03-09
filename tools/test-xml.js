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
const ElectronSettings = require('electron-settings')
const normalizeUrl = require('normalize-url')

S.TMPL_OPEN = '{'
S.TMPL_CLOSE = '}'
const settingsPath = Path.join(process.cwd(), 'wail-config', 'wail-settings')
const settings = new ElectronSettings({configDirPath: settingsPath})
console.log(settings.get('version'))

