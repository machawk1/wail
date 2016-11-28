import {ipcRenderer, remote} from 'electron'
import util from 'util'
import cheerio from 'cheerio'
import WarcWriter from './warcWriter'
import NetworkMonitor from './networkMonitor'
import Promise from 'bluebird'
import url from 'url'
import EventEmitter from 'eventemitter3'

export default class Archive extends EventEmitter {
  constructor () {
    super()
    console.log('creating archive')
    this.webview = document.getElementById('awv')
    this.wbReady = false
    this.saveTo = null
    this.networkMonitor = new NetworkMonitor()
    this.warcWritter = new WarcWriter()
    this.warcWritter.on('error', (error) => {
      this.emit('error', {
        error,
        config: this.arConfig
      })
    })
    this.warcWritter.on('finished', () => {
      this.emit('finished', this.arConfig)
    })
    this.uri_r = ''
    this.webview.addEventListener('did-stop-loading', (e) => {
      console.log('it finished loading')
      if (!this.wbReady) {
        console.log('we are loaded')
        this.wbReady = true
        this.emit('ready')
      }
    })

    this.webview.addEventListener('console-message', (e) => {
      console.log('Guest page logged a message:', e.message)
    })

    this.ipcMessage = this.ipcMessage.bind(this)
    this.webview.addEventListener('ipc-message', this.ipcMessage)
  }

  archiveUriR (arConfig) {
    let { uri_r, saveTo } = arConfig
    this.uri_r = uri_r
    this.saveTo = saveTo
    this.arConfig = arConfig
    console.log(uri_r)
    let webContents = this.webview.getWebContents()
    this.freshSession(webContents)
      .then(() => {
        this.networkMonitor.attach(webContents)
        this.webview.loadURL(uri_r)
      })
  }

  freshSession (webContents) {
    console.log('freshSession')
    return new Promise((resolve, reject) => {
      console.log('in promise')
      let opts = {
        origin: webContents.getURL(),
        storages: [ 'appcache', 'filesystem', 'local storage' ]
      }
      webContents.session.clearStorageData(opts, () => {
        console.log('cleared storage data')
        webContents.clearHistory()
        resolve()
      })

    })
  }

  extractDoctypeDom (webContents) {
    return new Promise((resolve, reject) => {
      webContents.executeJavaScript('document.doctype.name', false, doctype => {
        webContents.executeJavaScript('document.documentElement.outerHTML', false, dom => {
          resolve({ doctype, dom })
        })
      })
    })
  }

  ipcMessage (event) {
    if (event.channel === 'injected-archive') {
      let msg = event.args[ 0 ]
      if (msg === 'did-finish-load') {
        console.log('real did finish load')
        // this.webview.send('get-resources')
        let webContents = this.webview.getWebContents()
        this.networkMonitor.detach(webContents)
        this.extractDoctypeDom(webContents)
          .then(ret => {
            let opts = {
              seedUrl: this.uri_r, networkMonitor: this.networkMonitor,
              ua: this.webview.getUserAgent(),
              dtDom: ret, preserveA: false,
              toPath: this.saveTo,
              header: this.arConfig
            }
            this.warcWritter.writeWarc(opts)
          })
      } else {
        console.log(msg)
      }
    }
  }
}
