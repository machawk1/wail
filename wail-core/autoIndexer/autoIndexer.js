import * as Path from 'path'
import * as fs from 'fs-extra'
import * as cp from 'child_process'
import EventEmitter from 'eventemitter3'
import Promise from 'bluebird'
import chokidar from 'chokidar'

export default class AutoIndexer extends EventEmitter {
  constructor (pywbP, wailColsP) {
    super()
    this._indexerP = Path.join(pywbP, 'index.sh')
    this._wailColsP = wailColsP
    this._checkCache = new Map()
    this._watcher = null
    this._notWorking = true
    this._indexQ = []
    this._update = this._update.bind(this)
    this._doIndex = this._doIndex.bind(this)
    this._addToIndexQ = this._addToIndexQ.bind(this)

  }

  init () {
    this._watcher = chokidar.watch(Path.join(this._wailColsP, '**', 'archive', '*'), {ignoreInitial: true})

  }

  _update (filePath) {
    let dn = Path.basename(filePath)
    let indexPath
    if (!this._checkCache.has(dn)) {
      indexPath = Path.join(dn, `..${Path.sep}`, 'indexes', 'all.cdxj')
      this._checkCache.set(dn, indexPath)
      fs.pathExists(indexPath)
        .then(exists => {
          if (!exists) {
            this._addToIndexQ(dn, true)
          } else {
            this._addToIndexQ(dn, false)
          }
        })
    } else {
      this._addToIndexQ(dn, false)
    }
  }

  _addToIndexQ (archivePath, restartWB) {
    this._indexQ.push({archivePath, restartWB})
    this._maybeWork()
  }

  _maybeWork () {
    if (this._indexQ.length > 0 && this._notWorking) {
      this._doIndex()
    } else {
      console.log('nothing to work with')
    }
  }

  _doIndex () {
    this._notWorking = false
    let {archivePath, restartWB} = this._indexQ.shift()
    let indexP = this._checkCache.get(archivePath)
    let indexing = cp.spawn(
      this._indexerP,
      [archivePath, indexP],
      {stdio: ['ignore', 'ignore', 'ignore']}
    )
    indexing.on('close', (code) => {
      this._notWorking = true
      if (restartWB) {

      }
      this._maybeWork()
    })
    indexing.on('error', (err) => {
      this._notWorking = true
      this._maybeWork()
    })
  }

}

class AutoIndexer2 {
  constructor () {
    this.watchers = new Map()
    this.onMessage = this.onMessage.bind(this)
  }

  onMessage (m) {
    switch (m.type) {
      case 'init': {
        const {pywbP, colPs} = m
        colPs.forEach(colP => {
          const aIndexer = new ColIndexer(pywbP, colP)
          this.watchers.set(colP, aIndexer)
          aIndexer.start()
          aIndexer.on('error', err => {
            // process.send(err)
            console.error(err)
          })
          aIndexer.on('indexed', update => {
            // process.send(update)
            console.log(update)
          })

          aIndexer.on('critical-error', err => {
            // process.send(err)
            console.error(err)
            this.watchers.get(err.colP).stop()
            this.watchers.delete(err.colP)
          })
        })
        break
      }
      case 'watchCol': {
        const {pywbP, colP} = m.init
        const aIndexer = new ColIndexer(pywbP, colP)
        this.watchers.set(colP, aIndexer)
        aIndexer.start()
        aIndexer.on('error', err => {
          // process.send(err)
          console.error(err)
        })
        aIndexer.on('indexed', update => {
          // process.send(update)
          console.log(update)
        })

        aIndexer.on('critical-error', err => {
          // process.send(err)
          console.error(err)
          this.watchers.get(err.colP).stop()
          this.watchers.delete(err.colP)
        })
        break
      }
    }
  }

  stop () {
    for (const it of this.watchers.values()) {
      it.stop()
    }
    this.watchers.clear()
  }
}

// const autoIndexer = new AutoIndexer()
// process.on('message', (m) => {
//   console.log(m)
//   autoIndexer.onMessage(m)
// })
//
// process.on('exit', () => {
//   autoIndexer.stop()
// })
