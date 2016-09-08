import {app, BrowserWindow, ipcMain, shell} from 'electron'
import EventEmitter from 'eventemitter3'
import path from 'path'
import Promise from 'bluebird'

async function dlExtensions () {
  if (process.env.NODE_ENV === 'development') {
    const installExtension = require('electron-devtools-installer')
    try {
      await installExtension.default(installExtension[ 'REACT_DEVELOPER_TOOLS' ])
    } catch (e) {
      console.error(e)
    }
  }

  return true
}

export default class WindowManager extends EventEmitter {
  constructor () {
    super()
    this.windows = {
      accessibilityWindow: { window: null, url: null, open: false, conf: null },
      indexWindow: { window: null, url: null, open: false, conf: null },
      jobWindow: { window: null, url: null, open: false, conf: null },
      newCrawlWindow: { window: null, url: null, open: false, conf: null },
      settingsWindow: { window: null, url: null, open: false, conf: null },

      mainWindow: { window: null, url: null, open: false, conf: null, loadComplete: false },

      managersWindow: { window: null, url: null, conf: null, open: false, loadComplete: false },
      reqDaemonWindow: { window: null, url: null, conf: null, open: false, loadComplete: false },
      crawlManWindow: { window: null, url: null, conf: null, open: false, loadComplete: false },
      archiveManWindow: { window: null, url: null, conf: null, open: false, loadComplete: false },
      loadingWindow: { window: null, urls: false, open: false, conf: null }
    }
    this.coreWindows = [
      // 'managersWindow',
      'reqDaemonWindow',
      'crawlManWindow',
      'archiveManWindow'
    ]
    this.mwinClosed = false
    this.coreLoaded = false
  }

  init (winConfigs) {

    winConfigs.forEach(wc => {
      if (wc.name === 'loadingWindow') {
        this.windows[ wc.name ].conf = wc.conf

        this.windows[ wc.name ].urls = {
          firstLoad: wc.fLoadUrl,
          notFirstLoad: wc.notFLoadUrl,
        }
      } else {
        this.windows[ wc.name ].url = wc.url
        this.windows[ wc.name ].conf = wc.conf
      }
    })
    this.emit('windowman-init-done')
  }

  didCoreLoad () {
    let allLoaded = true
    this.coreWindows.forEach(wn => {
      if (this.windows[ wn ].win && !this.windows[ wn ].loadComplete) {
        allLoaded = false
      } else {
        console.log(this.windows[ wn ])
      }
    })
    return allLoaded
  }

  didMainLoad () {
    if (!this.windows[ 'mainWindow' ]) {
      return false
    }
    return this.windows[ 'mainWindow' ].loadComplete && this.windows[ 'mainWindow' ].open
  }

  allWindowsClosed () {
    let allClosed = true
    for (let [winName,winHolder] of Object.entries(this.windows)) {
      if (winHolder.open) {
        allClosed = false
      }
    }
    return allClosed
  }

  isWindowClosed (win) {
    return this.windows[ win ].window && !this.windows[ win ].open
  }

  showNewCrawlWindow (control) {
    if (!this.windows[ 'newCrawlWindow' ].open) {
      let {
        conf,
        url
      } = this.windows[ 'newCrawlWindow' ]
      this.windows[ 'newCrawlWindow' ].window = new BrowserWindow(conf)
      this.windows[ 'newCrawlWindow' ].window.loadURL(url)
      this.windows[ 'newCrawlWindow' ].window.on('ready-to-show', () => {
        console.log('new crawl window is ready to show')

        ipcMain.once('close-newCrawl-window', (event, payload) => {
          console.log('window man got close new crawl window')
          this.windows[ 'newCrawlWindow' ].window.destroy()
        })

        ipcMain.once('close-newCrawl-window-configured', (event, payload) => {
          this.windows[ 'mainWindow' ].window.webContents.send('crawljob-configure-dialogue', payload)
          this.windows[ 'newCrawlWindow' ].window.destroy()
        })

        this.windows[ 'newCrawlWindow' ].open = true
        this.windows[ 'newCrawlWindow' ].window.show()
        this.windows[ 'newCrawlWindow' ].window.focus()
      })

      this.windows[ 'newCrawlWindow' ].window.webContents.on('context-menu', (e, props) => {
        e.preventDefault()
        control.contextMenu.maybeShow(props, this.windows[ 'newCrawlWindow' ].window)
      })

      this.windows[ 'newCrawlWindow' ].window.webContents.on('unresponsive', () => {
        this.emit('window-unresponsive', 'newCrawlWindow')
      })

      this.windows[ 'newCrawlWindow' ].window.webContents.on('crashed', () => {
        this.emit('window-crashed', 'newCrawlWindow')
      })

      this.windows[ 'newCrawlWindow' ].window.on('closed', () => {
        console.log('new crawl window is closed')
        this.windows[ 'newCrawlWindow' ].window = null
        this.windows[ 'newCrawlWindow' ].open = false
      })
    }
  }

  showSettingsWindow (control) {
    let {
      conf, url, open
    } = this.windows[ 'settingsWindow' ]
    if (!open) {
      this.windows[ 'settingsWindow' ].window = new BrowserWindow(conf)
      this.windows[ 'settingsWindow' ].window.loadURL(url)
      this.windows[ 'settingsWindow' ].window.on('ready-to-show', () => {
        console.log('settings window is ready to show')
        ipcMain.once('close-settings-window', (event, payload) => {
          console.log('window man got close settings window')
          this.windows[ 'settingsWindow' ].window.destroy()
        })
        this.windows[ 'settingsWindow' ].open = true
        this.windows[ 'settingsWindow' ].window.show()
        this.windows[ 'settingsWindow' ].window.focus()
      })

      this.windows[ 'settingsWindow' ].window.webContents.on('context-menu', (e, props) => {
        e.preventDefault()
        control.contextMenu.maybeShow(props, this.windows[ 'settingsWindow' ].window)
      })

      this.windows[ 'settingsWindow' ].window.webContents.on('unresponsive', () => {
        this.emit('window-unresponsive', 'settingsWindow')
      })

      this.windows[ 'settingsWindow' ].window.webContents.on('crashed', () => {
        this.emit('window-crashed', 'settingsWindow')
      })

      this.windows[ 'settingsWindow' ].window.on('closed', () => {
        console.log('settings window is closed')
        this.windows[ 'settingsWindow' ].window = null
        this.windows[ 'settingsWindow' ].open = false
      })
    }
  }

  showLoadingWindow (control) {
    let {
      conf, urls, open
    } = this.windows[ 'loadingWindow' ]
    this.windows[ 'loadingWindow' ].window = new BrowserWindow(conf)
    var loadUrl  // windows.settingsWindowURL windows.mWindowURL
    if (control.loading && control.firstLoad) {
      loadUrl = urls.firstLoad
    } else {
      loadUrl = urls.notFirstLoad
      control.didLoad = true
    }

    this.windows[ 'loadingWindow' ].window.webContents.on('unresponsive', () => {
      this.emit('window-unresponsive', 'loadingWindow')
    })

    this.windows[ 'loadingWindow' ].window.webContents.on('crashed', () => {
      this.emit('window-crashed', 'loadingWindow')
    })
    this.windows[ 'loadingWindow' ].window.on('closed', () => {
      console.log('loadingWindow is closed')
      this.windows[ 'loadingWindow' ].window.destroy()
      this.windows[ 'loadingWindow' ].window = null
      this.windows[ 'loadingWindow' ].open = false
    })

    return new Promise((resolve) => {
      this.windows[ 'loadingWindow' ].window.loadURL(loadUrl)
      this.windows[ 'loadingWindow' ].window.on('ready-to-show', () => {
        console.log('loadingWindow is ready to show')
        this.windows[ 'loadingWindow' ].open = true
        this.windows[ 'loadingWindow' ].window.show()
        this.windows[ 'loadingWindow' ].window.focus()
        return resolve()
      })
    })
  }

  createRequestD (control) {
    console.log('creating request daemon')
    let {
      conf,
      url
    } = this.windows[ 'reqDaemonWindow' ]
    this.windows[ 'reqDaemonWindow' ].window = new BrowserWindow(conf)
    this.windows[ 'reqDaemonWindow' ].window.webContents.on('unresponsive', () => {
      this.emit('window-unresponsive', 'reqDaemonWindow')
    })

    this.windows[ 'reqDaemonWindow' ].window.webContents.on('crashed', () => {
      this.emit('window-crashed', 'reqDaemonWindow')
    })
    this.windows[ 'reqDaemonWindow' ].window.on('closed', () => {
      console.log('settings window is closed')
      this.windows[ 'reqDaemonWindow' ].window.destroy()
      this.windows[ 'reqDaemonWindow' ].window = null
      this.windows[ 'reqDaemonWindow' ].open = false
      if (this.allWindowsClosed()) {
        this.emit('all-windows-closed')
      }
    })

    return new Promise((resolve) => {
      this.windows[ 'reqDaemonWindow' ].window.loadURL(url)
      this.windows[ 'reqDaemonWindow' ].window.on('ready-to-show', () => {
        console.log('reqDaemonWindow is ready to show')
        if (control.debug && control.openBackGroundWindows) {
          this.windows[ 'reqDaemonWindow' ].window.show()
          this.windows[ 'reqDaemonWindow' ].window.webContents.openDevTools()
        }
        this.windows[ 'reqDaemonWindow' ].open = true
        this.windows[ 'reqDaemonWindow' ].loadComplete = true
        return resolve()
      })
    })
  }

  createCrawlMan (control) {
    console.log('creating crawl manager')
    let {
      conf,
      url
    } = this.windows[ 'crawlManWindow' ]
    this.windows[ 'crawlManWindow' ].window = new BrowserWindow(conf)
    this.windows[ 'crawlManWindow' ].window.webContents.on('unresponsive', () => {
      this.emit('window-unresponsive', 'crawlManWindow')
    })

    this.windows[ 'crawlManWindow' ].window.webContents.on('crashed', () => {
      this.emit('window-crashed', 'crawlManWindow')
    })
    this.windows[ 'crawlManWindow' ].window.on('closed', () => {
      console.log('crawlManWindow is closed')
      this.windows[ 'crawlManWindow' ].window = null
      this.windows[ 'crawlManWindow' ].open = false
      if (this.allWindowsClosed()) {
        this.emit('all-windows-closed')
      }
    })

    return new Promise((resolve) => {
      this.windows[ 'crawlManWindow' ].window.loadURL(url)
      this.windows[ 'crawlManWindow' ].window.on('ready-to-show', () => {
        console.log('crawlManWindow is ready to show')
        this.windows[ 'crawlManWindow' ].loadComplete = true
        this.windows[ 'crawlManWindow' ].open = true
        if (control.debug && control.openBackGroundWindows) {
          this.windows[ 'crawlManWindow' ].window.show()
          this.windows[ 'crawlManWindow' ].window.webContents.openDevTools()
        }
        return resolve()
      })
    })
  }

  createArchiveMan (control) {
    console.log('creating creating archive manager')
    let {
      conf,
      url
    } = this.windows[ 'archiveManWindow' ]
    this.windows[ 'archiveManWindow' ].window = new BrowserWindow(conf)
    this.windows[ 'archiveManWindow' ].window.webContents.on('unresponsive', () => {
      this.emit('window-unresponsive', 'archiveManWindow')
    })

    this.windows[ 'archiveManWindow' ].window.webContents.on('crashed', () => {
      this.emit('window-crashed', 'archiveManWindow')
    })
    this.windows[ 'archiveManWindow' ].window.on('closed', () => {
      console.log('settings window is closed')
      this.windows[ 'archiveManWindow' ].window.destroy()
      this.windows[ 'archiveManWindow' ].window = null
      this.windows[ 'archiveManWindow' ].open = false
      if (this.allWindowsClosed()) {
        this.emit('all-windows-closed')
      }
    })

    return new Promise((resolve) => {
      this.windows[ 'archiveManWindow' ].window.loadURL(url)
      this.windows[ 'archiveManWindow' ].window.on('ready-to-show', () => {
        console.log('archiveManWindow is ready to show')
        this.windows[ 'archiveManWindow' ].open = true
        this.windows[ 'archiveManWindow' ].loadComplete = true
        if (control.debug && control.openBackGroundWindows) {
          this.windows[ 'archiveManWindow' ].window.show()
          this.windows[ 'archiveManWindow' ].window.focus()
          this.windows[ 'archiveManWindow' ].window.webContents.openDevTools()
        }
        return resolve()
      })
    })
  }

  createWail (control) {
    console.log('creating wail window')
    control.didClose = false
    if (process.env.NODE_ENV === 'development') {
      const installExtension = require('electron-devtools-installer')
      try {
        installExtension.default(installExtension[ 'REACT_DEVELOPER_TOOLS' ])
      } catch (e) {
        console.error(e)
      }
    }

    let {
      conf,
      url
    } = this.windows[ 'mainWindow' ]

    this.windows[ 'mainWindow' ].window = new BrowserWindow(conf)
    this.windows[ 'mainWindow' ].window.loadURL(url)
    this.windows[ 'mainWindow' ].window.webContents.on('context-menu', (e, props) => {
      e.preventDefault()
      control.contextMenu.maybeShow(props, this.windows[ 'mainWindow' ].window)
    })

    this.windows[ 'mainWindow' ].window.webContents.on('unresponsive', () => {
      this.emit('window-unresponsive', 'mainWindow')
    })

    // this.windows[ 'mainWindow' ].window.webContents.on('new-window', (event, url) => {
    //   event.preventDefault()
    //   shell.openExternal(url)
    // })

    this.windows[ 'mainWindow' ].window.webContents.on('crashed', () => {
      this.emit('window-crashed', 'mainWindow')
    })

    this.windows[ 'mainWindow' ].window.on('close', (e) => {

    })

    this.windows[ 'mainWindow' ].window.on('closed', () => {
      console.log('new crawl window is closed')
      this.emit('main-window-closed')
      this.windows[ 'mainWindow' ].window = null
      this.windows[ 'mainWindow' ].open = false
    })
    return new Promise((resolve) => {
      this.windows[ 'mainWindow' ].window.on('ready-to-show', () => {
        console.log('mainWindow is ready to show')
        this.windows[ 'mainWindow' ].open = true
        this.windows[ 'mainWindow' ].window.show()
        this.windows[ 'mainWindow' ].window.focus()
        return resolve()
      })
    })
  }

  initWail (control) {
    console.log('init wail')
    this.showLoadingWindow(control)
      .then(() => this.createRequestD(control))
      .then(() => this.createArchiveMan(control))
      .then(() => this.createCrawlMan(control))
      .then(() => this.createWail(control))
      .then(() => {
        console.log('all windows loaded')
        ipcMain.on('setting-hard-reset', (event, payload) => {
          console.log('got settings-hard-reset')
          control.settings.resetToDefault()
        })

        ipcMain.on('set-heritrix-usrpwd', (event, payload) => {
          console.log('got set heritrix usrpwd', payload)
          control.settings.rewriteHeritrixAuth(payload.usr, payload.pwd)
        })

        ipcMain.on('crawljob-status-update', (event, payload) => {
          console.log('got crawljob-status-update', payload)
          this.windows[ 'mainWindow' ].window.webContents.send('mainWindow', 'crawljob-status-update', payload)
        })

        ipcMain.on('crawl-started', (event, jobId) => {
          console.log('got crawl-started')
          this.windows[ 'crawlManWindow' ].window.webContents.send('crawl-started', jobId)
        })

        ipcMain.on('get-all-runs', (event) => {
          console.log('got get-all-runs')
          this.windows[ 'crawlManWindow' ].window.webContents.send('get-all-runs')
        })

        ipcMain.on('got-all-runs', (event, runs) => {
          console.log('got get-all-runs')
          this.windows[ 'mainWindow' ].window.webContents.send('got-all-runs', runs)
          if (this.windows[ 'loadingWindow' ].open) {
            this.windows[ 'loadingWindow' ].window.webContents.send('got-all-runs')
          }
        })

        ipcMain.on('makeHeritrixJobConf', (event, confDetails) => {
          this.windows[ 'crawlManWindow' ].window.webContents.send('makeHeritrixJobConf', confDetails)
        })

        ipcMain.on('made-heritrix-jobconf', (event, confDetails) => {
          this.windows[ 'mainWindow' ].window.webContents.send('made-heritrix-jobconf', confDetails)
          this.windows[ 'archiveManWindow' ].window.webContents.send('made-heritrix-jobconf', confDetails)
        })

        ipcMain.on('get-all-collections', (event) => {
          this.windows[ 'archiveManWindow' ].window.webContents.send('get-all-collections')
        })

        ipcMain.on('got-all-collections', (event, cols) => {
          this.windows[ 'mainWindow' ].window.webContents.send('got-all-collections', cols)
          if (this.windows[ 'loadingWindow' ].open) {
            this.windows[ 'loadingWindow' ].window.webContents.send('got-all-collections')
          }
        })

        ipcMain.on('crawl-to-collection', (event, colCrawl) => {
          this.windows[ 'mainWindow' ].window.webContents.send('crawl-to-collection', colCrawl)
        })

        ipcMain.on('loading-finished', (event, payload) => {
          console.log('loading-finished')
          this.windows[ 'loadingWindow' ].window.close()
          this.windows[ 'mainWindow' ].window.show()
          this.windows[ 'mainWindow' ].window.focus()
        })

        // start the loading of serivices finally
        this.windows[ 'crawlManWindow' ].window.webContents.send('get-all-runs')
        this.windows[ 'archiveManWindow' ].window.webContents.send('get-all-collections')
      })
  }

  send (who, channel, what) {
    console.log('window manager send', who, channel, what)
    if (this.windows[ who ].window) {
      this.windows[ who ].window.webContents.send(channel, what)
    } else {
      console.error(`the window ${who} was not alive`)
      this.emit('send-failed', { who, channel, what })
    }
  }
}