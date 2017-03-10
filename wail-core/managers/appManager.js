import Promise from 'bluebird'
import S from 'string'
import fs from 'fs-extra'
import Path from 'path'
import bunyan from 'bunyan'
import { app } from 'electron'
import SettingsManager from './settingsManager'
import ServiceManager from './serviceManager'
import Pather from '../util/pather'
import ContextMenu from '../util/contextMenu'

S.TMPL_OPEN = '{'
S.TMPL_CLOSE = '}'

const isDev = process.env.NODE_ENV === 'development'

export default class AppManager2 {
  constructor (debug = false, notDebugUI = false, openBackGroundWindows = false) {
    this.isQuitting = false
    this.settingsMan = null
    this.pathMan = null
    this.w = 1000
    this.h = 600
    this.iconp = null
    this.base = null
    this.notDebugUI = notDebugUI
    this.debug = debug
    this.openBackGroundWindows = openBackGroundWindows
    this.didClose = false
    this.crawlsRunning = false
    this.didLoad = false
    this.loading = true
    this.firstLoad = false
    this.contextMenu = null
    this.serviceMan = null
    this.winConfigs = null
    this.winConf = null
    this.logPath = null
    this.loadingState = {
      archiveManWindow: null,
      crawlManWindow: null,
      haveBothStates: false,
      wailHasArchives: false,
      wailHasCrawls: false,
      wailHasBothStates: false
    }
  }

  async init () {
    let userData = null
    this.contextMenu = new ContextMenu()
    if (process.env.NODE_ENV === 'development') {
      this.base = process.cwd()
      require('electron-debug')({
        showDevTools: true
      })
    } else {
      this.base = app.getAppPath()
      userData = app.getPath('userData')
    }
    let loadFrom = `${this.base}/wail-ui`
    this.pathMan = global.pathMan = new Pather(this.base)
    global.basePath = this.base
    let logPath, dbPath, v = app.getVersion()
    let settingsPath = dbPath = userData
    if (process.env.NODE_ENV === 'development') {
      settingsPath = Path.join(this.base, 'wail-config')
      logPath = Path.join(this.base, 'wail-config', 'waillogs')// path.join(control.base, 'waillogs')
      dbPath = Path.join(this.base, 'wail-config')
      v = '1.0.0'
    } else {
      logPath = Path.join(settingsPath, 'waillogs')// path.join(app.getPath('userData'), 'waillogs')
    }
    fs.ensureFileSync(Path.join(logPath, 'wail.log'))
    fs.ensureFileSync(Path.join(logPath, 'wail-ui.log'))
    global.logger = bunyan.createLogger({
      name: 'wail-ui-main',
      streams: [
        {
          level: 'info',
          path: Path.join(logPath, 'wail.log') // log ERROR and above to a file
        }
      ]
    })
    this.logPath = logPath
    this.settingsMan = new SettingsManager(this.base, app.getPath('documents'), settingsPath, dbPath, v)
    this._setupWindowConfigs(loadFrom)
    await this.settingsMan.configure()
    if (!this.settingsMan.get('didFirstLoad')) {
      this.firstLoad = true
    }
    await this.serviceMan.init()
    this.serviceMan = new ServiceManager(this.settingsMan)
    global.wailVersion = this.version
    global.wailLogp = this.logPath
    global.settings = this.settingsMan
    global.serviceMan = this.serviceMan
    global.accessLogPath = Path.join(this.logPath, 'accessibility.log')
    global.jobLogPath = Path.join(this.logPath, 'jobs.log')
    global.indexLogPath = Path.join(this.logPath, 'index.log')
    global.requestDaemonLogPath = Path.join(this.logPath, 'requestDaemon.log')
    global.wailLogp = Path.join(this.logPath, 'wail.log')
    global.wailUILogp = Path.join(this.logPath, 'wail-ui.log')
  }

  _setupWindowConfigs (loadFrom) {
    if (process.platform === 'darwin') {
      this.iconp = Path.normalize(Path.join(this.base, 'icons/whale.icns'))
      this.w = 1100
      this.h = 700
    } else if (process.platform === 'win32') {
      // console.log('windows')
      this.iconp = Path.normalize(Path.join(this.base, 'icons/whale.ico'))
      this.w = 1000
      this.h = 700
    } else {
      this.iconp = Path.normalize(Path.join(this.base, 'icons/linux/whale_64.png'))
      this.w = 1000
      this.h = 600
    }

    this.winConf = {
      width: this.w,
      minWidth: this.w,
      // maxWidth: this.w,
      height: this.h,
      minHeight: this.h,
      // maxHeight: this.h,
      title: 'Web Archiving Integration Layer',
      maximizable: false,
      show: false,
      icon: this.iconp,
      webPreferences: {
        allowRunningInsecureContent: true,
        allowDisplayingInsecureContent: true
      }
    }
    this.winConfigs = [
      {
        conf: this.winConf,
        url: `file://${loadFrom}/wail.html`,
        name: 'mainWindow'
      },
      {
        conf: this.winConf,
        fLoadUrl: `file://${loadFrom}/loadingScreens/firstTime/loadingScreen.html`,
        notFLoadUrl: `file://${loadFrom}/loadingScreens/notFirstTime/loadingScreen.html`,
        name: 'loadingWindow'
      },
      {
        conf: {
          width: 900,
          height: process.platform === 'win32' ? 400 : 400,
          // maxHeight: process.platform === 'win32' ? 380 : 360,
          modal: true,
          show: false,
          minimizable: false,
          autoHideMenuBar: true,
          webPreferences: {
            allowRunningInsecureContent: true,
            allowDisplayingInsecureContent: true
          }
        },
        url: `${loadFrom}/childWindows/newCrawl/newCrawl.html`,
        name: 'newCrawlWindow'
      },
      {
        conf: {
          width: 784,
          height: 350,
          modal: false,
          show: false,
          minimizable: false,
          autoHideMenuBar: true
        },
        url: `file://${loadFrom}/childWindows/settings/settingsW.html`,
        name: 'settingsWindow'
      },
      {
        conf: {
          show: false,
          webPreferences: {
            webSecurity: false
          }
        },
        url: `file://${loadFrom}/background/accessibility.html`,
        name: 'accessibilityWindow'
      },
      {
        conf: {
          show: false,
          webPreferences: {
            webSecurity: false
          }
        },
        url: `file://${loadFrom}/background/twitterMonitor.html`,
        name: 'twitterMonitor'
      },
      {
        conf: {
          show: false,
          webPreferences: {
            webSecurity: false
          }
        },
        url: `file://${loadFrom}/background/archiver.html`,
        name: 'archiverWindow'
      },
      {
        conf: {
          show: false,
          webPreferences: {
            webSecurity: false
          }
        },
        url: `file://${loadFrom}/background/indexer.html`,
        name: 'indexWindow'
      },
      {
        conf: {
          show: false,
          webPreferences: {
            webSecurity: false
          }
        },
        url: `file://${loadFrom}/background/jobs.html`,
        name: 'jobWindow'
      },
      {
        conf: {
          show: false,
          webPreferences: {
            webSecurity: false
          }
        },
        url: `file://${loadFrom}/background/requestDaemon.html`,
        name: 'reqDaemonWindow'
      },
      {
        conf: {
          show: false,
          webPreferences: {
            webSecurity: false
          }
        },
        url: `file://${loadFrom}/background/managers.html`,
        name: 'managersWindow',
      },
      {
        conf: {
          show: false,
          webPreferences: {
            webSecurity: false
          }
        },
        url: `file://${loadFrom}/background/crawls.html`,
        name: 'crawlManWindow'
      },
      {
        conf: {
          show: false,
          webPreferences: {
            webSecurity: false
          }
        },
        url: `file://${loadFrom}/background/archives.html`,
        name: 'archiveManWindow'
      }
    ]
  }

  addLoadingState (who, state) {
    this.loadingState[who] = state
    let {archiveManWindow, crawlManWindow} = this.loadingState
    if (archiveManWindow && crawlManWindow) {
      this.loadingState.haveBothStates = true
    }
    return this.loadingState.haveBothStates
  }

  wailHasLoadState (has) {
    this.loadingState[has] = true
    let {wailHasArchives, wailHasCrawls} = this.loadingState
    if (wailHasArchives && wailHasCrawls) {
      this.loadingState.wailHasBothStates = true
    }
    return this.loadingState.wailHasBothStates
  }

  bothLoadingStatesGotten () {
    return this.loadingState.haveBothStates
  }

  doesWailHaveBothLoadStates () {
    return this.loadingState.wailHasBothStates
  }

  resetLoadinState () {
    this.loadingState.archiveManWindow = null
    this.loadingState.crawlManWindow = null
    this.loadingState.haveBothStates = false
    this.loadingState.wailHasArchives = false
    this.loadingState.wailHasCrawls = false
    this.loadingState.wailHasBothStates = false
  }

  uiLoadedFast () {
    this.loadingState.wailHasArchives = true
    this.loadingState.wailHasCrawls = true
    this.loadingState.wailHasBothStates = true
  }
}