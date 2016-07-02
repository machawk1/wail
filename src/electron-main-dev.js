import "babel-polyfill"
import {
    app,
    BrowserWindow,
    shell,
    ipcMain,
} from 'electron'

import logger from 'electron-log'
import fs from 'fs-extra'
import path from 'path'
import {configSettings} from './settings/settings'

process.on('uncaughtException', (err) => {
    console.log(`Caught exception: ${err}`)
//   logger.log('error', "electron-main error message[ %s ], stack[ %s ]", err.message, err.stack)
    cleanUp()
    app.quit()
})


let mainWindow = null
let backgroundWindow = null
let accessibilityWindow = null
let indexWindow = null
let jobbWindow = null
let base = path.resolve('./')

let mWindowURL
let bWindowURL
let accessibilityWindowURL
let indexWindowURL
let jobbWindowURL

let openBackGroundWindows = true

base = path.resolve('./')

if (process.env.NODE_ENV === 'development') {

    require('electron-debug')({
        showDevTools: "undocked",
    })

    mWindowURL = `file://${__dirname}/wail.html`
    bWindowURL = `file://${__dirname}/background/monitor.html`
    accessibilityWindowURL = `file://${__dirname}/background/accessibility.html`
    indexWindowURL = `file://${__dirname}/background/indexer.html`
    jobbWindowURL = `file://${__dirname}/background/jobs.html`
} else {
    base = app.getAppPath()
    mWindowURL = `file://${base}/src/wail.html`
    bWindowURL = `file://${base}/src/background/monitor.html`
    accessibilityWindowURL = `file://${base}/src/background/accessibility.html`
    indexWindowURL = `file://${base}/src/background/indexer.html`
    jobbWindowURL = `file://${base}/src/background/jobs.html`
}

configSettings(base)

let logPath
if (process.env.NODE_ENV === 'development') {
    logPath = path.join(base, "waillogs")
} else {
    logPath = path.join(app.getPath('userData'), "waillogs")
}

let accessLogP = path.join(logPath, 'accessibility.log')
let jobLogP = path.join(logPath, 'jobs.log')
let indexLogP = path.join(logPath, 'index.log')

fs.ensureFileSync(accessLogP)
fs.ensureFileSync(jobLogP)
fs.ensureFileSync(indexLogP)
global.accessLogPath = accessLogP
global.jobLogPath = accessLogP
global.indexLogPath = accessLogP


logPath = path.join(logPath, 'wail.log')
fs.ensureFileSync(logPath)

logger.transports.file.format = '[{m}:{d}:{y} {h}:{i}:{s}] [{level}] {text}'
logger.transports.file.maxSize = 5 * 1024 * 1024
logger.transports.file.file = logPath
logger.transports.file.streamConfig = {flags: 'a'}


global.logger = logger

function createBackgroundWindow() {
    backgroundWindow = new BrowserWindow({show: false})
    backgroundWindow.loadURL(bWindowURL)

    backgroundWindow.on('close', () => {
        backgroundWindow = null
    })

}

function createBackGroundWindows() {
    accessibilityWindow = new BrowserWindow({show: false})
    accessibilityWindow.loadURL(accessibilityWindowURL)
    indexWindow = new BrowserWindow({show: false})
    indexWindow.loadURL(indexWindowURL)
    jobbWindow = new BrowserWindow({show: false})
    jobbWindow.loadURL(jobbWindowURL)
}

function stopMonitoring() {
    if (accessibilityWindow !== null) {
        accessibilityWindow.webContents.send("stop")
    }
    if (indexWindow !== null) {
        indexWindow.webContents.send("stop")
    }
    if (jobbWindow !== null) {
        jobbWindow.webContents.send("stop")
    }
}

function cleanUp() {
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

    backgroundWindow = null
    accessibilityWindow = null
    indexWindow = null
    jobbWindow = null
}

function checkBackGroundWindows() {
    if (accessibilityWindow === null) {
        accessibilityWindow = new BrowserWindow({show: false})
        accessibilityWindow.loadURL(accessibilityWindowURL)
    }
    if (indexWindow === null) {
        indexWindow = new BrowserWindow({show: false})
        indexWindow.loadURL(indexWindowURL)
    }

    if (jobbWindow === null) {
        jobbWindow = new BrowserWindow({show: false})
        jobbWindow.loadURL(jobbWindowURL)
    }

}

function createWindow() {
    if (process.env.NODE_ENV === 'development') {
        let installExtension = require('electron-devtools-installer')
        try {
            installExtension.default(installExtension['REACT_DEVELOPER_TOOLS'])
        } catch (e){
            console.error(e)
        }
        
    }

    let iconp = path.join(base, path.normalize('build/icons/whale.ico'))
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 800,
        height: 800,
        title: 'Web Archiving Integration Layer',
        show: false,
        icon: iconp,
    })

    // and load the index.html of the app.
    mainWindow.loadURL(mWindowURL)

    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.show()

        // if (process.env.NODE_ENV === 'development') {
        //   // if(openBackGroundWindows){
        //   //   jobbWindow.show()
        //   //   accessibilityWindow.show()
        //   //   indexWindow.show()
        //   // }
        //   //
        //
        // }
        // jobbWindow.show()
        // accessibilityWindow.show()
        // indexWindow.show()
        // jobbWindow.openDevTools()
        // accessibilityWindow.openDevTools()
        // indexWindow.openDevTools()
        // mainWindow.openDevTools()
        mainWindow.focus()
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
        console.log("closed")
    })

}


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
    createBackGroundWindows()
    createWindow()
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin')
        app.quit()
})

app.on('before-quit', () => {
    cleanUp()
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
//    console.log("activate no windows")
//    if (!mainWindow) {
//       createWindow()
//    }
// })


ipcMain.on('got-it', (event, payload) => {
    console.log(payload)
})

ipcMain.on("start-test", (event, payload) => {
    console.log("Got start-test")
    backgroundWindow.webContents.send("start-test", payload)
})

ipcMain.on("start-service-monitoring", (event, payload) => {
    console.log("Got start-service-monitoring")
    accessibilityWindow.webContents.send("start-service-monitoring", payload)
})

ipcMain.on("start-crawljob-monitoring", (event, payload) => {
    console.log("got start-crawljob-monitoring")
    jobbWindow.webContents.send("start-crawljob-monitoring", payload)
})

ipcMain.on("start-index-indexing", (event, payload) => {
    console.log("got start-index-indexing")
    indexWindow.webContents.send("start-index-indexing", payload)
})

ipcMain.on("service-status-update", (event, payload) => {
    console.log("got test-status-update", payload)
    mainWindow.webContents.send("service-status-update", payload)
})

ipcMain.on("crawljob-status-update", (event, payload) => {
    console.log("got crawljob-status-update", payload)
    mainWindow.webContents.send("crawljob-status-update", payload)
})

ipcMain.on("pong", (event, payload) => {
    console.log("got pong", payload)
    mainWindow.webContents.send("pong", payload)
})



