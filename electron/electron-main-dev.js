const {app, BrowserWindow, shell, ipcMain} = require('electron')
const path = require('path')

let mainWindow = null



if (process.env.NODE_ENV === 'development') {
   require('electron-debug')({
      showDevTools: true
   })
}

const base = path.resolve(__filename, '../')

const realPaths = {
   p: {
      memgator: path.join(path.resolve(base), 'bundledApps/memgator'),
      archives: path.join(path.resolve(base), 'config/archives.json'),
      heritrix: path.join(path.resolve(base), 'bundledApps/heritrix-3.2.0'),
      heritrixBin: path.join(path.resolve(base), 'bundledApps/heritrix-3.2.0/bin/heritrix'),
      heritrixJob: path.join(path.resolve(base), 'bundledApps/heritrix-3.2.0/jobs'),
      tomcat: path.join(path.resolve(base), 'bundledApps/tomcat'),
      tomcatStart: path.join(path.resolve(base), 'bundledApps/tomcat/bin/startup.sh'),
      tomcatStop: path.join(path.resolve(base), 'bundledApps/tomcat/bin/shutdown.sh'),
      catalina: path.join(path.resolve(base), 'bundledApps/tomcat/bin/catalina.sh'),
      warcs: path.join(path.resolve(base), '/archives'),
      index: path.join(path.resolve(base), '/config/path-index.txt'),
      cdxIndexer: path.join(path.resolve(base), 'bundledApps/tomcat/bin/cdx-indexer'),
      cdx: path.join(path.resolve(base), 'archiveIndexes'),
      cdxTemp: path.join(path.resolve(base), 'archiveIndexes/combined_unsorted.cdxt'),

   },

   Heritrix: {
      uri_heritrix: "https://127.0.0.1:8443",
      username: 'lorem',
      password: 'ipsum',
      jobConf: path.join(path.resolve('./'), 'crawler-beans.cxml'),
      web_ui: "https://lorem:ipsum@localhost:8443",
   }
}

function createWindow () {
   // Create the browser window.
   mainWindow = new BrowserWindow({width: 800, height: 600,title:'Wail Archiving Integration Layer'})

   // and load the index.html of the app.
   mainWindow.loadURL(`file://${__dirname}/src/wail.html`)


   ipcMain.on('getPath', function (event, arg) {
      event.sender.send('gotPath', realPaths)
   })


   mainWindow.webContents.on('did-finish-load', () => {
      mainWindow.show()
      mainWindow.focus()
   })


   mainWindow.on('unresponsive', () => {
      console.log('we are unresponsive')
   })

   mainWindow.webContents.on('crashed', () => {
      console.log("we crashed")
   })

   mainWindow.webContents.on('new-window', (event, url) => {
      event.preventDefault()
      shell.openExternal(url)
   })

   mainWindow.webContents.on('did-navigate-in-page', (event, url) => {
      console.log('did-navigate-in-page', url)
   })

   // Emitted when the window is closed.
   mainWindow.on('closed',  () => {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      mainWindow = null
   })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

app.on('window-all-closed', () => {
   if (process.platform !== 'darwin') 
      app.quit()
})

app.on('activate',  ()  => {
   // On OS X it's common to re-create a window in the app when the
   // dock icon is clicked and there are no other windows open.
   if (mainWindow === null) {
      createWindow()
   }
})

process.on('uncaughtException', (err) => {
   console.log(`Caught exception: ${err}`);
})