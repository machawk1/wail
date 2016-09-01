import 'babel-polyfill'
import {app, BrowserWindow, Menu, shell, ipcMain, nativeImage, Tray, clipboard} from 'electron'
import Logger from './logger/logger'
import menuTemplate from './menu/mainMenu'
import path from 'path'
import util from 'util'
import configSettings, {writeSettings, rewriteHeritrixAuth} from './settings/settings'
import ContextMenu from './menu/contextMenu'
import {Pather} from '../sharedUtil'

const windows = {
  accessibilityWindow: null,
  accessibilityWindowURL: null,

  indexWindow: null,
  indexWindowURL: null,

  jobWindow: null,
  jobWindowURL: null,

  mainWindow: null,
  mWindowURL: null,

  newCrawlWindow: null,
  newCrawlWindowURL: null,

  reqDaemonWindow: null,
  reqDaemonWindowURL: null,

  settingsWindow: null,
  settingsWindowURL: null,

  firstLoadWindowURL: null,
  loadingWindowURL: null,

  timemapStatsWindow: null,
  timemapStatsURL: null,

  serviceDeamonWindow: null,
  serviceDeamonUrl: null,
}

const control = {
  settings: null,
  pathMan: null,
  w: null,
  h: null,
  iconp: null,
  tray: null,
  base: null,
  notDebugUI: false,
  debug: false,
  openBackGroundWindows: false,
  didClose: false,
  didLoad: false,
  loading: true,
  firstLoad: false,
  contextMenu: new ContextMenu()
}

// let shouldQuit = false
app.commandLine.appendSwitch('js-flags', '--expose_gc --harmony')

// do not lower the priority of our invisible background windows
app.commandLine.appendSwitch('disable-renderer-backgrounding')
app.commandLine.appendSwitch('enable-usermedia-screen-capturing')
app.commandLine.appendSwitch('allow-http-screen-capture')

function showNewCrawlWindow (parent) {
  let height = process.platform === 'win32' ? 380 : 360
  let config = {
    width: 800,
    height,
    modal: true,
    show: false,
    closable: true,
    minimizable: false,
    autoHideMenuBar: true
  }
  windows.newCrawlWindow = new BrowserWindow(config)
  windows.newCrawlWindow.loadURL(windows.newCrawlWindowURL)
  windows.newCrawlWindow.on('ready-to-show', () => {
    windows.newCrawlWindow.show()
    windows.newCrawlWindow.focus()
    // windows.newCrawlWindow.webContents.toggleDevTools()
  })
  windows.newCrawlWindow.webContents.on('context-menu', (e, props) => {
    e.preventDefault()
    control.contextMenu.maybeShow(props, windows.newCrawlWindow)
  })

  windows.newCrawlWindow.on('closed', () => {
    windows.newCrawlWindow = null
  })
}

export function showSettingsWindow (parent) {
  console.log('showing settings window')
  let config = {
    width: 784,
    height: 350,
    modal: false,
    show: false,
    minimizable: false,
    autoHideMenuBar: true
  }
  windows.settingsWindow = new BrowserWindow(config)
  windows.settingsWindow.loadURL(windows.settingsWindowURL)
  windows.settingsWindow.on('ready-to-show', () => {
    console.log('settings window ready to show')
    windows.settingsWindow.show()
    windows.settingsWindow.focus()
    // windows.settingsWindow.webContents.toggleDevTools()
  })
  windows.settingsWindow.webContents.on('context-menu', (e, props) => {
    e.preventDefault()
    control.contextMenu.maybeShow(props, windows.settingsWindow)
  })

  windows.settingsWindow.on('closed', () => {
    windows.settingsWindow = null
  })
}

function setUpIPC () {
  if (control.notDebugUI) {
    ipcMain.on('got-it', (event, payload) => {
      // console.log(payload)
    })

    ipcMain.on('start-service-monitoring', (event, payload) => {
      // console.log('Got start-service-monitoring')
      windows.accessibilityWindow.webContents.send('start-service-monitoring', payload)
    })

    ipcMain.on('start-crawljob-monitoring', (event, payload) => {
      // console.log('got start-crawljob-monitoring')
      windows.jobWindow.webContents.send('start-crawljob-monitoring', payload)
    })

    ipcMain.on('start-index-indexing', (event, payload) => {
      // console.log('got start-index-indexing')
      windows.indexWindow.webContents.send('start-index-indexing', payload)
    })

    ipcMain.on('service-status-update', (event, payload) => {
      // console.log('got test-status-update')
      windows.mainWindow.webContents.send('service-status-update', payload)
    })

    ipcMain.on('crawljob-status-update', (event, payload) => {
      // console.log('got crawljob-status-update')
      windows.mainWindow.webContents.send('crawljob-status-update', payload)
    })
  }

  ipcMain.on('open-newCrawl-window', (event, payload) => {
    // console.log('got open-newCrawl-window')
    showNewCrawlWindow(windows.mainWindow)
  })

  ipcMain.on('open-settings-window', (event, payload) => {
    console.log('got open-settings-window')
    showSettingsWindow(windows.mainWindow)
  })

  ipcMain.on('close-newCrawl-window', (event, payload) => {
    // console.log('got close-newCrawl-window')
    if (windows.newCrawlWindow != null) {
      // console.log('newCrawlWindow is not null')
      windows.newCrawlWindow.destroy()
    }
  })

  ipcMain.on('close-settings-window', (event, payload) => {
    console.log('got close-settings-window')
    if (windows.settingsWindow != null) {
      // console.log('newCrawlWindow is not null')
      if (payload) {
        // console.log('It sent us ', payload)
      }
      windows.settingsWindow.destroy()
    }
  })

  ipcMain.on('close-newCrawl-window-configured', (event, payload) => {
    windows.mainWindow.webContents.send('crawljob-configure-dialogue', payload)
    if (windows.newCrawlWindow != null) {
      windows.newCrawlWindow.destroy()
    }
  })

  ipcMain.on('send-to-requestDaemon', (event, request) => {
    windows.reqDaemonWindow.send('handle-request', request)
  })

  ipcMain.on('handled-request', (event, request) => {
    windows.mainWindow.send('handled-request', request)
  })

  ipcMain.on('services-shutdown', (event, payload) => {
    // we gracefully shutdown our services this only happens on window close
    windows.mainWindow = null
  })

  ipcMain.on('loading-finished', (event, payload) => {
    windows.mainWindow.hide()
    windows.mainWindow.loadURL(windows.mWindowURL)
  })

  ipcMain.on('setting-hard-reset', (event, payload) => {
    console.log('got settings-hard-reset')
    writeSettings(control.base, control.settings, settings.get('version'), settings.get('didFirstLoad'), settings.get('migrate'))
  })

  ipcMain.on('rewrite-wayback-config', (event, payload) => {
    console.log('got rewrite-wayback-config')
    windows.mainWindow.send('rewrite-wayback-config')
  })

  ipcMain.on('set-heritrix-usrpwd', (event, payload) => {
    console.log('got set heritrix usrpwd', payload)
    rewriteHeritrixAuth(control.settings, payload.usr, payload.pwd)
  })
}

function setUp () {
  setUpIPC()
  control.base = path.resolve('./')

  if (process.env.NODE_ENV === 'development') {
    require('electron-debug')({
      showDevTools: true
    })
    windows.accessibilityWindowURL = `file://${__dirname}/background/accessibility.html`
    windows.indexWindowURL = `file://${__dirname}/background/indexer.html`
    windows.jobWindowURL = `file://${__dirname}/background/jobs.html`
    windows.mWindowURL = `file://${__dirname}/wail.html`
    windows.newCrawlWindowURL = `file://${__dirname}/childWindows/newCrawl/newCrawl.html`
    windows.reqDaemonWindowURL = `file://${__dirname}/background/requestDaemon.html`
    windows.settingsWindowURL = `file://${__dirname}/childWindows/settings/settingsW.html`
    windows.firstLoadWindowURL = `file://${__dirname}/loadingScreens/firstTime/loadingScreen.html`
    windows.loadingWindowURL = `file://${__dirname}/loadingScreens/notFirstTime/loadingScreen.html`
    windows.timemapStatsURL = `file://${__dirname}/childWindows/timemapStats/timemapStats.html`
    windows.serviceDeamonUrl = `file://${__dirname}/background/serviceDaemon/serviceDaemon.html`
  } else {
    control.base = app.getAppPath()
    windows.accessibilityWindowURL = `file://${control.base}/wail-ui/background/accessibility.html`
    windows.indexWindowURL = `file://${control.base}/wail-ui/background/indexer.html`
    windows.jobWindowURL = `file://${control.base}/wail-ui/background/jobs.html`
    windows.mWindowURL = `file://${control.base}/wail-ui/wail.html`
    windows.newCrawlWindowURL = `file://${control.base}/wail-ui/childWindows/newCrawl/newCrawl.html`
    windows.reqDaemonWindowURL = `file://${control.base}/wail-ui/background/requestDaemon.html`
    windows.settingsWindowURL = `file://${control.base}/wail-ui/childWindows/settings/settingsW.html`
    windows.firstLoadWindowURL = `file://${control.base}/wail-ui/loadingScreens/firstTime/loadingScreen.html`
    windows.loadingWindowURL = `file://${control.base}/wail-ui/loadingScreens/notFirstTime/loadingScreen.html`
    windows.timemapStatsURL = `file://${control.base}/wail-ui/childWindows/timemapStats/timemapStats.html`
    windows.serviceDeamonUrl = `file://${control.base}/wail-ui/background/serviceDaemon/serviceDaemon.html`
  }

  global.pathMan = control.pathMan = new Pather(control.base)
  let {pathMan} = control
  let logPath
  let version = ''
  let settingsPath = app.getPath('userData')
  if (process.env.NODE_ENV === 'development') {
    logPath = pathMan.joinWBase('waillogs')// path.join(control.base, 'waillogs')
    version = '1.0.0-rc.2.6'
    settingsPath = logPath
  } else {
    version = app.getVersion()
    logPath = pathMan.join(settingsPath, 'waillogs')// path.join(app.getPath('userData'), 'waillogs')
  }

  if (process.platform === 'darwin') {
    control.iconp = pathMan.normalizeJoinWBase('src/icons/whale.icns') // path.normalize(path.join(control.base, 'src/icons/whale.icns'))
    control.w = 800
    control.h = 380
  } else if (process.platform === 'win32') {
    // console.log('windows')
    control.iconp = path.normalize(path.join(control.base, 'src/icons/whale.ico'))
    control.w = 800
    control.h = 420
  } else {
    control.iconp = path.normalize(path.join(control.base, 'src/icons/linux/whale_64.png'))
    control.w = 800
    control.h = 361
  }

  let settings = configSettings(control.base, settingsPath, version)
  global.settings = control.settings = settings
  if (!settings.get('didFirstLoad')) {
    control.firstLoad = true
    settings.set('didFirstLoad', true)
  }

  global.wailVersion = app.getVersion()

  global.accessLogPath = path.join(logPath, 'accessibility.log')
  global.jobLogPath = path.join(logPath, 'jobs.log')
  global.indexLogPath = path.join(logPath, 'index.log')
  global.requestDaemonLogPath = path.join(logPath, 'requestDaemon.log')

  logPath = path.join(logPath, 'wail.log')
  //  bdb
  global.logger = new Logger({ path: logPath })

  global.wailLogp = logPath

  global.showSettingsMenu = showSettingsWindow
}

function openDebug () {
  if (control.debug) {
    if (control.openBackGroundWindows) {
      if (windows.accessibilityWindow != null) {
        windows.accessibilityWindow.show()
        windows.accessibilityWindow.webContents.openDevTools()
      }
      if (windows.indexWindow != null) {
        windows.indexWindow.show()
        windows.indexWindow.webContents.openDevTools()
      }

      if (windows.jobWindow != null) {
        windows.jobWindow.show()
        windows.jobWindow.webContents.openDevTools()
      }
      if (windows.reqDaemonWindow != null) {
        windows.reqDaemonWindow.show()
        windows.reqDaemonWindow.webContents.openDevTools()
      }
    }
    windows.mainWindow.webContents.openDevTools()
  }
  // windows.accessibilityWindow.hide()
  // windows.indexWindow.hide()
  // windows.jobWindow.hide()
  // windows.reqDaemonWindow.hide()
}

function createBackGroundWindows (notDebugUI) {
  if (notDebugUI) {
    windows.accessibilityWindow = new BrowserWindow({ show: false })
    windows.accessibilityWindow.loadURL(windows.accessibilityWindowURL)

    windows.indexWindow = new BrowserWindow({ show: false })
    windows.indexWindow.loadURL(windows.indexWindowURL)

    windows.jobWindow = new BrowserWindow({ show: false })
    windows.jobWindow.loadURL(windows.jobWindowURL)
    windows.jobWindow.webContents.toggleDevTools()

    windows.reqDaemonWindow = new BrowserWindow({ show: false })
    windows.reqDaemonWindow.loadURL(windows.reqDaemonWindowURL)
  }
}

function stopMonitoring () {
  if (windows.accessibilityWindow != null) {
    windows.accessibilityWindow.webContents.send('stop')
  }

  if (windows.indexWindow != null) {
    windows.indexWindow.webContents.send('stop')
  }

  if (windows.jobWindow != null) {
    windows.jobWindow.webContents.send('stop')
  }

  if (windows.reqDaemonWindow != null) {
    windows.reqDaemonWindow.webContents.send('stop')
  }
}

function cleanUp () {
  // Dereference the window object, usually you would store windows
  // in an array if your app supports multi windows, this is the time
  // when you should delete the corresponding element.
  stopMonitoring()
  if (windows.accessibilityWindow != null) {
    windows.accessibilityWindow.close()
  }
  if (windows.indexWindow != null) {
    windows.indexWindow.close()
  }

  if (windows.jobWindow != null) {
    windows.jobWindow.close()
  }

  if (windows.reqDaemonWindow != null) {
    windows.reqDaemonWindow.close()
  }

  if (windows.newCrawlWindow != null) {
    windows.newCrawlWindow.destroy()
  }

  if (windows.settingsWindow != null) {
    windows.settingsWindow.destroy()
  }

  windows.accessibilityWindow = null
  windows.indexWindow = null
  windows.jobWindow = null
  windows.reqDaemonWindow = null
  windows.mainWindow = null
}

function checkBackGroundWindows () {
  if (windows.accessibilityWindow === null) {
    windows.accessibilityWindow = new BrowserWindow({ show: false, frame: false })
    windows.accessibilityWindow.loadURL(windows.accessibilityWindowURL)
  }
  if (windows.indexWindow === null) {
    windows.indexWindow = new BrowserWindow({ show: false, frame: false })
    windows.indexWindow.loadURL(windows.indexWindowURL)
  }

  if (windows.jobWindow === null) {
    windows.jobWindow = new BrowserWindow({ show: false, frame: false })
    windows.jobWindow.loadURL(windows.jobWindowURL)
  }

  if (windows.reqDaemonWindow === null) {
    windows.reqDaemonWindow = new BrowserWindow({ show: false, frame: false })
    windows.reqDaemonWindow.loadURL(windows.reqDaemonWindowURL)
  }
}

function createWindow () {
  control.didClose = false
  if (process.env.NODE_ENV === 'development') {
    let installExtension = require('electron-devtools-installer')
    try {
      installExtension.default(installExtension[ 'REACT_DEVELOPER_TOOLS' ])
    } catch (e) {
      console.error(e)
    }
  }

  let windowConfig = {
    width: control.w,
    minWidth: control.w,
    // maxWidth: control.w,
    height: control.h,
    minHeight: control.h,
    // maxHeight: control.h,
    title: 'Web Archiving Integration Layer',
    fullscreenable: false,
    maximizable: false,
    show: false,
    icon: control.iconp
  }
  // Create the browser window.

  windows.mainWindow = new BrowserWindow(windowConfig) // {show: true})//windowConfig)

  // console.log(windows.mainWindow.getSize())

  // and load the index.html of the app.
  // console.log(`activating the main window did close? ${control.didClose}`)

  var loadUrl  = windows.serviceDeamonUrl// windows.settingsWindowURL windows.mWindowURL
  // if (control.loading && control.firstLoad) {
  //   loadUrl = windows.firstLoadWindowURL
  // } else {
  //   if (!control.didLoad) {
  //     loadUrl = windows.loadingWindowURL
  //     control.didLoad = true
  //   } else {
  //     loadUrl = windows.mWindowURL
  //   }
  // }

  windows.mainWindow.loadURL(loadUrl)

  windows.mainWindow.webContents.on('did-finish-load', () => {
    // console.log('did-finish-load man win')
    // console.log(windows.mainWindow.getSize())
    windows.mainWindow.show()
    openDebug(control.openBackGroundWindows)
    windows.mainWindow.focus()
  })

  windows.mainWindow.on('unresponsive', () => {
    // console.log('we are unresponsive')
  })

  windows.mainWindow.webContents.on('crashed', () => {
    // console.log('we crashed')
    app.quit()
  })

  windows.mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault()
    shell.openExternal(url)
  })

  // Emitted when the window is closed.
  windows.mainWindow.on('closed', () => {
    // console.log('closed')
    control.didClose = true
    cleanUp()
  })

  windows.mainWindow.webContents.on('context-menu', (e, props) => {
    e.preventDefault()
    // console.log(util.inspect(props, { depth: null, colors: true }))
    control.contextMenu.maybeShow(props, windows.mainWindow)
    // if (props.isEditable) {
    //   contextMenu(e, props).popup(windows.mainWindow)
    // }
  })
}

process.on('uncaughtException', (err) => {
  console.log(`Caught exception: ${err}`, err, err.stack)
  // logger.log('error', 'electron-main error message[ %s ], stack[ %s ]', err.message, err.stack)
  cleanUp()
  app.quit()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  app.isQuitting = false
  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate))
  setUp()
  // control.tray = new Tray(control.iconp)
  // const contextMenu = Menu.buildFromTemplate([
  //   { label: 'Item1', type: 'radio' },
  //   { label: 'Item2', type: 'radio' },
  //   { label: 'Item3', type: 'radio', checked: true },
  //   { label: 'Item4', type: 'radio' }
  // ])
  // control.tray.setToolTip('WAIL')
  // control.tray.setContextMenu(contextMenu)
  createBackGroundWindows(control.notDebugUI)
  createWindow()
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (control.didClose) {
    checkBackGroundWindows()
    createWindow()
  }
})

// app.on('before-quite', (event) => {
//   if (app.isQuitting) return
//   app.isQuitting = true
//   event.preventDefault()
// })

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  // console.log('before-quit')
  if (control.notDebugUI) {
    cleanUp()
  }
  global.logger.cleanUp()
})

