import Pather from '../util/pather'
import ContextMenu from '../util/contextMenu'
import Promise from 'bluebird'
import SettingsManager from './settingsManager'
import ServiceManager from './serviceManager'
import S from 'string'
import fs from 'fs-extra'
import bunyan from 'bunyan'

S.TMPL_OPEN = '{'
S.TMPL_CLOSE = '}'

const isDev = process.env.NODE_ENV === 'development'
const loadingSequence = ['lsDone']

export default class AppManager {
  constructor () {
    this.isQuitting = false
    this.settingsMan = null
    this.pathMan = null
    this.w = 1000
    this.h = 600
    this.iconp = null
    this.tray = null
    this.base = null
    this.notDebugUI = false
    this.debug = true
    this.openBackGroundWindows = true
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

  init (base, userData, version, loadFrom, docsPath, debug = false, notDebugUI = false, openBackGroundWindows = false) {
    return new Promise((resolve) => {
      this.notDebugUI = notDebugUI
      this.debug = debug
      this.openBackGroundWindows = openBackGroundWindows
      this.contextMenu = new ContextMenu()
      this.base = base
      this.pathMan = global.pathMan = new Pather(this.base)
      let logPath
      let dbPath
      let v = version
      let settingsPath = dbPath = userData
      if (process.env.NODE_ENV === 'development') {
        settingsPath = this.pathMan.joinWBase('wail-config')
        logPath = this.pathMan.joinWBase('wail-config', 'waillogs')// path.join(control.base, 'waillogs')
        dbPath = this.pathMan.joinWBase('wail-config')
        v = '1.0.0-rc.3.0.0s'
      } else {
        logPath = this.pathMan.join(settingsPath, 'waillogs')// path.join(app.getPath('userData'), 'waillogs')
      }
      //  bdb
      fs.ensureFileSync(this.pathMan.join(logPath, 'wail.log'))
      fs.ensureFileSync(this.pathMan.join(logPath, 'wail-ui.log'))
      global.logger = bunyan.createLogger({
        name: 'wail-ui-main',
        streams: [
          {
            level: 'info',
            path: this.pathMan.join(logPath, 'wail.log') // log ERROR and above to a file
          }
        ]
      })
      this.logPath = logPath
      this.settingsMan = new SettingsManager(base, docsPath, settingsPath, dbPath, v)
      return this.settingsMan.configure()
        .then(() => {
          if (!this.settingsMan.get('didFirstLoad')) {
            this.firstLoad = true
            this.settingsMan.set('didFirstLoad', true)
          }
          if (process.platform === 'darwin') {
            this.iconp = this.pathMan.normalizeJoinWBase('icons/whale.icns') // path.normalize(path.join(control.base, 'src/icons/whale.icns'))
            this.w = 1100
            this.h = 700
          } else if (process.platform === 'win32') {
            // console.log('windows')
            this.iconp = this.pathMan.normalizeJoinWBase('icons/whale.ico')
            this.w = 1000
            this.h = 600
          } else {
            this.iconp = this.pathMan.normalizeJoinWBase('icons/linux/whale_64.png')
            this.w = 1000
            this.h = 600
          }

          this.serviceMan = new ServiceManager(this.settingsMan)
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
              webSecurity: false
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
                autoHideMenuBar: true
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
              conf: {show: false},
              url: `file://${loadFrom}/background/accessibility.html`,
              name: 'accessibilityWindow'
            },
            {
              conf: {show: false},
              url: `file://${loadFrom}/background/twitterMonitor.html`,
              name: 'twitterMonitor'
            },
            {
              conf: {show: false},
              url: `file://${loadFrom}/background/archiver.html`,
              name: 'archiverWindow'
            },
            {
              conf: {show: false},
              url: `file://${loadFrom}/background/indexer.html`,
              name: 'indexWindow'
            },
            {
              conf: {show: false},
              url: `file://${loadFrom}/background/jobs.html`,
              name: 'jobWindow'
            },
            {
              conf: {show: false},
              url: `file://${loadFrom}/background/requestDaemon.html`,
              name: 'reqDaemonWindow'
            },
            {
              conf: {show: false},
              url: `file://${loadFrom}/background/managers.html`,
              name: 'managersWindow'
            },
            {
              conf: {show: false},
              url: `file://${loadFrom}/background/crawls.html`,
              name: 'crawlManWindow'
            },
            {
              conf: {show: false},
              url: `file://${loadFrom}/background/archives.html`,
              name: 'archiveManWindow'
            }
          ]
          return resolve()
        })
    })
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
    this.loadingState.archiveManWindow = this.loadingState.crawlManWindow = null
    this.loadingState.haveBothStates = this.loadingState.wailHasArchives = this.loadingState.wailHasCrawls = this.loadingState.wailHasBothStates = false
  }

  uiLoadedFast () {
    this.loadingState.wailHasArchives = this.loadingState.wailHasCrawls = this.loadingState.wailHasBothStates = true
  }

}
