import { BrowserWindow } from 'electron'
import Promise from 'bluebird'
import Path from 'path'
import EventEmitter from 'eventemitter3'

export default class Window extends EventEmitter {
  constructor ({conf, url, name, preventNav, closeHandler}) {
    super()
    this._winConf = conf
    this._name = name
    this._loadUrl = url
    this._winId = -1
    this._win = null
    this._loadComplete = false
    this._isClosed = true
    this._isOpen = true
    this._preventNav = preventNav || false
    this._closeHandler = closeHandler
  }

  _didOpen () {
    this._winId = this._win.id
    if (!this._name) {
      this._name = `window[${this._winId}]`
    }
    this._isClosed = false
    this._isOpen = true
    this._loadComplete = true
    this._addAdditionalListeners()
  }

  _didClose () {
    this._winId = -1
    this._isClosed = true
    this._isOpen = false
    this._loadComplete = false
    this.emit('window-closed', this._name)
  }

  haveClosed () {
    return this._isClosed && !this._win
  }

  _closed () {
    console.log(`window ${this._name} did close`)
    this._win = null
    this._didClose()
  }

  _unresponsive () {
    this.emit('window-unresponsive', this._name)
  }

  _crashed () {
    this.emit('window-crashed', this._name)
  }

  _addAdditionalListeners () {
    this._win.webContents.on('crashed', this._crashed)
    if (this._preventNav) {
      const loadedFile = Path.basename(this._loadUrl)
      this._win.webContents.on('will-navigate', (e, url) => {
        if (url.indexOf(loadedFile) === -1) {
          e.preventDefault()
        }
      })
    }

    if (this._closeHandler) {
      this._win.on('close', this._closeHandler.bind(this))
    }
  }

  open () {
    return new Promise((resolve) => {
      this._win = new BrowserWindow(this._winConf)
      this._win.loadURL(this._loadUrl)
      this._win.on('closed', ::this._closed)
        .on('unresponsive', ::this._unresponsive)
        .on('ready-to-show', () => {
          this._didOpen()
          console.log(`window ${this._name} is ready to show`)
          this._win.show()
          resolve()
        })
    })
  }

  openDevTools () {
    if (!this.haveClosed()) {
      this._win.webContents.openDevTools()
    }
  }

  sendMessage (channel, what) {
    if (!this.haveClosed()) {
      this._win.webContents.send(channel, what)
    }
  }

  loadURL (url) {
    if (!this.haveClosed()) {
      this._win.loadURL(this._loadUrl)
    }
  }

  close () {
    if (!this.haveClosed()) {
      this._win.close()
      this._win = null
      this._didClose()
    }
  }

  reload () {
    if (!this.haveClosed()) {
      this._win.reload()
    }
  }

  focus () {
    if (!this.haveClosed()) {
      this._win.focus()
    }
  }

  window () {
    return this._win
  }

  get isOpen () {
    return this._isOpen
  }

  get win () {
    return this._win
  }

  get isClosed () {
    return this._isClosed
  }

  get loadComplete () {
    return this._loadComplete
  }
}