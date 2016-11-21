const { ipcRenderer, remote } = require('electron')
const util = require('util')
const cheerio = require('cheerio')
const WarcWriter = require('./warcWriter')
const NetworkMonitor = require('./networkMonitor')
const Promise = require('bluebird')
const url = require('url')

const savePath = '/home/john/WebstormProjects/testWarcreateElectron/something/page.html'

class Archive {
  constructor (webview) {
    console.log('creating archive')
    this.webview = webview
    this.wbReady = false
    this.networkMonitor = new NetworkMonitor()
    this.warcWritter = new WarcWriter()
    this.uri_r = ''
    this.webview.addEventListener('did-stop-loading', (e) => {
      console.log('it finished loading')
      if (!this.wbReady) {
        console.log('we are loaded')
        ipcRenderer.send('archive-ready')
        this.wbReady = true
      }
    })

    this.webview.addEventListener('console-message', (e) => {
      console.log('Guest page logged a message:', e.message)
    })

    this.ipcMessage = this.ipcMessage.bind(this)
    this.webview.addEventListener('ipc-message', this.ipcMessage)
    ipcRenderer.on('archive', (e, uri_r) => {
      this.uri_r = uri_r
      console.log(uri_r)
      let webContents = this.webview.getWebContents()
      this.freshSession(webContents)
        .then(() => {
          this.networkMonitor.attach(webContents)
          this.webview.loadURL(uri_r)

        })

      // this.webview.openDevTools()
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
              dtDom: ret, preserveA: false
            }
            this.warcWritter.writeWarc(opts)
          })
      } else {
        console.log(msg)
      }
    }
  }
}

module.exports = Archive