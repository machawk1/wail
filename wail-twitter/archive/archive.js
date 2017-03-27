import WarcWriter from './warcWriter'
import WcRequestMonitor from './wcRequestMonitor'
import Promise from 'bluebird'
import EventEmitter from 'eventemitter3'

export default class Archive extends EventEmitter {
  constructor () {
    super()
    console.log('creating archive')
    this.archiveQ = []
    this.webview = document.getElementById('awv')
    this.wbReady = false
    this.saveTo = null
    this.networkMonitor = new WcRequestMonitor()
    this.warcWritter = new WarcWriter()
    this.warcWritter.on('error', (error) => {
      this.emit('error', {
        error,
        config: this.archiveQ[ 0 ]
      })
      this.maybeMore()
    })
    this.warcWritter.on('finished', () => {
      this.emit('finished', this.archiveQ[ 0 ])
      this.maybeMore()
    })
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
    if (this.archiveQ.length > 0) {
      this.archiveQ.push(arConfig)
    } else {
      this.startArchiving()
    }
  }

  startArchiving () {
    let { uri_r } = this.archiveQ[ 0 ]
    console.log('archiving', uri_r)
    let webContents = this.webview.getWebContents()
    this.networkMonitor.attach(webContents)
    this.webview.loadURL(uri_r)
  }

  maybeMore () {
    if (this.archiveQ.length > 0) {
      this.startArchiving()
    } else {
      console.log('no more to archive waiting')
    }
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
            let arConfig = this.archiveQ[ 0 ]
            let opts = {
              seedUrl: arConfig.uri_r,
              networkMonitor: this.networkMonitor,
              ua: this.webview.getUserAgent(),
              dtDom: ret,
              preserveA: false,
              toPath: arConfig.saveTo,
              header: arConfig
            }
            this.warcWritter.writeWarc(opts)
          })
      } else {
        console.log(msg)
      }
    }
  }
}
