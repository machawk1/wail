const {ipcRenderer, remote} = require('electron')
const NetInterceptor = require('./netInterceptor')
const DebuggerUtil = require('./debuggerUtil')
const Promise = require('bluebird')
const WarcWriter = require('./warcWriter')
const _ = require('lodash')
const fs = require('fs-extra')
const url = require('url')
const prettyMs = require('pretty-ms')
const {extractOutLinks, makeLinkFun} = require('./extractLinks')

const toPath = '/home/john/WebstormProjects/testWarcreateElectron/pageO2.json'

class Archive {
  constructor (webview) {
    this.webview = webview
    this.wbReady = false
    this.debuggerUtil = window.du = new DebuggerUtil()
    this.interceptor = new NetInterceptor()
    this.warcWritter = new WarcWriter()
    this.archiveSeedQ = []
    this.crawlConfigKeptUrls = []
    this.onInitialSeed = true
    this.wasLoadError = false
    this.uri_r = ''
    this.seed = ''
    this.ipcMessage = this.ipcMessage.bind(this)
    this.webview.addEventListener('did-stop-loading', (e) => {
      if (!this.wbReady) {
        console.log('we are loaded')
        this.interceptor.start().then(() => {
          console.log('started')
          ipcRenderer.send('archive-ready')
        })
        this.wbReady = true
      }
    })
    this.webview.addEventListener('did-fail-load', (e) => {
      console.log('load failed', e)
      this.wasLoadError = true
    })
    this.webview.addEventListener('ipc-message', this.ipcMessage)
    ipcRenderer.on('archive', (e, uri_r) => {
      this.uri_r = uri_r
      this._doingSeed = true
      // this.webview.loadURL(uri_r)
      // let webContents = this.webview.getWebContents()
      // window._debugger = webContents.debugger
      this.archive()
      // let webContents = this.webview.getWebContents()
      // window._debugger = webContents.debugger
      // console.log('got archive', uri_r)
    })
    this.results = {}
    this.warcWritter.on('done', () => {
      this._timeEnd = performance.now()
      this.debuggerUtil.getAllLinks().then(links => {
        return this.debuggerUtil.getResourceFrameLinks().then(resources => {
          this.results[this.uri_r] = {links, resources, start: this._timeStart, stop: this._timeEnd}
          this.debuggerUtil.detach()
          if (this._next.length > 0) {
            this.uri_r = this._next.shift()
            console.log('next', this.uri_r, this._next.length)
            this.archive()
          } else {
            fs.writeJson(toPath, this.results, (err) => {
              console.log(err)
              console.log('done')
            })
          }
        })
      })
      console.log()
    })

    this.interceptor
      .on('error', (error) => {
        console.error('error', error)
      })
      .on('log', (msg) => {
        console.log('log', msg)
      })
  }

  archive () {
    this._timeStart = performance.now()
    let webContents = this.webview.getWebContents()
    this.interceptor.clearRequests()
    this.debuggerUtil.attach(webContents, this.uri_r).then(() => {
      console.log('attached')
      this.webview.loadURL(this.uri_r)
    }).catch(errA => {
      console.error(errA)
    })
  }

  freshSession (webContents) {
    return new Promise((resolve, reject) => {
      let opts = {
        origin: webContents.getURL(),
        storages: ['appcache', 'filesystem', 'local storage']
      }
      webContents.session.clearStorageData(opts, () => {
        console.log('cleared storage data')
        resolve()
      })
    })
  }

  extractDoctypeDom (webContents) {
    return new Promise((resolve, reject) => {
      webContents.executeJavaScript('document.doctype.name', false, doctype => {
        webContents.executeJavaScript('document.documentElement.outerHTML', false, dom => {
          resolve({doctype, dom})
        })
      })
    })
  }

  ipcMessage (event) {
    if (event.channel === 'injected-archive') {
      let msg = event.args[0]
      if (msg === 'did-finish-load') {
        console.log('real did finish load')
        if (!this.wasLoadError) {
          this.wasLoadError = false
          this.interceptor.switchMapKeys()
          this.debuggerUtil.getDom().then(({outerHTML}) => {
            let lf
            if (this._doingSeed) {
              lf = makeLinkFun('psd')
            } else {
              lf = makeLinkFun('po')
            }
            return this.debuggerUtil.extractLinks(lf).then(links => {
              this.interceptor.requests.get(this.uri_r).addSeedUrlBody(outerHTML)
              let {keep, outlinks} = links
              let opts = {
                seedUrl: this.uri_r,
                networkMonitor: this.interceptor,
                ua: this.webview.getUserAgent(),
                outlinks
              }
              process.nextTick(() => {
                if (this._doingSeed) {
                  this._next = []
                  console.log(this._next)
                  this._doingSeed = false
                  this.warcWritter.writeWarc(opts)
                } else {
                  this.warcWritter.appendToWarc(opts)
                }
              })
            })
          })
            .catch(lErr => {
              console.error(lErr)
            })
        } else {
          this.webview.loadURL(this.uri_r)
        }
      } else {
        console.log(msg)
      }
    }
  }
}

module.exports = Archive
