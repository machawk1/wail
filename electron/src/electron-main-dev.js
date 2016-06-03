const {app, BrowserWindow, shell} = require('electron')
var realFs = require('fs')
var gracefulFs = require('graceful-fs')
gracefulFs.gracefulify(realFs)

let mainWindow = null


if (process.env.NODE_ENV === 'development') {
   require('electron-debug')()
}

function createWindow () {
   // Create the browser window.
   mainWindow = new BrowserWindow({width: 800, height: 600,title:'Wail Archiving Integration Layer'})

   // and load the index.html of the app.
   mainWindow.loadURL(`file://${__dirname}/wail.html`)



   // mainWindow.webContents.on('did-finish-load', () => {
   //    mainWindow.show()
   //    mainWindow.focus()
   // })

   if (process.env.NODE_ENV === 'development') {
      mainWindow.openDevTools()
      
   }

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

   // BrowserWindow.addDevToolsExtension('/home/john/.config/google-chrome/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/0.14.10_0')
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