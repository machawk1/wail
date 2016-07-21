import 'babel-polyfill'
import { app, BrowserWindow, Menu, shell, ipcMain } from 'electron'
import Logger from './logger/logger'
import menuTemplate from './menu/mainMenu'
import path from 'path'
import configSettings from './settings/settings'

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

  firstLoadWindow: null,
  firstLoadWindowURL: null,

  loadingWindow: null,
  loadingWindowURL: null
}

let base
let notDebugUI = false
let debug = true
let openBackGroundWindows = false

let didClose = false
let loading = true

// let shouldQuit = false

app.commandLine.appendSwitch('js-flags', '--expose_gc')

// do not lower the priority of our invisible background windows
app.commandLine.appendSwitch('disable-renderer-backgrounding')

function showNewCrawlWindow (parent) {
  let config = {
    parent: parent,
    modal: true,
    show: false,
    closable: false,
    minimizable: false,
    autoHideMenuBar: true
  }
  windows.newCrawlWindow = new BrowserWindow(config)
  windows.newCrawlWindow.loadURL(windows.newCrawlWindowURL)
  windows.newCrawlWindow.on('ready-to-show', () => {
    windows.newCrawlWindow.show()
    // newCrawlWindow.webContents.openDevTools({ mode: 'detach' })
  })

  windows.newCrawlWindow.on('closed', () => {
    windows.newCrawlWindow = null
  })
}

function showSettingsWindow (parent) {
  let config = {
    parent: parent,
    modal: false,
    show: false,
    closable: false,
    minimizable: false,
    autoHideMenuBar: true
  }
  windows.settingsWindow = new BrowserWindow(config)
  windows.settingsWindow.loadURL(windows.settingsWindowURL)
  windows.settingsWindow.on('ready-to-show', () => {
    windows.settingsWindow.show()
    windows.settingsWindow.webContents.toggleDevTools()
  })

  windows.settingsWindow.on('closed', () => {
    windows.settingsWindow = null
  })
}

function setUpIPC () {
  if (notDebugUI) {
    ipcMain.on('got-it', (event, payload) => {
      console.log(payload)
    })

    ipcMain.on('start-service-monitoring', (event, payload) => {
      console.log('Got start-service-monitoring')
      windows.accessibilityWindow.webContents.send('start-service-monitoring', payload)
    })

    ipcMain.on('start-crawljob-monitoring', (event, payload) => {
      console.log('got start-crawljob-monitoring')
      windows.jobWindow.webContents.send('start-crawljob-monitoring', payload)
    })

    ipcMain.on('start-index-indexing', (event, payload) => {
      console.log('got start-index-indexing')
      windows.indexWindow.webContents.send('start-index-indexing', payload)
    })

    ipcMain.on('service-status-update', (event, payload) => {
      console.log('got test-status-update', payload)
      windows.mainWindow.webContents.send('service-status-update', payload)
    })

    ipcMain.on('crawljob-status-update', (event, payload) => {
      console.log('got crawljob-status-update', payload)
      windows.mainWindow.webContents.send('crawljob-status-update', payload)
    })
  }

  ipcMain.on('open-newCrawl-window', (event, payload) => {
    console.log('got open-newCrawl-window')
    showNewCrawlWindow(windows.mainWindow)
  })

  ipcMain.on('open-settings-window', (event, payload) => {
    console.log('got open-settings-window')
    showSettingsWindow(windows.mainWindow)
  })

  ipcMain.on('close-newCrawl-window', (event, payload) => {
    console.log('got close-newCrawl-window')
    if (windows.newCrawlWindow != null) {
      console.log('newCrawlWindow is not null')
      windows.newCrawlWindow.destroy()
    }
  })

  ipcMain.on('close-settings-window', (event, payload) => {
    console.log('got close-settings-window')
    if (windows.settingsWindow != null) {
      console.log('newCrawlWindow is not null')
      if (payload) {
        console.log('It sent us ', payload)
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
}

function setUp () {
  setUpIPC()
  base = path.resolve('./')
  if (process.env.NODE_ENV === 'development') {
    require('electron-debug')({
      showDevTools: true,
    })
    windows.accessibilityWindowURL = `file://${__dirname}/background/accessibility.html`
    windows.indexWindowURL = `file://${__dirname}/background/indexer.html`
    windows.jobWindowURL = `file://${__dirname}/background/jobs.html`
    windows.mWindowURL = `file://${__dirname}/wail.html`
    windows.newCrawlWindowURL = `file://${__dirname}/childWindows/newCrawl/newCrawl.html`
    windows.reqDaemonWindowURL = `file://${__dirname}/background/requestDaemon.html`
    windows.settingsWindowURL = `file://${__dirname}/childWindows/settings/settingsW.html`
    windows.firstLoadWindowURL = `file://${__dirname}/loadingScreens/firstTime/loadingScreen.html`
  } else {
    base = app.getAppPath()
    windows.accessibilityWindowURL = `file://${base}/src/background/accessibility.html`
    windows.indexWindowURL = `file://${base}/src/background/indexer.html`
    windows.jobWindowURL = `file://${base}/src/background/jobs.html`
    windows.mWindowURL = `file://${base}/src/wail.html`
    windows.newCrawlWindowURL = `file://${base}/src/childWindows/newCrawl/newCrawl.html`
    windows.reqDaemonWindowURL = `file://${base}/src/background/requestDaemon.html`
    windows.settingsWindowURL = `file://${base}/src/childWindows/settings/settingsW.html`
    windows.firstLoadWindowURL = `file://${base}/src/loadingScreens/firstTime/loadingScreen.html`
  }

  let logPath
  let settingsPath = app.getPath('userData')
  if (process.env.NODE_ENV === 'development') {
    logPath = path.join(base, 'waillogs')
    settingsPath = logPath
  } else {
    logPath = path.join(app.getPath('userData'), 'waillogs')
  }

  global.settings = configSettings(base, settingsPath)

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
  if (debug) {
    if (openBackGroundWindows) {
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
}

function createBackGroundWindows (notDebugUI) {
  if (notDebugUI) {
    windows.accessibilityWindow = new BrowserWindow({ show: false })
    windows.accessibilityWindow.loadURL(windows.accessibilityWindowURL)

    windows.indexWindow = new BrowserWindow({ show: false })
    windows.indexWindow.loadURL(windows.indexWindowURL)

    windows.jobWindow = new BrowserWindow({ show: false })
    windows.jobWindow.loadURL(windows.jobWindowURL)

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

  windows.accessibilityWindow = null
  windows.indexWindow = null
  windows.jobWindow = null
  windows.reqDaemonWindow = null
  windows.mainWindow = null
}

function checkBackGroundWindows () {
  if (windows.accessibilityWindow === null) {
    windows.accessibilityWindow = new BrowserWindow({ show: false })
    windows.accessibilityWindow.loadURL(windows.accessibilityWindowURL)
  }
  if (windows.indexWindow === null) {
    windows.indexWindow = new BrowserWindow({ show: false })
    windows.indexWindow.loadURL(windows.indexWindowURL)
  }

  if (windows.jobWindow === null) {
    windows.jobWindow = new BrowserWindow({ show: false })
    windows.jobWindow.loadURL(windows.jobWindowURL)
  }

  if (windows.reqDaemonWindow === null) {
    windows.reqDaemonWindow = new BrowserWindow({ show: false })
    windows.reqDaemonWindow.loadURL(windows.reqDaemonWindowURL)
  }
}

function createWindow () {
  didClose = false
  if (process.env.NODE_ENV === 'development') {
    let installExtension = require('electron-devtools-installer')
    try {
      installExtension.default(installExtension[ 'REACT_DEVELOPER_TOOLS' ])
    } catch (e) {
      console.error(e)
    }
  }

  let iconp

  if (process.platform === 'darwin') {
    iconp = path.normalize(path.join(base, 'src/icons/whale.icns'))
  } else {
    iconp = path.normalize(path.join(base, 'src/icons/whale.ico'))
  }

  // Create the browser window.
  windows.mainWindow = new BrowserWindow({
    width: 800,
    height: 500,
    title: 'Web Archiving Integration Layer',
    show: false,
    icon: iconp,
  })

  // and load the index.html of the app.
  console.log(`activating the main window did close? ${didClose}`)
  windows.mainWindow.loadURL(windows.firstLoadWindowURL)

  windows.mainWindow.webContents.on('did-finish-load', () => {
    windows.mainWindow.show()
    openDebug(openBackGroundWindows)
    windows.mainWindow.focus()
  })

  windows.mainWindow.on('unresponsive', () => {
    console.log('we are unresponsive')
  })

  windows.mainWindow.webContents.on('crashed', () => {
    console.log('we crashed')
  })

  windows.mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault()
    shell.openExternal(url)
  })

  // Emitted when the window is closed.
  windows.mainWindow.on('closed', () => {
    console.log('closed')
    didClose = true
    cleanUp()
  })
}

process.on('uncaughtException', (err) => {
  console.log(`Caught exception: ${err}`, err, err.stack)
  // logger.log('error', 'electron-main error message[ %s ], stack[ %s ]', err.message, err.stack)
  cleanUp()
  app.quit()
})

// const shouldQuit = app.makeSingleInstance((commandLine, workingDirectory) => {
//   // Someone tried to run a second instance, we should focus our window.
//   if (windows.mainWindow) {
//     if (windows.mainWindow.isMinimized()) windows.mainWindow.restore()
//     windows.mainWindow.focus()
//   }
// })
//
// if (shouldQuit) {
//   app.quit()
//   return
// }

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  app.isQuitting = false
  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate))
  setUp()
  createBackGroundWindows(notDebugUI)
  createWindow()
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (didClose) {
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
  console.log('before-quit')
  if (notDebugUI) {
    cleanUp()
  }
  global.logger.cleanUp()
})

