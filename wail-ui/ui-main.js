import '../wailPollyfil'
import { app, Menu, dialog } from 'electron'
import path from 'path'
import menuTemplate from './menu/mainMenu'
import AppManager from '../wail-core/managers/appManager'
import WindowManager from '../wail-core/managers/windowManager'

process.on('uncaughtException', (err) => {
  console.log(`uncaughtException: ${err}`, err, err.stack)
  let {logger} = global
  if (logger) {
    logger.fatal(err)
  }
  dialog.showErrorBox('uncaughtException', `${err} ${err.stack}`)
  // logger.log('error', 'electron-main error message[ %s ], stack[ %s ]', err.message, err.stack)
  app.quit()
})

const winMan = new WindowManager()
const control = global.__wailControl = new AppManager()
const debug = false, notDebugUI = true, openBackGroundWindows = false

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

winMan.on('killed-services', () => {
  winMan.closeAllWindows()
})

winMan.on('send-failed', (report) => {
  console.log('send failed')
  console.log(report)
})

app.commandLine.appendSwitch('js-flags', '--harmony')
app.commandLine.appendSwitch('disable-renderer-backgrounding')

app.on('ready', () => {
  console.log('app ready')
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

  control.init(base, userData, app.getVersion(), loadFrom, app.getPath('documents'), debug, notDebugUI, openBackGroundWindows)
    .then(() => {
      global.wailVersion = control.version
      global.wailLogp = control.logPath
      global.settings = control.settingsMan
      global.serviceMan = control.serviceMan
      global.accessLogPath = path.join(control.logPath, 'accessibility.log')
      global.jobLogPath = path.join(control.logPath, 'jobs.log')
      global.indexLogPath = path.join(control.logPath, 'index.log')
      global.requestDaemonLogPath = path.join(control.logPath, 'requestDaemon.log')

      global.wailLogp = path.join(control.logPath, 'wail.log')
      global.wailUILogp = path.join(control.logPath, 'wail-ui.log')

      global.showSettingsMenu = showSettingsWindow
      global.windowMan = winMan
      winMan.init(control.winConfigs)
    })
})

app.on('window-all-closed', () => {
  console.log('all windows closed')
  if (process.platform !== 'darwin') {
    control.isQuitting = true
    console.log('not darwin we should close')
    // app.quit()
    control.serviceMan.killAllServices().then(() => {
      app.quit()
    })
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (control.didClose) {
    control.isQuitting = false
    winMan.initWail(control)
  }
})

app.on('before-quit', (e) => {
  console.log('before quit')
  if (control.isQuitting) {
    return
  }
  control.isQuitting = true
  // console.log('before-quit')
  e.preventDefault()
  console.log('killing all serivices')

  control.serviceMan.killAllServices().then(() => {
    app.quit()
  })
})

