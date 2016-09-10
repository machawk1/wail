import 'babel-polyfill'
import {
  app, BrowserWindow,
  Menu, shell, ipcMain
} from 'electron'
import path from 'path'
import Logger from './logger/logger'
import menuTemplate from './menu/mainMenu'
import AppManager from '../wail-core/managers/appManager'
import WindowManager from '../wail-core/managers/windowManager'

app.commandLine.appendSwitch('js-flags', '--expose_gc --harmony')
// do not lower the priority of our invisible background windows
app.commandLine.appendSwitch('disable-renderer-backgrounding')
app.commandLine.appendSwitch('enable-usermedia-screen-capturing')
app.commandLine.appendSwitch('allow-http-screen-capture')

const winMan = new WindowManager()
const control = new AppManager()
const debug = true, notDebugUI = true, openBackGroundWindows = true

export function showSettingsWindow (parent) {
  console.log('showing settings window')
  winMan.showSettingsWindow(control)
}

winMan.once('windowman-init-done', () => {
  console.log('windowman init is done')
  winMan.initWail(control)
})

winMan.on('window-unresponsive', who => {
  console.log('we have a unresponsive window ', who)
})

winMan.on('window-crashed', who => {
  console.log('we have a crashed window ', who)
})

winMan.on('killed-services',() => {
  winMan.closeAllWindows()
})


app.on('ready', () => {
  console.log('app ready')
  app.isQuitting = false
  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate))
  let base = path.resolve('./')
  let loadFrom = __dirname
  let userData = null

  if (process.env.NODE_ENV === 'development') {
    require('electron-debug')({
      showDevTools: true
    })
  } else {
    base = app.getAppPath()
    loadFrom = `${base}/wail-ui`
    userData = app.getPath('userData')
  }

  control.init(base, userData, app.getVersion(), loadFrom, debug, notDebugUI, openBackGroundWindows)
    .then(() => {
      global.wailVersion = control.version
      global.wailLogp = control.logPath
      global.settings = control.settingsMan
      global.serviceMan = control.serviceMan
      global.accessLogPath = path.join(control.logPath, 'accessibility.log')
      global.jobLogPath = path.join(control.logPath, 'jobs.log')
      global.indexLogPath = path.join(control.logPath, 'index.log')
      global.requestDaemonLogPath = path.join(control.logPath, 'requestDaemon.log')

      let logPath = path.join(control.logPath, 'wail.log')
      //  bdb
      global.logger = new Logger({ path: logPath })

      global.wailLogp = logPath
      global.wailUILogp = path.join(control.logPath, 'wail-ui.log')

      global.showSettingsMenu = showSettingsWindow

      winMan.init(control.winConfigs)
    })

  // setUp()
  // createBackGroundWindows(control.notDebugUI)
  // createWindow()
  // createLoadingWindow()
})

app.on('window-all-closed', () => {
  console.log('all windows closed')
  if (process.platform !== 'darwin') {
    console.log('not darwin we should close')
    app.quit()
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (control.didClose) {
    winMan.initWail(control)
  }
})

app.on('before-quit', () => {
  // console.log('before-quit')

  global.logger.cleanUp()
})

