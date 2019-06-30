const chokidar = require('chokidar')
const S = require('string')
const cp = require('child_process')
const Promise = require('bluebird')
const path = require('path')
const EventEmitter = require('eventemitter3')
const bytewise = require('bytewise')

S.TMPL_OPEN = '{'
S.TMPL_CLOSE = '}'

class ColIndexer extends EventEmitter {
  constructor (pywbP, colP) {
    super()
    this._indexerP = path.join(pywbP, 'cdx-indexer')
    this._archiveP = path.join(colP, 'archive')
    this._indexP = path.join(colP, 'indexes', 'all.cdxj')
    this._colP = colP
    this._added = []
    this.errorCount = 0
    this._watcher = null
    this._running = false
    this._doIndex = this._doIndex.bind(this)
    this._monitorError = this._monitorError.bind(this)
  }

  _doIndex () {
    return new Promise((resolve, reject) => {
      const exe = `export LC_ALL=C; ${this._indexerP} -j ${this._archiveP} | sort > ${this._indexP}`
      cp.exec(exe, (error, stdout, stderr) => {
        if (error) {
          reject(error)
        } else {
          resolve()
        }
      })
    })
  }

  _monitorError (error) {
    this.errorCount++
    if (this.errorCount >= 10) {
      this.stop()
      this.emit('critical-error', {colP: this._colP, error, wasError: true})
    }
  }

  start () {
    this._running = true
    this._watcher = chokidar.watch(this._archiveP, {ignoreInitial: true})
    this._watcher.on('add', filePath => {
      this._added.push(filePath)
      this._doIndex()
        .then(() => {
          this.emit('indexed', {colP: this._colP, wasError: false})
        })
        .catch(err => {
          this.emit('error', {colP: this._colP, err, wasError: true})
        })
    })

    this._watcher.on('change', filePath => {
      this._doIndex()
        .then(() => {
          this.emit('indexed', {colP: this._colP, wasError: false})
        })
        .catch(err => {
          this.emit('error', {colP: this._colP, err, wasError: true})
        })
    })
    this._watcher.on('unlink', filePath => {
      this._doIndex()
        .then(() => {
          this.emit('indexed', {colP: this._colP, wasError: false})
        })
        .catch(err => {
          this.emit('error', {colP: this._colP, err, wasError: true})
        })
    })

    this._watcher.on('error', this._monitorError)
  }

  stop () {
    if (this._running) {
      this._running = false
      this._added.forEach(f => {
        this._watcher.unwatch(f)
      })
      this._watcher.close()
      this._watcher = null
    }
  }
}

module.exports = ColIndexer
