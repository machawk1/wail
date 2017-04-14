import { BrowserWindow, ipcMain } from 'electron'
import util from 'util'
import partialRight from 'lodash/partialRight'
import EventEmitter from 'eventemitter3'
import makeWindowWArgs from 'electron-window'
import Promise from 'bluebird'
import S from 'string'
import OauthTwitter from 'electron-oauth-twitter'

const inpect = partialRight(util.inspect, {depth: 1, colors: true})

const dlExtensions = async (update = false) => {
  const installExtension = require('electron-devtools-installer')
  await Promise.all([
    installExtension.default(installExtension['REACT_DEVELOPER_TOOLS'], update),
    installExtension.default(installExtension['REDUX_DEVTOOLS'], update),
    installExtension.default(installExtension['REACT_PERF'], update)
  ])
}

export default class WindowManager extends EventEmitter {
  constructor () {
    super()
    this.twitterSignin = null
    this.windows = {
      accessibilityWindow: {window: null, url: null, open: false, conf: null},
      indexWindow: {window: null, url: null, open: false, conf: null},
      jobWindow: {window: null, url: null, open: false, conf: null},
      newCrawlWindow: {window: null, url: null, open: false, conf: null},
      settingsWindow: {window: null, url: null, open: false, conf: null},

      mainWindow: {window: null, url: null, open: false, conf: null, loadComplete: false},

      twitterMonitor: {window: null, url: null, conf: null, open: false, loadComplete: false},
      twitterLoginWindow: {window: null, url: null, conf: null, open: false, loadComplete: false},
      archiverWindow: {window: null, url: null, conf: null, open: false, loadComplete: false},

      managersWindow: {window: null, url: null, conf: null, open: false, loadComplete: false},
      reqDaemonWindow: {window: null, url: null, conf: null, open: false, loadComplete: false},
      crawlManWindow: {window: null, url: null, conf: null, open: false, loadComplete: false},
      archiveManWindow: {window: null, url: null, conf: null, open: false, loadComplete: false},
      loadingWindow: {window: null, urls: false, open: false, conf: null}
    }
    this.coreWindows = [
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
        this.windows[wc.name].conf = wc.conf
        this.windows[wc.name].urls = {
          firstLoad: wc.fLoadUrl,
          notFirstLoad: wc.notFLoadUrl
        }
      } else {
        this.windows[wc.name].url = wc.url
        this.windows[wc.name].conf = wc.conf
      }
    })
    this.emit('windowman-init-done')
  }

  initIpc (control) {
    /* Loading */
    ipcMain.once('archiveMan-initial-load', (e, aLoadState) => {
      console.log('archive man intial load')
      this.send('loadingWindow', 'initial-load', 'Archives have loaded')
      let haveBoth = control.addLoadingState('archiveManWindow', aLoadState)
      if (haveBoth && this.windows['mainWindow'].loadComplete) {
        console.log('we have both load states, load is complete')
        this.send('mainWindow', 'got-all-collections', aLoadState)
        let wailHasBoth = control.wailHasLoadState('wailHasArchives')
        if (wailHasBoth) {
          console.log('wail has both loading states')
          // this.loadComplete('@wailHasArchives')
        } else {
          // we have not sent the crawl man state but got archive man state
          console.log('wail has not recived the crawl state sending')
          control.wailHasLoadState('wailHasCrawls')
          let {crawlManWindow} = control.loadingState
          this.send('mainWindow', 'got-all-runs', crawlManWindow)
          // this.loadComplete('@archiveMan-initial-load have both loading states but have not sent crawls')
        }
      } else /* we do not have crawl initial load */ {
        if (this.windows['mainWindow'].loadComplete) {
          console.log('mainWindow has loaded sending got-all-collections')
          this.send('mainWindow', 'got-all-collections', aLoadState)
          let wailHasBoth = control.wailHasLoadState('wailHasArchives')
          if (wailHasBoth) {
            throw new Error('we did not have both loading states @wailHasArchives but somehow we sent both states to wail')
          }
        }
      }
    })

    ipcMain.once('crawlMan-initial-load', (e, cLoadState) => {
      console.log('got crawlMan-initial-load')
      this.send('loadingWindow', 'initial-load', 'Crawls have been loaded')
      let haveBoth = control.addLoadingState('crawlManWindow', cLoadState)
      if (haveBoth && this.windows['mainWindow'].loadComplete) {
        console.log('we have both load states, load is complete')
        this.send('mainWindow', 'got-all-runs', cLoadState)
        let wailHasBoth = control.wailHasLoadState('wailHasCrawls')
        if (wailHasBoth) {
          console.log('wail has both loading states')
          // this.loadComplete('@wailHasCrawls')
        } else {
          // we have not sent the archive man state
          console.log('wail has not recived the archive man state sending')
          let {archiveManWindow} = control.loadingState
          this.send('mainWindow', 'got-all-collections', archiveManWindow)
          // this.loadComplete('@wailHasCrawls')
        }
      } else /* we do not have archive initial load */ {
        if (this.windows['mainWindow'].loadComplete) {
          console.log('mainWindow has loaded sending got-all-runs')
          this.send('mainWindow', 'got-all-runs', cLoadState)
          let wailHasBoth = control.wailHasLoadState('wailHasCrawls')
          if (wailHasBoth) {
            throw new Error('we did not have both loading states @wailHasCrawls but somehow we sent both states to wail')
          }
        }
      }
    })

    ipcMain.on('get-all-runs', (event) => {
      console.log('got get-all-runs')
      this.windows['crawlManWindow'].window.webContents.send('get-all-runs')
    })

    ipcMain.on('got-all-runs', (event, runs) => {
      console.log('got get-all-runs')
      this.windows['mainWindow'].window.webContents.send('got-all-runs', runs)
      if (this.windows['loadingWindow'].open) {
        this.windows['loadingWindow'].window.webContents.send('got-all-runs')
      }
    })

    ipcMain.on('get-all-collections', (event) => {
      this.windows['archiveManWindow'].window.webContents.send('get-all-collections')
    })

    ipcMain.on('got-all-collections', (event, cols) => {
      this.windows['mainWindow'].window.webContents.send('got-all-collections', cols)
      if (this.windows['loadingWindow'].open) {
        this.windows['loadingWindow'].window.webContents.send('got-all-collections')
      }
    })

    ipcMain.on('loading-finished', (event, payload) => {
      console.log('loading-finished')
      this.loadComplete('@loadCompleteAndWAILGood')
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
      this.send('mainWindow', 'made-heritrix-jobconf', confDetails.forMain)
      this.send('archiveManWindow', 'made-heritrix-jobconf', confDetails.forArchives)
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

    ipcMain.on('remove-crawl', (e, jobId) => {
      this.send('crawlManWindow', 'remove-crawl', jobId)
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
      control.serviceMan.restartWayback()
        .then(() => this.send('mainWindow', 'restarted-wayback', {wasError: false}))
        .catch((err) => this.send('mainWindow', 'restarted-wayback', {wasError: true, err}))
    })

    ipcMain.on('create-collection-failed', (event, fail) => {
      console.log('create-collection-failed', fail)
      this.send('mainWindow', 'create-collection-failed', fail)
    })

    ipcMain.on('update-metadata', (e, update) => {
      console.log('update-metadata', update)
      this.send('archiveManWindow', 'update-metadata', update)
    })

    ipcMain.on('updated-metadata', (e, update) => {
      console.log('updated-metadata', update)
      this.send('mainWindow', 'updated-metadata', update)
    })

    ipcMain.on('add-warcs-to-col', (e, addMe) => {
      this.send('archiveManWindow', 'add-warcs-to-col', addMe)
    })

    ipcMain.on('added-warcs-to-col', (e, update) => {
      this.send('mainWindow', 'added-warcs-to-col', update)
      control.serviceMan.restartWayback()
        .then(() => this.send('mainWindow', 'restarted-wayback', {wasError: false}))
        .catch((err) => this.send('mainWindow', 'restarted-wayback', {wasError: true, err}))
    })

    ipcMain.on('add-multi-warcs-to-col', (e, multi) => {
      this.send('archiveManWindow', 'add-multi-warcs-to-col', multi)
    })

    ipcMain.on('addfs-warcs-to-col', (e, addMe) => {
      this.send('archiveManWindow', 'addfs-warcs-to-col', addMe)
    })

    ipcMain.on('add-warcs-to-col-wcreate', (e, addMe) => {
      this.send('archiveManWindow', 'add-warcs-to-col-wcreate', addMe)
    })

    /* Control */
    ipcMain.on('log-error-display-message', (event, em) => {
      console.log('log-error-display-message', em)
      this.send('mainWindow', 'log-error-display-message', em)
    })

    ipcMain.on('display-message', (event, m) => {
      console.log('display-message', m)
      this.send('mainWindow', 'display-message', m)
    })

    ipcMain.on('managers-error', (e, report) => {
      this.send('mainWindow', 'display-message', report)
    })

    ipcMain.on('send-to-requestDaemon', (event, request) => {
      console.log('send-to-requestDaemon', request)
      this.send('reqDaemonWindow', 'handle-request', request)
    })

    ipcMain.on('handled-request', (event, request) => {
      this.send('mainWindow', 'handled-request', request)
    })

    ipcMain.on('start-service', (e, who) => {
      if (who === 'wayback') {
        control.serviceMan.startWayback()
          .then(() => {
            this.send('mainWindow', 'service-started', {who, wasError: false})
          })
          .catch((err) => {
            this.send('mainWindow', 'service-started', {who, wasError: true, err})
          })
      } else if (who === 'heritrix') {
        control.serviceMan.startHeritrix()
          .then(() => {
            this.send('mainWindow', 'service-started', {who, wasError: false})
          })
          .catch((err) => {
            this.send('mainWindow', 'service-started', {who, wasError: true, err})
          })
      }
    })

    ipcMain.on('kill-service', (e, who) => {
      control.serviceMan.killService(who)
        .then(() => {
          this.send('mainWindow', 'service-killed', {who, wasError: false})
        })
        .catch((err) => {
          this.send('mainWindow', 'service-killed', {who, wasError: true, err})
        })
    })

    ipcMain.on('restart-wayback', () => {
      control.serviceMan.restartWayback()
        .then(() => this.send('mainWindow', 'restarted-wayback', {wasError: false}))
        .catch((err) => this.send('mainWindow', 'restarted-wayback', {wasError: true, err}))
    })

    /* Twitter */
    ipcMain.on('sign-in-twitter', () => {
      if (!this.twitterSignin) {
        this.twitterSignin = new OauthTwitter({
          key: global.settings.get('twitter.wailKey'),
          secret: global.settings.get('twitter.wailSecret')
        })
      }
      process.nextTick(() => {
        this.twitterSignin.startRequest().then((result) => {
          const accessToken = result.oauth_access_token
          const accessTokenSecret = result.oauth_access_token_secret
          let twitter = global.settings.get('twitter')
          twitter.userSignedIn = true
          twitter.userToken = accessToken
          twitter.userSecret = accessTokenSecret
          global.settings.set('twitter', twitter)
          this.send('mainWindow', 'signed-into-twitter', {wasError: false, accessToken, accessTokenSecret})
        }).catch((error) => {
          console.error(error, error.stack)
          this.send('mainWindow', 'signed-into-twitter', {wasError: true, error})
        })
      })
    })

    ipcMain.on('monitor-twitter-account', (e, config) => {
      if (this.windows['twitterMonitor'].open) {
        this.send('twitterMonitor', 'monitor-twitter-account', config)
      } else {
        this.createTwitterM(control)
          .then(() => {
            console.log('twitter monitor alive')
            this.send('twitterMonitor', 'monitor-twitter-account', config)
          })
      }
    })

    /* warcreate wail */
    ipcMain.on('archive-uri-r', (e, config) => {
      if (this.windows['archiverWindow'].open) {
        this.send('archiverWindow', 'archive-uri-r', config)
      } else {
        this.createArchiver(control)
          .then(() => {
            console.log('archiverWindow alive')
            this.send('archiverWindow', 'archive-uri-r', config)
          })
      }
    })
  }

  loadComplete (where) {
    console.log(`Load complete ${where}`)
    let lwin = this.windows['loadingWindow'].window
    if (this.windows['loadingWindow'].window) {
      lwin.close()
    }
    let mwin = this.windows['mainWindow'].window

    mwin.show()
    // mwin.webContents.openDevTools()
    mwin.focus()
  }

  async initWail (control) {
    this.initIpc(control)
    console.log('init wail')
    if (process.env.NODE_ENV === 'development') {
      await dlExtensions()
    }
    await this.showLoadingWindow(control)
    await this.createWail(control)
    await this.createArchiveMan(control)
    await this.createCrawlMan(control)
    await this.createRequestD(control)
    console.log('all windows loaded')
  }

  didCoreLoad () {
    let allLoaded = true
    this.coreWindows.forEach(wn => {
      if (this.windows[wn].win && !this.windows[wn].loadComplete) {
        allLoaded = false
      } else {
        console.log(this.windows[wn])
      }
    })
    return allLoaded
  }

  didMainLoad () {
    if (!this.windows['mainWindow']) {
      return false
    }
    return this.windows['mainWindow'].loadComplete
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
    return this.windows[win].window && !this.windows[win].open
  }

  showNewCrawlWindow (control, colNames) {
    if (!this.windows['newCrawlWindow'].open) {
      let {conf, url} = this.windows['newCrawlWindow']
      this.windows['newCrawlWindow'].window = makeWindowWArgs.createWindow(conf)
      // this.windows[ 'newCrawlWindow' ].window = new BrowserWindow(conf)
      this.windows['newCrawlWindow'].window.showUrl(url, colNames, () => {
        console.log('new crawl window is ready to show')

        ipcMain.once('close-newCrawl-window', (event, payload) => {
          console.log('window man got close new crawl window', this.windows['newCrawlWindow'].window)
          if (this.windows['newCrawlWindow'].window) {
            this.windows['newCrawlWindow'].window.close()
          }
        })

        ipcMain.once('close-newCrawl-window-configured', (event, payload) => {
          this.windows['mainWindow'].window.webContents.send('crawljob-configure-dialogue', payload)
          if (this.windows['newCrawlWindow'].window) {
            this.windows['newCrawlWindow'].window.close()
          }
        })

        this.windows['newCrawlWindow'].open = true
        // this.windows[ 'newCrawlWindow' ].window.show()
        this.windows['newCrawlWindow'].window.focus()
      })

      this.windows['newCrawlWindow'].window.webContents.on('context-menu', (e, props) => {
        e.preventDefault()
        control.contextMenu.maybeShow(props, this.windows['newCrawlWindow'].window)
      })

      this.windows['newCrawlWindow'].window.webContents.on('unresponsive', () => {
        this.emit('window-unresponsive', 'newCrawlWindow')
      })

      this.windows['newCrawlWindow'].window.webContents.on('crashed', () => {
        this.emit('window-crashed', 'newCrawlWindow')
      })

      this.windows['newCrawlWindow'].window.on('closed', () => {
        console.log('new crawl window is closed')
        this.windows['newCrawlWindow'].window = null
        this.windows['newCrawlWindow'].open = false
      })
    } else {
      console.log('new crawl window is open')
    }
  }

  showTwitterLoginWindow (control) {
    let {conf, url, open} = this.windows['twitterLoginWindow']
    if (!open) {
      this.windows['twitterLoginWindow'].window = new BrowserWindow(conf)
      this.windows['twitterLoginWindow'].window.loadURL(url)
      this.windows['twitterLoginWindow'].window.on('ready-to-show', () => {
        console.log('twitterLoginWindow is ready to show')
        if (control.debug) {
          if (control.openBackGroundWindows) {
            this.windows['crawlManWindow'].window.show()
          }
          this.windows['crawlManWindow'].window.webContents.openDevTools()
        }
        this.windows['twitterLoginWindow'].open = true
        this.windows['twitterLoginWindow'].window.show()
        this.windows['twitterLoginWindow'].window.focus()
      })

      this.windows['twitterLoginWindow'].window.webContents.on('unresponsive', () => {
        this.emit('window-unresponsive', 'twitterLoginWindow')
      })

      this.windows['twitterLoginWindow'].window.webContents.on('crashed', () => {
        this.emit('window-crashed', 'twitterLoginWindow')
      })

      this.windows['twitterLoginWindow'].window.on('closed', () => {
        console.log('twitterLoginWindow is closed')
        this.windows['twitterLoginWindow'].window = null
        this.windows['twitterLoginWindow'].open = false
      })
    }
    //
  }

  showSettingsWindow (control) {
    let {conf, url, open} = this.windows['settingsWindow']
    if (!open) {
      this.windows['settingsWindow'].window = new BrowserWindow(conf)
      this.windows['settingsWindow'].window.loadURL(url)
      this.windows['settingsWindow'].window.on('ready-to-show', () => {
        console.log('settings window is ready to show')
        ipcMain.once('close-settings-window', (event, payload) => {
          console.log('window man got close settings window')
          this.windows['settingsWindow'].window.destroy()
        })
        this.windows['settingsWindow'].open = true
        this.windows['settingsWindow'].window.show()
        this.windows['settingsWindow'].window.focus()
      })

      this.windows['settingsWindow'].window.webContents.on('context-menu', (e, props) => {
        e.preventDefault()
        control.contextMenu.maybeShow(props, this.windows['settingsWindow'].window)
      })

      this.windows['settingsWindow'].window.webContents.on('unresponsive', () => {
        this.emit('window-unresponsive', 'settingsWindow')
      })

      this.windows['settingsWindow'].window.webContents.on('crashed', () => {
        this.emit('window-crashed', 'settingsWindow')
      })

      this.windows['settingsWindow'].window.on('closed', () => {
        console.log('settings window is closed')
        this.windows['settingsWindow'].window = null
        this.windows['settingsWindow'].open = false
      })
    }
  }

  showLoadingWindow (control) {
    return new Promise((resolve) => {
      let {conf, urls, open} = this.windows['loadingWindow']
      this.windows['loadingWindow'].window = new BrowserWindow(conf)
      let loadUrl  // windows.settingsWindowURL windows.mWindowURL*
      if (control.loading && control.firstLoad) {
        console.log('first load')
        loadUrl = urls.firstLoad
      } else {
        loadUrl = urls.notFirstLoad
        control.didLoad = true
      }

      this.windows['loadingWindow'].window.webContents.on('unresponsive', () => {
        this.emit('window-unresponsive', 'loadingWindow')
      })

      this.windows['loadingWindow'].window.webContents.on('crashed', () => {
        this.emit('window-crashed', 'loadingWindow')
      })

      this.windows['loadingWindow'].window.on('closed', () => {
        console.log('loadingWindow is closed')
        this.windows['loadingWindow'].window = null
        this.windows['loadingWindow'].open = false
      })

      this.windows['loadingWindow'].window.loadURL(loadUrl)
      this.windows['loadingWindow'].window.on('ready-to-show', () => {
        console.log('loadingWindow is ready to show')
        this.windows['loadingWindow'].open = true
        this.windows['loadingWindow'].window.show()
        // this.windows['loadingWindow'].window.webContents.openDevTools()
        resolve()
      })
    })
  }

  createTwitterM (control) {
    return new Promise((resolve) => {
      console.log('creating twitterMonitor')
      let {conf, url} = this.windows['twitterMonitor']
      this.windows['twitterMonitor'].window = new BrowserWindow(conf)
      this.windows['twitterMonitor'].window.loadURL(url)
      this.windows['twitterMonitor'].window.on('unresponsive', () => {
        this.emit('window-unresponsive', 'twitterMonitor')
      })

      this.windows['twitterMonitor'].window.webContents.on('crashed', () => {
        this.emit('window-crashed', 'twitterMonitor')
      })
      this.windows['twitterMonitor'].window.on('closed', () => {
        console.log('twitterMonitor is closed')
        this.windows['twitterMonitor'].window = null
        this.windows['twitterMonitor'].open = false
        if (this.allWindowsClosed()) {
          this.emit('all-windows-closed')
        }
      })
      this.windows['twitterMonitor'].window.on('show', () => {
        console.log('twitterMonitor is showing')
      })
      this.windows['twitterMonitor'].window.on('ready-to-show', () => {
        console.log('twitterMonitor is ready to show')
        if (control.debug) {
          if (control.openBackGroundWindows) {
            this.windows['twitterMonitor'].window.show()
          }
          this.windows['twitterMonitor'].window.webContents.openDevTools()
        }
        this.windows['twitterMonitor'].open = true
        this.windows['twitterMonitor'].loadComplete = true
        resolve()
      })
    })
  }

  createArchiver (control) {
    return new Promise((resolve) => {
      console.log('creating archiverWindow')
      let {conf, url} = this.windows['archiverWindow']
      this.windows['archiverWindow'].window = new BrowserWindow(conf)
      this.windows['archiverWindow'].window.loadURL(url)
      this.windows['archiverWindow'].window.on('unresponsive', () => {
        this.emit('window-unresponsive', 'archiverWindow')
      })

      this.windows['archiverWindow'].window.webContents.on('crashed', () => {
        this.emit('window-crashed', 'archiverWindow')
      })
      this.windows['archiverWindow'].window.on('closed', () => {
        console.log('archiverWindow is closed')
        this.windows['archiverWindow'].window = null
        this.windows['archiverWindow'].open = false
        if (this.allWindowsClosed()) {
          this.emit('all-windows-closed')
        }
      })
      this.windows['archiverWindow'].window.on('show', () => {
        console.log('archiverWindow is showing')
      })
      this.windows['archiverWindow'].window.on('ready-to-show', () => {
        console.log('archiverWindow is ready to show')
        if (control.debug) {
          if (control.openBackGroundWindows) {
            this.windows['archiverWindow'].window.show()
          }
          // this.windows['archiverWindow'].window.show()
          this.windows['archiverWindow'].window.webContents.openDevTools()
        }
        this.windows['archiverWindow'].open = true
        this.windows['archiverWindow'].loadComplete = true
        resolve()
      })
    })
  }

  createRequestD (control) {
    return new Promise((resolve) => {
      console.log('creating request daemon')
      let {conf, url} = this.windows['reqDaemonWindow']
      this.windows['reqDaemonWindow'].window = new BrowserWindow(conf)
      this.windows['reqDaemonWindow'].window.loadURL(url)
      this.windows['reqDaemonWindow'].window.on('unresponsive', () => {
        this.emit('window-unresponsive', 'reqDaemonWindow')
      })

      this.windows['reqDaemonWindow'].window.webContents.on('crashed', () => {
        this.emit('window-crashed', 'reqDaemonWindow')
      })
      this.windows['reqDaemonWindow'].window.on('closed', () => {
        console.log('settings window is closed')
        this.windows['reqDaemonWindow'].window = null
        this.windows['reqDaemonWindow'].open = false
        if (this.allWindowsClosed()) {
          this.emit('all-windows-closed')
        }
      })
      this.windows['reqDaemonWindow'].window.on('show', () => {
        console.log('reqDaemonWindow is showing')
      })
      this.windows['reqDaemonWindow'].window.on('ready-to-show', () => {
        console.log('reqDaemonWindow is ready to show')
        if (control.debug) {
          if (control.openBackGroundWindows) {
            this.windows['reqDaemonWindow'].window.show()
          }
          this.windows['reqDaemonWindow'].window.webContents.openDevTools()
        }
        // this.windows[ 'reqDaemonWindow' ].window.show()
        // this.windows[ 'reqDaemonWindow' ].window.webContents.openDevTools()
        this.windows['reqDaemonWindow'].open = true
        this.windows['reqDaemonWindow'].loadComplete = true
        resolve()
      })
    })
  }

  createCrawlMan (control) {
    return new Promise((resolve) => {
      console.log('creating crawl manager')
      let {conf, url} = this.windows['crawlManWindow']
      this.windows['crawlManWindow'].window = new BrowserWindow(conf)
      this.windows['crawlManWindow'].window.loadURL(url)
      this.windows['crawlManWindow'].window.on('unresponsive', () => {
        this.emit('window-unresponsive', 'crawlManWindow')
      })

      this.windows['crawlManWindow'].window.webContents.on('crashed', () => {
        this.emit('window-crashed', 'crawlManWindow')
      })
      this.windows['crawlManWindow'].window.on('closed', () => {
        console.log('crawlManWindow is closed')
        this.windows['crawlManWindow'].window = null
        this.windows['crawlManWindow'].open = false
        if (this.allWindowsClosed()) {
          this.emit('all-windows-closed')
        }
      })
      this.windows['crawlManWindow'].window.on('ready-to-show', () => {
        console.log('crawlManWindow is ready to show')
        this.windows['crawlManWindow'].loadComplete = true
        this.windows['crawlManWindow'].open = true
        if (control.debug) {
          if (control.openBackGroundWindows) {
            this.windows['crawlManWindow'].window.show()
          }
          this.windows['crawlManWindow'].window.webContents.openDevTools()
        }
        // this.windows[ 'crawlManWindow' ].window.webContents.openDevTools()
        resolve()
      })
    })
  }

  createArchiveMan (control) {
    return new Promise((resolve) => {
      console.log('creating creating archive manager')
      let {conf, url} = this.windows['archiveManWindow']
      this.windows['archiveManWindow'].window = new BrowserWindow(conf)
      this.windows['archiveManWindow'].window.loadURL(url)
      this.windows['archiveManWindow'].window.on('unresponsive', () => {
        this.emit('window-unresponsive', 'archiveManWindow')
      })

      this.windows['archiveManWindow'].window.webContents.on('crashed', () => {
        this.emit('window-crashed', 'archiveManWindow')
      })
      this.windows['archiveManWindow'].window.on('closed', () => {
        console.log('settings window is closed')
        this.windows['archiveManWindow'].window.destroy()
        this.windows['archiveManWindow'].window = null
        this.windows['archiveManWindow'].open = false
        if (this.allWindowsClosed()) {
          this.emit('all-windows-closed')
        }
      })

      this.windows['archiveManWindow'].window.on('ready-to-show', () => {
        console.log('archiveManWindow is ready to show')
        this.windows['archiveManWindow'].open = true
        this.windows['archiveManWindow'].loadComplete = true
        if (control.debug) {
          if (control.openBackGroundWindows) {
            this.windows['archiveManWindow'].window.show()
          }
          this.windows['archiveManWindow'].window.webContents.openDevTools()
        }
        // this.windows['archiveManWindow'].window.show()
        // this.windows[ 'archiveManWindow' ].window.webContents.openDevTools()
        resolve()
      })
    })
  }

  createWail (control) {
    console.log('creating wail window')
    control.didClose = false
    return new Promise((resolve) => {
      let {conf, url} = this.windows['mainWindow']
      this.windows['mainWindow'].window = new BrowserWindow(conf)
      this.windows['mainWindow'].window.loadURL(url)
      this.windows['mainWindow'].window.webContents.on('context-menu', (e, props) => {
        e.preventDefault()
        control.contextMenu.maybeShow(props, this.windows['mainWindow'].window)
      })
        // destroyed
      this.windows['mainWindow'].window.webContents.on('destroyed', () => {
        console.log('current wbc is destroyed')
      })
      this.windows['mainWindow'].window.webContents.on('did-finish-load', () => {
        if (this.windows['mainWindow'].open) {
          let tm = setTimeout(() => {
            this.send('archiveManWindow', 'get-all-collections')
            this.send('crawlManWindow', 'get-all-runs')
            clearTimeout(tm)
          }, 2000)
        }
      })

      this.windows['mainWindow'].window.webContents.on('unresponsive', () => {
        this.emit('window-unresponsive', 'mainWindow')
      })

      this.windows['mainWindow'].window.on('unresponsive', () => {
        this.emit('window-unresponsive', 'mainWindow')
      })

      this.windows['mainWindow'].window.webContents.on('crashed', () => {
        this.emit('window-crashed', 'mainWindow')
      })

      this.windows['mainWindow'].window.webContents.on('will-navigate', (event, url) => {
        if (!S(url).contains('wail.html')) {
          event.preventDefault()
        }
        console.log('mainWindow will navigate to', url)
      })

      this.windows['mainWindow'].window.on('close', (e) => {
        console.log('window man mainWindow close')
        if (this.windows['reqDaemonWindow'].open) {
          this.send('reqDaemonWindow', 'stop', '')
        }
        this.closeAllWindows()
          // this.send('crawlManWindow', 'are-crawls-running', '')
      })

      this.windows['mainWindow'].window.on('closed', () => {
        console.log('mainWindow is closed')
        control.resetLoadinState()
        control.didClose = true
        this.windows['mainWindow'].window = null
        this.windows['mainWindow'].loadComplete = false
        this.windows['mainWindow'].open = false
      })

      this.windows['mainWindow'].window.on('show', () => {
        console.log('mainWindow is showing')
        this.windows['mainWindow'].open = true
      })
      this.windows['mainWindow'].window.on('ready-to-show', () => {
        this.windows['mainWindow'].loadComplete = true
          // this.windows[ 'mainWindow' ].window.focus()
        console.log('mainWindow is ready to show')
        if (this.windows['loadingWindow'].window) {
          this.windows['loadingWindow'].window.webContents.send('ui-ready')
        }

        if (control.bothLoadingStatesGotten()) {
          console.log('mainWindow loaded and we have gotten both the loading states')
          let {archiveManWindow, crawlManWindow} = control.loadingState
          control.uiLoadedFast()
          this.send('mainWindow', 'got-all-collections', archiveManWindow)
          this.send('mainWindow', 'got-all-runs', crawlManWindow)
          this.send('loadingWindow', 'initial-load', 'both-loaded')
            // this.loadComplete('@mainWindow-ready-to-show')
        } else {
          let {archiveManWindow, crawlManWindow} = control.loadingState
          if (crawlManWindow) {
            console.log('mainWindow loaded and we have crawlMan state')
            control.wailHasLoadState('crawlManWindow')
            this.send('mainWindow', 'got-all-runs', crawlManWindow)
            this.send('loadingWindow', 'initial-load', 'Archives have loaded')
          }
          if (archiveManWindow) {
            console.log('mainWindow loaded and we have archiveMan state')
            control.wailHasLoadState('archiveManWindow')
            this.send('mainWindow', 'got-all-collections', archiveManWindow)
            this.send('loadingWindow', 'initial-load', 'Crawls have been loaded')
          }
        }
        resolve()
      })
    }
    )
  }

  send (who, channel, what) {
    console.log('window manager send', who, channel, inpect(what))
    if (this.windows[who].window) {
      this.windows[who].window.webContents.send(channel, what)
    } else {
      console.error(`the window ${who} was not alive`)
      this.emit('send-failed', {who, channel, what})
    }
  }

  destroyWindow (who) {
    if (this.windows[who].open) {
      if (this.windows[who].window) {
        this.windows[who].window.destroy()
        this.windows[who].window = null
        this.windows[who].open = false
      } else {
        this.windows[who].open = false
      }
    } else {
      if (this.windows[who].window) {

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
    if (this.windows[winName].window) {
      this.windows[winName].window.webContents.on(event, handler)
      return true
    } else {
      return false
    }
  }
}
