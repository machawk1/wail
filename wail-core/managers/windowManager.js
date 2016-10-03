import {app, BrowserWindow, ipcMain, shell, dialog} from 'electron'
import EventEmitter from 'eventemitter3'
import makeWindowWArgs from 'electron-window'
import Promise from 'bluebird'
import S from 'string'

async function dlExtensions (update = false) {
  if (process.env.NODE_ENV === 'development') {
    const installExtension = require('electron-devtools-installer')
    try {
      await installExtension.default(installExtension[ 'REACT_DEVELOPER_TOOLS' ], update)
    } catch (e) {
      console.error(e)
    }
  }
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
          notFirstLoad: wc.notFLoadUrl
        }
      } else {
        this.windows[ wc.name ].url = wc.url
        this.windows[ wc.name ].conf = wc.conf
      }
    })
    this.emit('windowman-init-done')
  }

  initIpc (control) {
    /* Loading */
    ipcMain.once('archiveMan-initial-load', (e, aLoadState) => {
      console.log('archive man intial load')
      let haveBoth = control.addLoadingState('archiveManWindow', aLoadState)
      if (haveBoth && this.windows[ 'mainWindow' ].loadComplete) {
        console.log('we have both load states, load is complete')
        this.send('mainWindow', 'got-all-collections', aLoadState)
        let wailHasBoth = control.wailHasLoadState('wailHasArchives')
        if (wailHasBoth) {
          console.log('wail has both loading states')
          this.loadComplete('@wailHasArchives')
        } else {
          // we have not sent the crawl man state but got archive man state
          console.log('wail has not recived the crawl state sending')
          control.wailHasLoadState('wailHasCrawls')
          let { crawlManWindow } = control.loadingState
          this.send('mainWindow', 'got-all-runs', crawlManWindow)
          this.loadComplete('@archiveMan-initial-load have both loading states but have not sent crawls')
        }
      } else /* we do not have crawl initial load */ {
        if (this.windows[ 'mainWindow' ].loadComplete) {
          console.log('mainWindow has loaded sending got-all-collections')
          this.send('mainWindow', 'got-all-collections', aLoadState)
          let wailHasBoth = control.wailHasLoadState('wailHasArchives')
          if (wailHasBoth) {
            throw new Error('we did not have both loading states @wailHasArchives but somehow we sent both states to wail')
          }
        }
        this.send('loadingWindow', 'initial-load', 'Archives have loaded')
      }
    })

    ipcMain.once('crawlMan-initial-load', (e, cLoadState) => {
      console.log('got crawlMan-initial-load')
      let haveBoth = control.addLoadingState('crawlManWindow', cLoadState)
      if (haveBoth && this.windows[ 'mainWindow' ].loadComplete) {
        console.log('we have both load states, load is complete')
        this.send('mainWindow', 'got-all-runs', cLoadState)
        let wailHasBoth = control.wailHasLoadState('wailHasCrawls')
        if (wailHasBoth) {
          console.log('wail has both loading states')
          this.loadComplete('@wailHasCrawls')
        } else {
          // we have not sent the archive man state
          console.log('wail has not recived the archive man state sending')
          let { archiveManWindow } = control.loadingState
          this.send('mainWindow', 'got-all-collections', archiveManWindow)
          this.loadComplete('@wailHasCrawls')
        }
      } else /* we do not have archive initial load */ {
        if (this.windows[ 'mainWindow' ].loadComplete) {
          console.log('mainWindow has loaded sending got-all-runs')
          this.send('mainWindow', 'got-all-runs', cLoadState)
          let wailHasBoth = control.wailHasLoadState('wailHasCrawls')
          if (wailHasBoth) {
            throw new Error('we did not have both loading states @wailHasCrawls but somehow we sent both states to wail')
          }
        }
        this.send('loadingWindow', 'initial-load', 'Crawls have been loaded')
      }
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

    ipcMain.on('get-all-collections', (event) => {
      this.windows[ 'archiveManWindow' ].window.webContents.send('get-all-collections')
    })

    ipcMain.on('got-all-collections', (event, cols) => {
      this.windows[ 'mainWindow' ].window.webContents.send('got-all-collections', cols)
      if (this.windows[ 'loadingWindow' ].open) {
        this.windows[ 'loadingWindow' ].window.webContents.send('got-all-collections')
      }
    })

    ipcMain.on('loading-finished', (event, payload) => {
      console.log('loading-finished')
      // this.windows[ 'loadingWindow' ].window.close()
    })

    /* Settings NewCrawlWindow */
    ipcMain.on('open-settings-window', (e) => {
      this.showSettingsWindow(control)
    })

    ipcMain.on('open-newCrawl-window', (e, colNames) => {
      console.log('got open newCrawl window')
      this.showNewCrawlWindow(control, colNames)
    })

    ipcMain.on('setting-hard-reset', (event, payload) => {
      console.log('got settings-hard-reset')
      control.settings.resetToDefault()
    })

    ipcMain.on('set-heritrix-usrpwd', (event, payload) => {
      console.log('got set heritrix usrpwd', payload)
      control.settings.rewriteHeritrixAuth(payload.usr, payload.pwd)
    })

    /* Heritrix */

    ipcMain.on('makeHeritrixJobConf', (event, confDetails) => {
      this.send('crawlManWindow', 'makeHeritrixJobConf', confDetails)
    })

    ipcMain.on('made-heritrix-jobconf', (event, confDetails) => {
      this.send('mainWindow', 'made-heritrix-jobconf', confDetails)
    })

    ipcMain.on('crawl-started', (event, jobId) => {
      console.log('got crawl-started')
      this.send('crawlManWindow', 'crawl-started', jobId)
    })

    ipcMain.on('stop-monitoring-job', (event, jobId) => {
      this.send('crawlManWindow', 'stop-monitoring-job', jobId)
    })

    ipcMain.on('crawljob-status-update', (event, payload) => {
      console.log('got crawljob-status-update', payload)
      this.send('mainWindow', 'crawljob-status-update', payload)
    })

    ipcMain.on('yes-crawls-running', () => {
      console.log('yes-crawls are running')
      control.serviceMan.killService('wayback')
        .then(() => {
          this.emit('killed-services')
        })
    })

    ipcMain.on('no-crawls-running', () => {
      console.log('no-crawls are running')
      control.serviceMan.killService('all')
        .then(() => {
          this.emit('killed-services')
        })
    })

    /* Wayback */

    ipcMain.on('crawl-to-collection', (event, colCrawl) => {
      this.send('mainWindow', 'crawl-to-collection', colCrawl)
    })

    ipcMain.on('create-collection', (event, nc) => {
      console.log('create-collection', nc)
      this.send('archiveManWindow', 'create-collection', nc)
    })

    ipcMain.on('created-collection', (event, nc) => {
      console.log('crated-collection', nc)
      this.send('mainWindow', 'created-collection', nc)
    })

    ipcMain.on('create-collection-failed', (event, fail) => {
      console.log('create-collection-failed', fail)
      this.send('mainWindow', 'create-collection-failed', fail)
    })

    ipcMain.on('update-metadata', (e, update) => {
      console.log('update-metadata',  update)
      this.send('archiveManWindow', 'update-metadata', update)
    })

    ipcMain.on('updated-metadata', (e, update) => {
      console.log( 'updated-metadata', update)
      this.send('mainWindow', 'updated-metadata', update)
    })

    ipcMain.on('add-warcs-to-col', (e, addMe) => {
      this.send('archiveManWindow', 'add-warcs-to-col', addMe)
    })

    ipcMain.on('added-warcs-to-col', (e, update) => {
      this.send('mainWindow', 'added-warcs-to-col', update)
    })

    /* Control */
    ipcMain.on('display-message', (event, m) => {
      console.log('display-message', m)
      this.send('mainWindow', 'display-message', m)
    })

    ipcMain.on('managers-error', (e, report) => {
      this.send('mainWindow', 'display-message', report)
    })

    ipcMain.on('send-to-requestDaemon', (event, request) => {
      this.send('reqDaemonWindow', 'handle-request', request)
    })

    ipcMain.on('handled-request', (event, request) => {
      this.send('mainWindow', 'handled-request', request)
    })

    ipcMain.on('start-service', (e, who) => {
      if (who === 'wayback') {
        control.serviceMan.startWayback()
          .then(() => {
            this.send('mainWindow', 'service-started', { who, wasError: false })
          })
          .catch((err) => {
            this.send('mainWindow', 'service-started', { who, wasError: true, err })
          })
      } else if (who === 'heritrix') {
        control.serviceMan.startHeritrix()
          .then(() => {
            this.send('mainWindow', 'service-started', { who, wasError: false })
          })
          .catch((err) => {
            this.send('mainWindow', 'service-started', { who, wasError: true, err })
          })
      }
    })

    ipcMain.on('kill-service', (e, who) => {
      control.serviceMan.killService(who)
        .then(() => {
          this.send('mainWindow', 'service-killed', { who, wasError: false })
        })
        .catch((err) => {
          this.send('mainWindow', 'service-killed', { who, wasError: true, err })
        })
    })

  }

  loadComplete (where) {
    console.log(`Load complete ${where}`)
    let lwin = this.windows[ 'loadingWindow' ].window
    let mwin = this.windows[ 'mainWindow' ].window
    if (!lwin && !mwin) {
      throw new Error(`loading completed but both loading and main windows were not created. complete ${where}`)
    }

    if (!lwin && mwin) {
      throw new Error(`loading completed but loading screen was not created but main window was. complete ${where}`)
    }

    if (lwin && !mwin) {
      throw new Error(`loading completed but loading screen was created but main window was not. complete ${where}`)
    }
    lwin.close()
    mwin.show()
    mwin.focus()
  }

  initWail (control) {
    // this.createWail(control)
    //   .then(() => {
    //     console.log('all windows loaded')
    //     this.windows['mainWindow'].window.show()
    //     // this.send('crawlManWindow','get-all-runs')
    //     // this.send('archiveManWindow','get-all-collections')
    //     // this.windows[ 'crawlManWindow' ].window.webContents.send('get-all-runs')
    //     // this.windows[ 'archiveManWindow' ].window.webContents.send('get-all-collections')
    //     // this.windows[ 'mainWindow' ].open = true
    //     // this.windows[ 'mainWindow' ].window.show()
    //     // this.windows[ 'mainWindow' ].window.focus()
    //     // start the loading of serivices finally
    //   })
    this.initIpc(control)
    console.log('init wail')
    this.showLoadingWindow(control)
      .then(() => {
        console.log('loading window shown')
        this.createRequestD(control)
          .then(() => {
            this.createArchiveMan(control)
              .then(() => {
                this.createCrawlMan(control)
                  .then(() => {
                    this.createWail(control)
                      .then(() => {
                        console.log('all windows loaded')
                      })
                  })
              })
          })
      })
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
    return this.windows[ 'mainWindow' ].loadComplete
  }

  allWindowsClosed () {
    let allClosed = true
    for (let [winName, winHolder] of Object.entries(this.windows)) {
      if (winHolder.open) {
        allClosed = false
      }
    }
    return allClosed
  }

  isWindowClosed (win) {
    return this.windows[ win ].window && !this.windows[ win ].open
  }

  showNewCrawlWindow (control, colNames) {
    if (!this.windows[ 'newCrawlWindow' ].open) {
      let {
        conf,
        url
      } = this.windows[ 'newCrawlWindow' ]
      this.windows[ 'newCrawlWindow' ].window = makeWindowWArgs.createWindow(conf)
      // this.windows[ 'newCrawlWindow' ].window = new BrowserWindow(conf)
      this.windows[ 'newCrawlWindow' ].window.showUrl(url, colNames, () => {
        console.log('new crawl window is ready to show')

        ipcMain.once('close-newCrawl-window', (event, payload) => {
          console.log('window man got close new crawl window', this.windows[ 'newCrawlWindow' ].window)
          if (this.windows[ 'newCrawlWindow' ].window) {
            this.windows[ 'newCrawlWindow' ].window.close()
          }
        })

        ipcMain.once('close-newCrawl-window-configured', (event, payload) => {
          this.windows[ 'mainWindow' ].window.webContents.send('crawljob-configure-dialogue', payload)
          if (this.windows[ 'newCrawlWindow' ].window) {
            this.windows[ 'newCrawlWindow' ].window.close()
          }
        })

        this.windows[ 'newCrawlWindow' ].open = true
        // this.windows[ 'newCrawlWindow' ].window.show()
        this.windows[ 'newCrawlWindow' ].window.focus()
      })
      // this.windows[ 'newCrawlWindow' ].window.on('ready-to-show', () => {
      //   console.log('new crawl window is ready to show')
      //
      //   ipcMain.once('close-newCrawl-window', (event, payload) => {
      //     console.log('window man got close new crawl window',this.windows[ 'newCrawlWindow' ].window)
      //     if(this.windows[ 'newCrawlWindow' ].window) {
      //       this.windows[ 'newCrawlWindow' ].window.destroy()
      //     }
      //   })
      //
      //   ipcMain.once('close-newCrawl-window-configured', (event, payload) => {
      //     this.windows[ 'mainWindow' ].window.webContents.send('crawljob-configure-dialogue', payload)
      //     if(this.windows[ 'newCrawlWindow' ].window) {
      //       this.windows[ 'newCrawlWindow' ].window.destroy()
      //     }
      //   })
      //
      //   this.windows[ 'newCrawlWindow' ].open = true
      //   this.windows[ 'newCrawlWindow' ].window.show()
      //   this.windows[ 'newCrawlWindow' ].window.focus()
      // })

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
    } else {
      console.log('new crawl window is open')
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
    return new Promise((resolve) => {
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
        this.windows[ 'loadingWindow' ].window = null
        this.windows[ 'loadingWindow' ].open = false
      })

      this.windows[ 'loadingWindow' ].window.loadURL(loadUrl)
      this.windows[ 'loadingWindow' ].window.on('ready-to-show', () => {
        console.log('loadingWindow is ready to show')
        this.windows[ 'loadingWindow' ].open = true
        this.windows[ 'loadingWindow' ].window.show()
        resolve()
      })
    })
  }

  createRequestD (control) {
    return new Promise((resolve) => {
      console.log('creating request daemon')
      let {
        conf,
        url
      } = this.windows[ 'reqDaemonWindow' ]
      this.windows[ 'reqDaemonWindow' ].window = new BrowserWindow(conf)
      this.windows[ 'reqDaemonWindow' ].window.loadURL(url)
      this.windows[ 'reqDaemonWindow' ].window.webContents.on('unresponsive', () => {
        this.emit('window-unresponsive', 'reqDaemonWindow')
      })

      this.windows[ 'reqDaemonWindow' ].window.webContents.on('crashed', () => {
        this.emit('window-crashed', 'reqDaemonWindow')
      })
      this.windows[ 'reqDaemonWindow' ].window.on('closed', () => {
        console.log('settings window is closed')
        this.windows[ 'reqDaemonWindow' ].window = null
        this.windows[ 'reqDaemonWindow' ].open = false
        if (this.allWindowsClosed()) {
          this.emit('all-windows-closed')
        }
      })
      this.windows[ 'reqDaemonWindow' ].window.on('ready-to-show', () => {
        console.log('reqDaemonWindow is ready to show')
        if (control.debug) {
          if (control.openBackGroundWindows) {
            this.windows[ 'reqDaemonWindow' ].window.show()
          }
          this.windows[ 'reqDaemonWindow' ].window.webContents.openDevTools()
        }
        this.windows[ 'reqDaemonWindow' ].open = true
        this.windows[ 'reqDaemonWindow' ].loadComplete = true
        resolve()
      })
    })
  }

  createCrawlMan (control) {
    return new Promise((resolve) => {
      console.log('creating crawl manager')
      let {
        conf,
        url
      } = this.windows[ 'crawlManWindow' ]
      this.windows[ 'crawlManWindow' ].window = new BrowserWindow(conf)
      this.windows[ 'crawlManWindow' ].window.loadURL(url)
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
      this.windows[ 'crawlManWindow' ].window.on('ready-to-show', () => {
        console.log('crawlManWindow is ready to show')
        this.windows[ 'crawlManWindow' ].loadComplete = true
        this.windows[ 'crawlManWindow' ].open = true
        if (control.debug) {
          if (control.openBackGroundWindows) {
            this.windows[ 'crawlManWindow' ].window.show()
          }
          this.windows[ 'crawlManWindow' ].window.webContents.openDevTools()
        }
        resolve()
      })
    })
  }

  createArchiveMan (control) {
    return new Promise((resolve) => {
      console.log('creating creating archive manager')
      let {
        conf,
        url
      } = this.windows[ 'archiveManWindow' ]
      this.windows[ 'archiveManWindow' ].window = new BrowserWindow(conf)
      this.windows[ 'archiveManWindow' ].window.loadURL(url)
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
      this.windows[ 'archiveManWindow' ].window.on('ready-to-show', () => {
        console.log('archiveManWindow is ready to show')
        this.windows[ 'archiveManWindow' ].open = true
        this.windows[ 'archiveManWindow' ].loadComplete = true
        if (control.debug) {
          if (control.openBackGroundWindows) {
            this.windows[ 'archiveManWindow' ].window.show()
          }

          this.windows[ 'archiveManWindow' ].window.webContents.openDevTools()
        }
        resolve()
      })
    })
  }

  createWail (control) {
    return new Promise((resolve) => {
      console.log('creating wail window')
      control.didClose = false
      if (process.env.NODE_ENV === 'development') {
        dlExtensions()
      }

      let { conf, url } = this.windows[ 'mainWindow' ]

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

      this.windows[ 'mainWindow' ].window.webContents.on('will-navigate', (event, url) => {
        if (!S(url).contains('wail.html')) {
          event.preventDefault()
        }
        console.log('mainWindow will navigate to', url)
      })

      this.windows[ 'mainWindow' ].window.on('close', (e) => {
        console.log('window man mainWindow close')
        control.resetLoadinState()
        if (this.windows[ 'reqDaemonWindow' ].open) {
          this.windows[ 'reqDaemonWindow' ].window.webContents.send('stop')
        }
        this.windows[ 'crawlManWindow' ].window.webContents.send('are-crawls-running')
      })

      this.windows[ 'mainWindow' ].window.on('closed', () => {
        console.log('mainWindow is closed')
        control.didClose = true
        this.windows[ 'mainWindow' ].window = null
        this.windows[ 'mainWindow' ].loadComplete = false
        this.windows[ 'mainWindow' ].open = false
      })

      this.windows[ 'mainWindow' ].window.on('show', () => {
        console.log('mainWindow is showing')
        this.windows[ 'mainWindow' ].open = true
      })
      this.windows[ 'mainWindow' ].window.on('ready-to-show', () => {
        this.windows[ 'mainWindow' ].loadComplete = true
        // this.windows[ 'mainWindow' ].window.focus()
        console.log('mainWindow is ready to show')
        if (this.windows[ 'loadingWindow' ].window) {
          this.windows[ 'loadingWindow' ].window.webContents.send('ui-ready')
        }

        if (control.bothLoadingStatesGotten()) {
          console.log('mainWindow loaded and we have gotten both the loading states')
          let { archiveManWindow, crawlManWindow } = control.loadingState
          control.uiLoadedFast()
          this.send('mainWindow', 'got-all-collections', archiveManWindow)
          this.send('mainWindow', 'got-all-runs', crawlManWindow)
          this.loadComplete('@mainWindow-ready-to-show')
        } else {
          let { archiveManWindow, crawlManWindow } = control.loadingState
          if (crawlManWindow) {
            console.log('mainWindow loaded and we have crawlMan state')
            control.wailHasLoadState('crawlManWindow')
            this.send('mainWindow', 'got-all-runs', crawlManWindow)
          }
          if (archiveManWindow) {
            console.log('mainWindow loaded and we have archiveMan state')
            control.wailHasLoadState('archiveManWindow')
            this.send('mainWindow', 'got-all-collections', archiveManWindow)
          }
        }

        resolve()
      })
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

  destroyWindow (who) {
    if (this.windows[ who ].open) {
      if (this.windows[ who ].window) {
        this.windows[ who ].window.destroy()
        this.windows[ who ].window = null
        this.windows[ who ].open = false
      } else {
        this.windows[ who ].open = false
      }
    } else {
      if (this.windows[ who ].window) {

      }
    }
  }

  closeAllWindows () {
    for (let [winName, winHolder] of Object.entries(this.windows)) {

      if (winName !== 'mainWindow') {
        if (winHolder.open && winHolder.window) {
          console.log(winName)
          winHolder.window.close()
        } else {
        }
      }

    }
  }

  windowWebcontentOn (winName, event, handler) {
    if (this.windows[ winName ].window) {
      this.windows[ winName ].window.webContents.on(event, handler)
      return true
    } else {
      return false
    }
  }
}
