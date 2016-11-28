if (!window.__archive) {
  console.log('archive has not been created', window.location.href)
  let { ipcRenderer, remote } = require('electron')
  window.__archive = {
    ipc: ipcRenderer,
    log: console.log.bind(console),
    remote: remote,
    webContents: null,
    stopLoadingTimer: null,
    count: 0,
    processLoaded () {
      if (window.location.href !== 'about:blank') {
        // console.log(this.url)
        let wc = this.remote.getCurrentWebContents()
        wc.on('did-stop-loading', () => {
          this.log('did-stop-loading')
          clearTimeout(this.stopLoadingTimer)
          if (this.count === 0) {
            this.stopLoadingTimer = setTimeout(() => {
              this.ipc.sendToHost('injected-archive', 'did-finish-load')
              this.count += 1
              wc.removeAllListeners('did-stop-loading')
            }, 3000)
          }
        })
      }
    }
  }
}

process.once('loaded', () => {
  __archive.processLoaded()
})

process.on('uncaughtException', (err) => {
  console.log(`uncaughtException: ${err}`, err, err.stack)
})

process.on('unhandledRejection', (reason, p) => {
  console.log(reason, p)
})
process.on('warning', (warning) => {
  console.warn(warning.name);    // Print the warning name
  console.warn(warning.message); // Print the warning message
  console.warn(warning.stack);   // Print the stack trace
})