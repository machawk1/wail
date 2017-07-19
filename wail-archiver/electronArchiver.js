import EventEmitter from 'eventemitter3'
import Promise from 'bluebird'
import isEmpty from 'lodash/isEmpty'
import ElectronWARCWriter from './electronWARCGenerator'
import ElectronRequestMonitor from './electronRequestMonitor'
import * as pageEvals from './pageEvals'
import { archiving } from '../wail-core/globalStrings'

class ArchiverError extends Error {
  constructor (dError) {
    super()
    this.dErorr = dError
  }
}

export default class ElectronArchiver extends EventEmitter {
  constructor () {
    super()
    this.requestMonitor = new ElectronRequestMonitor()
    this._warcGenerator = new ElectronWARCWriter(true)
    this.pageLoaded = this.pageLoaded.bind(this)
    this._onWARCGenFinished = this._onWARCGenFinished.bind(this)
    this._onWARCGenError = this._onWARCGenError.bind(this)
    this._warcGenerator.on('finished', this._onWARCGenFinished)
    this._warcGenerator.on('error', this._onWARCGenError)
  }

  attach (wc) {
    this._wc = wc
    return new Promise((resolve, reject) => {
      try {
        this._wc.debugger.attach('1.2')
        this._wc.debugger.sendCommand('Page.enable', (errP) => {
          if (!isEmpty(errP)) {
            return reject(new ArchiverError(errP))
          }
          this._wc.debugger.sendCommand('Runtime.enable', (errR) => {
            if (!isEmpty(errR)) {
              return reject(new ArchiverError(errR))
            }
            this._wc.debugger.sendCommand('Network.enable', (errN) => {
              if (!isEmpty(errN)) {
                return reject(new ArchiverError(errN))
              }
              resolve()
            })
          })
        })
      } catch (err) {
        reject(err)
      }
    })
  }

  async setUp (wc) {
    await this.attach(wc)
    // this.requestMonitor.attach(this._wc.debugger)
    try {
      await this._doNoNaughtyJs()
      // console.log('no naughty good', nnjs_id)
    } catch (error) {
      console.error('No naughty failed :(')
      console.error(error)
    }
    try {
      await this._updateEmulation()
    }catch (error) {
      console.error('updateEmulation failed :(')
      console.error(error)
    }
    this._wc.debugger.on('message', (event, method, params) => {
      if (method === 'Page.loadEventFired') {
        // Promise.delay(5000).then(this.pageLoaded)
        this.emit('page-loaded')
      } else {
        this.requestMonitor.maybeNetworkMessage(method, params)
      }
    })
  }

  initWARC (warcPath, appending = false) {
    this._warcGenerator.initWARC(warcPath, appending)
  }

  async genWarc ({info, outlinks, UA, seedURL}) {
    await this._warcGenerator.writeWarcInfoRecord(info.v, info.isPartOfV, info.warcInfoDescription, UA)
    await this._warcGenerator.writeWarcMetadataOutlinks(seedURL, outlinks)
    this.requestMonitor.stopCapturing()
    for (let nreq of this.requestMonitor.values()) {
      try {
        if (nreq.redirectResponse) {
          await this._warcGenerator.generateRedirectResponse(nreq, this._wc.debugger)
        } else {
          switch (nreq.method) {
            case 'POST':
              await this._warcGenerator.generatePost(nreq, this._wc.debugger)
              break
            case 'GET':
              await this._warcGenerator.generateGet(nreq, this._wc.debugger)
              break
            case 'OPTIONS':
              await this._warcGenerator.generateOptions(nreq, this._wc.debugger)
              break
            default:
              if (
                (nreq.headers === null || nreq.headers === undefined) &&
                (nreq.method === null || nreq.method === undefined) &&
                (nreq.url === null || nreq.url === undefined) &&
                (nreq.res !== null || nreq.res !== undefined)
              ) {
                await this._warcGenerator.generateOnlyRes(nreq, this._wc.debugger)
              } else {
                await this._warcGenerator.generateOther(nreq, this._wc.debugger)
              }
          }
        }
      } catch (error) {
        console.error(error)
      }
    }
    this._warcGenerator.end()
  }

  startCapturing () {
    this.requestMonitor.startCapturing()
  }

  stopCapturing () {
    this.requestMonitor.stopCapturing()
  }

  getMetadata () {
    return new Promise((resolve, reject) => {
      this._wc.debugger.sendCommand('Runtime.evaluate', pageEvals.metadata, (err, results) => {
        if (!isEmpty(err)) {
          return reject(new ArchiverError(err))
        }
        resolve(results.result.value)
      })
    })
  }

  getMetadataSameD () {
    return new Promise((resolve, reject) => {
      this._wc.debugger.sendCommand('Runtime.evaluate', pageEvals.metadataSameD, (err, results) => {
        if (!isEmpty(err)) {
          return reject(new ArchiverError(err))
        }
        resolve(results.result.value)
      })
    })
  }

  getMetadataAll () {
    return new Promise((resolve, reject) => {
      this._wc.debugger.sendCommand('Runtime.evaluate', pageEvals.metadataAll, (err, results) => {
        if (!isEmpty(err)) {
          return reject(new ArchiverError(err))
        }
        resolve(results.result.value)
      })
    })
  }

  getMetadataBasedOnConfig (mode) {
    if (mode === archiving.PAGE_SAME_DOMAIN) {
      return this.getMetadataSameD()
    } else if (mode === archiving.PAGE_ALL_LINKS) {
      return this.getMetadataAll()
    } else {
      return this.getMetadata()
    }
  }

  doScroll (scroll = 4000) {
    return new Promise((resolve, reject) => {
      this._wc.debugger.sendCommand('Runtime.evaluate', pageEvals.makeSmoothScroll(scroll), (err, results) => {
        if (!isEmpty(err)) {
          return reject(new ArchiverError(err))
        }
        resolve()
      })
    })
  }

  pageLoaded () {
    this.emit('page-loaded')
  }

  /**
   * @desc Listener for warc generator error
   * @param {Error} err
   * @private
   */
  _onWARCGenError (err) {
    this.emit('error', {type: 'warc-gen', err})
  }

  /**
   * @desc Listener for warc generator finished
   * @private
   */
  _onWARCGenFinished () {
    this.emit('warc-gen-finished')
  }

  _doNoNaughtyJs () {
    return new Promise((resolve, reject) => {
      this._wc.debugger.sendCommand('Page.addScriptToEvaluateOnLoad', pageEvals.noNaughtyJS, (err, ret) => {
        if (!isEmpty(err)) {
          return reject(new ArchiverError(err))
        }
        resolve(ret)
      })
    })
  }

  _updateEmulation () {
    return new Promise((resolve, reject) => {
      this._wc.debugger.sendCommand('Emulation.setDeviceMetricsOverride', {
        width: 1920,
        height: 1080,
        screenWidth: 1920,
        screenHeight: 1080,
        deviceScaleFactor: 0,
        mobile: false,
        fitWindow: false
      }, (err, ret) => {
        if (!isEmpty(err)) {
          return reject(new ArchiverError(err))
        }
        resolve(ret)
      })
    })
  }

  detach () {
    this._wc.debugger.detach()
  }
}
