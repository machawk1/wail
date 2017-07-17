import { BrowserWindow } from 'electron'

export default class TwitterSigninMan {
  constructor ({conf, url}) {
    this.conf = conf
    this.url = url
    this.open = false
    this.window = null
    this.emitOnClose = true
  }

  gotKeysNoEmitClosed () {
    this.emitOnClose = false
    this.window.close()
  }

  canceled () {
    this.window.close()
  }

  showTwitterLoginWindow (windowMan) {
    if (!this.open) {
      this.window = new BrowserWindow(this.conf)
      this.window.loadURL(this.url)
      this.window.on('ready-to-show', () => {
        console.log('twitterLoginWindow is ready to show')
        this.open = true
        this.window.show()
        this.window.focus()
      })

      this.window.webContents.on('unresponsive', () => {
        windowMan.emit('window-unresponsive', 'twitterLoginWindow')
      })

      this.window.webContents.on('crashed', () => {
        windowMan.emit('window-crashed', 'twitterLoginWindow')
      })

      this.window.on('closed', () => {
        if (this.emitOnClose) {
          windowMan.send('mainWindow', 'signed-into-twitter', {
            wasError: true,
            error: new Error('The Twitter sign in window was closed before complete the authentication')
          })
        }
        console.log('twitterLoginWindow is closed')
        this.window = null
        this.open = false
        this.emitOnClose = true
      })
    }
  }
}
