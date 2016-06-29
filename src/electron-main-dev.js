import "babel-polyfill"
import {
   app,
   BrowserWindow,
   shell,
   ipcMain,
} from 'electron'

import installExtension, {REACT_DEVELOPER_TOOLS} from 'electron-devtools-installer'
import path from 'path'
import {configSettings} from './settings/settings'

let mainWindow = null
let backgroundWindow = null
let accessibilityWindow
let indexWindow
let jobbWindow
let base = path.resolve('./')

let mWindowURL
let bWindowURL
let accessibilityWindowURL
let indexWindowURL
let jobbWindowURL


if (process.env.NODE_ENV === 'development') {

   require('electron-debug')({
      showDevTools: true
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
   accessibilityWindowURL = `file://${base}/background/accessibility.html`
   indexWindowURL = `file://${base}/background/indexer.html`
   jobbWindowURL = `file://${base}/background/jobs.html`
}

configSettings(base)

const realPaths = {
   base: base,
   p: {
      memgator: path.join(base, 'bundledApps/memgator'),
      archives: path.join(base, 'config/archives.json'),
      heritrix: path.join(base, 'bundledApps/heritrix-3.2.0'),
      heritrixBin: path.join(base, 'bundledApps/heritrix-3.2.0/bin/heritrix'),
      heritrixJob: path.join(base, 'bundledApps/heritrix-3.2.0/jobs'),
      tomcat: path.join(base, 'bundledApps/tomcat'),
      tomcatStart: path.join(base, 'bundledApps/tomcat/bin/startup.sh'),
      tomcatStop: path.join(base, 'bundledApps/tomcat/bin/shutdown.sh'),
      catalina: path.join(base, 'bundledApps/tomcat/bin/catalina.sh'),
      warcs: path.join(base, '/archives'),
      index: path.join(base, '/config/path-index.txt'),
      cdxIndexer: path.join(base, 'bundledApps/tomcat/bin/cdx-indexer'),
      cdx: path.join(base, 'archiveIndexes'),
      cdxTemp: path.join(base, 'archiveIndexes/combined_unsorted.cdxt'),
      indexCDX: path.join(base, 'archiveIndexes/index.cdx'),

   },

   Heritrix: {
      uri_heritrix: 'https://127.0.0.1:8443',
      username: 'lorem',
      password: 'ipsum',
      jobConf: path.join(base, 'crawler-beans.cxml'),
      web_ui: 'https://lorem:ipsum@localhost:8443'
   },
   Code: {
      crawlerBean: path.join(base, 'crawler-beans.cxml'),
      wayBackConf: path.join(base, 'bundledApps/tomcat/webapps/ROOT/WEB-INF/wayback.xml'),
   }
}

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
   accessibilityWindow.webContents.send("stop")
   indexWindow.webContents.send("stop")
   jobbWindow.webContents.send("stop")
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
      installExtension(REACT_DEVELOPER_TOOLS)
         .then((name) => console.log(`Added Extension:  ${name}`))
         .catch((err) => console.log('An error occurred: ', err))
   }

   // Create the browser window.
   mainWindow = new BrowserWindow({
      width: 800,
      height: 800,
      title: 'Web Archiving Integration Layer',
      show: false,
   })


   // and load the index.html of the app.
   mainWindow.loadURL(mWindowURL)


   mainWindow.webContents.on('did-finish-load', () => {
      mainWindow.show()
      // backgroundWindow.show()
      // backgroundWindow.openDevTools()
      if (process.env.NODE_ENV === 'development') {
         jobbWindow.show()
         accessibilityWindow.show()
         indexWindow.show()
         mainWindow.show()
         jobbWindow.show()
         accessibilityWindow.openDevTools()
         indexWindow.openDevTools()
         mainWindow.openDevTools()
      }
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
      stopMonitoring()
      // mainWindow.webContents.send("cleanUp")
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      backgroundWindow.close()
      accessibilityWindow.close()
      indexWindow.close()
      jobbWindow.close()

      mainWindow = null
      backgroundWindow = null
      accessibilityWindow = null
      indexWindow = null
      jobbWindow = null
   })


}


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
   createWindow()
   createBackGroundWindows()
})

app.on('window-all-closed', () => {
   if (process.platform !== 'darwin')
      app.quit()
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

process.on('uncaughtException', (err) => {
   console.log(`Caught exception: ${err}`)
   app.quit()
})


ipcMain.on('getPath', function (event, arg) {
   event.sender.send('gotPath', realPaths)
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



