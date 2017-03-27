import 'babel-polyfill'
import { app, Menu, dialog } from 'electron'
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
const debug = false, notDebugUI = true, openBackGroundWindows = false
const control = global.__wailControl = new AppManager(debug, notDebugUI, openBackGroundWindows)

export function showSettingsWindow (parent) {
  console.log('showing settings window')
  winMan.showSettingsWindow(control)
}

winMan.once('windowman-init-done', () => {
  console.log('windowman init is done')
  winMan.initWail(control).then(() => {
    console.log('loading done')
  }).catch(err => {
    console.error(err)
  })
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

app.on('ready', async () => {
  console.log('app ready')
  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate))
  await control.init()
  console.log(control.winConfigs)
  global.showSettingsMenu = showSettingsWindow
  global.windowMan = winMan
  winMan.init(control.winConfigs)
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
    winMan.initWail(control).then(() => {
      console.log('loading done')
    }).catch(err => {
      console.error(err)
    })
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
