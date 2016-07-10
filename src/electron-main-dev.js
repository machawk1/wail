import 'babel-polyfill'
import {app, BrowserWindow, Menu, shell, ipcMain} from 'electron'
import Logger from './logger/logger'
import menuTemplate from './menu/mainMenu'
import path from 'path'
import configSettings from './settings/settings'

let mainWindow = null
let newCrawlWindow = null
let accessibilityWindow = null
let indexWindow = null
let jobbWindow = null
let settingsWindow = null
let base
let mWindowURL
let newCrawlWindowURL
let accessibilityWindowURL
let indexWindowURL
let jobbWindowURL
let settingsWindowURL

let notDebugUI = true
let debug = false
let openBackGroundWindows = false

let shouldQuit = false

app.commandLine.appendSwitch('js-flags', '--expose_gc')

function showNewCrawlWindow (parent) {
  let config = {
    parent: parent,
    modal: true,
    show: false,
    closable: false,
    minimizable: false,
    autoHideMenuBar: true
  }
  newCrawlWindow = new BrowserWindow(config)
  newCrawlWindow.loadURL(newCrawlWindowURL)
  newCrawlWindow.on('ready-to-show', () => {
    newCrawlWindow.show()
    // newCrawlWindow.webContents.openDevTools({ mode: 'detach' })
  })

  newCrawlWindow.on('closed', () => {
    newCrawlWindow = null
  })
}

function showSettingsWindow (parent) {
  let config = {
    parent: parent,
    modal: true,
    show: false,
    closable: false,
    minimizable: false,
    autoHideMenuBar: true
  }
  settingsWindow = new BrowserWindow(config)
  settingsWindow.loadURL(newCrawlWindowURL)
  settingsWindow.on('ready-to-show', () => {
    settingsWindow.show()
    settingsWindow.webContents.toggleDevTools()
  })

  settingsWindow.on('closed', () => {
    settingsWindow = null
  })
}

function setUpIPC () {
  if (notDebugUI) {
    ipcMain.on('got-it', (event, payload) => {
      console.log(payload)
    })

    ipcMain.on('start-service-monitoring', (event, payload) => {
      console.log('Got start-service-monitoring')
      accessibilityWindow.webContents.send('start-service-monitoring', payload)
    })

    ipcMain.on('start-crawljob-monitoring', (event, payload) => {
      console.log('got start-crawljob-monitoring')
      jobbWindow.webContents.send('start-crawljob-monitoring', payload)
    })

    ipcMain.on('start-index-indexing', (event, payload) => {
      console.log('got start-index-indexing')
      indexWindow.webContents.send('start-index-indexing', payload)
    })

    ipcMain.on('service-status-update', (event, payload) => {
      console.log('got test-status-update', payload)
      mainWindow.webContents.send('service-status-update', payload)
    })

    ipcMain.on('crawljob-status-update', (event, payload) => {
      console.log('got crawljob-status-update', payload)
      mainWindow.webContents.send('crawljob-status-update', payload)
    })

    ipcMain.on('pong', (event, payload) => {
      console.log('got pong', payload)
      mainWindow.webContents.send('pong', payload)
    })
  }

  ipcMain.on('open-newCrawl-window', (event, payload) => {
    console.log('got open-newCrawl-window')
    showNewCrawlWindow(mainWindow)
  })

  ipcMain.on('open-settings-window', (event, payload) => {
    console.log('got open-settings-window')
    showSettingsWindow(mainWindow)
  })

  ipcMain.on('close-newCrawl-window', (event, payload) => {
    console.log('got close-newCrawl-window')
    if (newCrawlWindow != null) {
      console.log('newCrawlWindow is not null')
      newCrawlWindow.destroy()
    }
  })

  ipcMain.on('close-settings-window', (event, payload) => {
    console.log('got close-settings-window')
    if (settingsWindow != null) {
      console.log('newCrawlWindow is not null')
      if (payload) {
        console.log("It sent us ", payload)
      }
      settingsWindow.destroy()
    }
  })

  //
  ipcMain.on('close-newCrawl-window-configured', (event, payload) => {
    mainWindow.webContents.send('crawljob-configure-dialogue', payload)
    if (newCrawlWindow != null) {
      newCrawlWindow.destroy()
    }
  })

  ipcMain.on('services-shutdown', (event, payload) => {
    // we gracefully shutdown our services this only happens on window close
    mainWindow = null
  })

  //close-newCrawl-window-configured
}

function setUp () {

  setUpIPC()

  base = path.resolve('./')
  ///home/john/my-fork-wail/wail/src/childWindows/newCrawl/newCrawl.html
  if (process.env.NODE_ENV === 'development') {
    require('electron-debug')({
      showDevTools: true,
    })
    mWindowURL = `file://${__dirname}/wail.html`
    newCrawlWindowURL = `file://${__dirname}/childWindows/newCrawl/newCrawl.html`
    accessibilityWindowURL = `file://${__dirname}/background/accessibility.html`
    indexWindowURL = `file://${__dirname}/background/indexer.html`
    jobbWindowURL = `file://${__dirname}/background/jobs.html`
    settingsWindowURL = `file://${__dirname}/background/settingsW.html`
  } else {
    base = app.getAppPath()
    mWindowURL = `file://${base}/src/wail.html`
    newCrawlWindowURL = `file://${base}/src/childWindows/newCrawl/newCrawl.html`
    accessibilityWindowURL = `file://${base}/src/background/accessibility.html`
    indexWindowURL = `file://${base}/src/background/indexer.html`
    jobbWindowURL = `file://${base}/src/background/jobs.html`
    settingsWindowURL = `file://${base}/src/background/settingsW.html`
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

  logPath = path.join(logPath, 'wail.log')
  //bdb
  global.logger = new Logger({ path: logPath })

  global.wailLogp = logPath
}

function openDebug () {
  if (debug) {
    if (openBackGroundWindows) {
      if (accessibilityWindow != null) {
        accessibilityWindow.show()
        accessibilityWindow.webContents.openDevTools({ mode: 'detach' })
      }
      if (indexWindow != null) {
        indexWindow.show()
        indexWindow.webContents.openDevTools({ mode: 'detach' })
      }

      if (jobbWindow != null) {
        jobbWindow.show()
        jobbWindow.webContents.openDevTools({ mode: 'detach' })
      }
    }
    mainWindow.webContents.openDevTools()
  }
}

function createBackGroundWindows () {
  accessibilityWindow = new BrowserWindow({ show: false })
  accessibilityWindow.loadURL(accessibilityWindowURL)
  indexWindow = new BrowserWindow({ show: false })
  indexWindow.loadURL(indexWindowURL)
  jobbWindow = new BrowserWindow({ show: false })
  jobbWindow.loadURL(jobbWindowURL)
}

function stopMonitoring () {
  if (accessibilityWindow != null) {
    accessibilityWindow.webContents.send('stop')
  }
  if (indexWindow != null) {
    indexWindow.webContents.send('stop')
  }
  if (jobbWindow != null) {
    jobbWindow.webContents.send('stop')
  }
}

function cleanUp () {
  // Dereference the window object, usually you would store windows
  // in an array if your app supports multi windows, this is the time
  // when you should delete the corresponding element.
  stopMonitoring()
  if (accessibilityWindow !== null) {
    accessibilityWindow.close()
  }
  if (indexWindow !== null) {
    indexWindow.close()
  }

  if (jobbWindow !== null) {
    jobbWindow.close()
  }

  accessibilityWindow = null
  indexWindow = null
  jobbWindow = null
}

function checkBackGroundWindows () {
  if (accessibilityWindow === null) {
    accessibilityWindow = new BrowserWindow({ show: false })
    accessibilityWindow.loadURL(accessibilityWindowURL)
  }
  if (indexWindow === null) {
    indexWindow = new BrowserWindow({ show: false })
    indexWindow.loadURL(indexWindowURL)
  }

  if (jobbWindow === null) {
    jobbWindow = new BrowserWindow({ show: false })
    jobbWindow.loadURL(jobbWindowURL)
  }

}

function createWindow () {
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
  mainWindow = new BrowserWindow({
    width: 800,
    height: 500,
    title: 'Web Archiving Integration Layer',
    show: false,
    icon: iconp,
  })

  // and load the index.html of the app.
  mainWindow.loadURL(mWindowURL)

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.show()
    openDebug(openBackGroundWindows)
  })

  mainWindow.on('unresponsive', () => {
    console.log('we are unresponsive')
  })

  mainWindow.webContents.on('crashed', () => {
    console.log('we crashed')
  })

  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault()
    shell.openExternal(url)
  })

  mainWindow.webContents.on('did-navigate-in-page', (event, url) => {
    console.log('did-navigate-in-page', url)
  })

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    console.log('closed')
    cleanUp()

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
  if (notDebugUI) {
    createBackGroundWindows()
  }
  createWindow()
})

// app.on('before-quite', (event) => {
//   if (app.isQuitting) return
//   app.isQuitting = true
//   event.preventDefault()
// })

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin'){
    app.quit()
  }
})

app.on('before-quit', () => {
  if (notDebugUI) {
    cleanUp()
  }
  global.logger.cleanUp()

})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
  checkBackGroundWindows()
})

// app.on('activate-with-no-open-windows', () => {
//    console.log('activate no windows')
//    if (!mainWindow) {
//       createWindow()
//    }
// })




