const _ = require('lodash')
const DB = require('nedb')
const util = require('util')
const Path = require('path')
const Promise = require('bluebird')
const fs = require('fs-extra')
const chokidar = require('chokidar')
const S = require('string')
const cheerio = require('cheerio')
const slen = require('string-length')
const swidth = require('string-width')
const EventEmitter = require('eventemitter3')
const Twit = require('twit')

const twit = new Twit({
  consumer_key: "K1y1GmSdDfUmBNMJeX1lf8Ono",
  consumer_secret: "Ksd87lVkQWRVeXUIYjqqPF7mfUZuRq1aU1fgAFJHdDz3AY7NTY",
  access_token: "4844579470-y1a1kQePvEohKDp8RDfESX1whNRhlTm856JHWn3",
  access_token_secret: "46R2ynfMC8CmHzsd76UReneRGcPbuOaPAIhZVeMLKZD2f",
  timeout_ms: 60 * 1000
})

// class Settings extends EventEmitter {
//   constructor (options) {
//     super()
//     this._settingsCache = null
//     this._options = options
//   }
//
//   _init () {
//     try {
//       this._settingsCache = fs.readJsonSync(this.settingsFilePath())
//     } catch (error) {
//
//     }
//   }
//
//   _populateSettingsCache () {
//     try {
//       // this._settingsCache = fs.readJsonSync(this.settingsFile())
//     } catch (error) {
//
//     }
//   }
//
//   _writeSettings () {
//
//   }
//
//   settingsDirPath () {
//     if (!this._options.settingsDir) {
//       const app = electron.app || electron.remote.app
//       return Path.join(app.getPath('userData'), 'settings')
//     } else {
//       let {settingsDir} = this._options
//       return Path.join(settingsDir, 'settings')
//     }
//   }
//
//   settingsFilePath () {
//     return Path.join(this.settingsDirPath(), 'settings.json')
//   }
// }

