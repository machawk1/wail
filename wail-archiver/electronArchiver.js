import EventEmitter from 'eventemitter3'
import Promise from 'bluebird'
import isEmpty from 'lodash/isEmpty'
import ElectronRequestMonitor from './electronRequestMonitor'
import ElectronWARCGenerator from './electronWARCGenerator'
import * as pageEvals from './utils/pageEvals'

export default class ElectronArchiver extends EventEmitter {
  constructor () {
    super()
    this.requestMonitor = new ElectronRequestMonitor()
    this._warcGenerator = new ElectronWARCGenerator()
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
            return reject(errP)
          }
          this._wc.debugger.sendCommand('DOM.enable', (errD) => {
            if (!isEmpty(errD)) {
              return reject(errD)
            }
            this._wc.debugger.sendCommand('Runtime.enable', (errR) => {
              if (!isEmpty(errR)) {
                return reject(errR)
              }
              this._wc.debugger.sendCommand('Network.enable', {maxTotalBufferSize: 1000000000}, (errN) => {
                if (!isEmpty(errN)) {
                  return reject(errN)
                }
                resolve()
              })
            })
          })
        })
      } catch (err) {
        console.error(err)
        reject(err)
      }
    })
  }

  async setUp (wc) {
    await this.attach(wc)
    this.requestMonitor.attach(this._wc.debugger)
    try {
      let nnjs_id = await this._doNoNaughtyJs()
      // console.log('no naughty good', nnjs_id)
    } catch (error) {
      console.error('No naughty failed :(')
      console.error(error)
    }
    this._wc.debugger.on('message', (event, method, params) => {
      if (method === 'Page.loadEventFired') {
        // Promise.delay(5000).then(this.pageLoaded)
        this.emit('page-loaded')
      }
    })
  }

  initWARC (warcPath, appending = false) {
    this._warcGenerator.initWARC(warcPath, appending)
  }

  async genWarc ({info, outlinks, UA, seedURL}) {
    await this._warcGenerator.writeWarcInfoRecord(info.v, info.isPartOfV, info.warcInfoDescription, UA)
    await this._warcGenerator.writeWarcMetadataOutlinks(seedURL, outlinks)
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
              console.log(nreq.method)
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
          return reject(err)
        }
        resolve(results)
      })
    })
  }

  getMetadataSameD () {
    return new Promise((resolve, reject) => {
      this._wc.debugger.sendCommand('Runtime.evaluate', pageEvals.metadataSameD, (err, results) => {
        if (!isEmpty(err)) {
          return reject(err)
        }
        resolve(results)
      })
    })
  }

  doScroll () {
    return new Promise((resolve, reject) => {
      this._wc.debugger.sendCommand('Runtime.evaluate', pageEvals.doScroll, (err, results) => {
        if (!isEmpty(err)) {
          return reject(err)
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
          return reject(err)
        }
        resolve(ret)
      })
    })
  }

  detach () {
    this._wc.debugger.detach()
  }
}

