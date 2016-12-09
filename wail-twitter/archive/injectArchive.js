class InjectArchive {
  constructor () {
    console.log('creating')
    let { ipcRenderer, remote } = require('electron')
    this.ipc = ipcRenderer
    this.log = console.log.bind(console)
    this.remote = remote
    this.url = 'about:blank'
    this.webContents = null
    this.stopLoadingTimer = null
    this.processLoaded = this.processLoaded.bind(this)
    console.log(window.location.href)
  }

  processLoaded () {
    if (window.location.href !== 'about:blank') {
      // console.log(this.url)
      let wc = this.remote.getCurrentWebContents()
      wc.on('did-stop-loading', () => {
        this.log('did-stop-loading')
        clearTimeout(this.stopLoadingTimer)
        this.stopLoadingTimer = setTimeout(() => {
          this.ipc.sendToHost('injected-archive', 'did-finish-load')
        }, 1000)
      })
    }
  }

}

module.exports = InjectArchive
