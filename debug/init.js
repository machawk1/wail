const { app, Menu, dialog, BrowserWindow, ipcMain } = require('electron')
const ElectronSettings = require('electron-settings')
const path = require('path')

global.settings = new ElectronSettings({configDirPath: path.join(process.cwd(), 'wail-config/wail-settings')})

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

app.commandLine.appendSwitch('js-flags', '--harmony --harmony_async_await')
app.commandLine.appendSwitch('disable-renderer-backgrounding')

ipcMain.on('archiveMan-initial-load', (event, cols) => {
  console.log(cols)
})

let m

app.on('ready', () => {
  require('electron-debug')({
    showDevTools: true
  })
  console.log('app ready')
  m = new BrowserWindow({
    width: 1100,
    height: 700
  })
  m.loadURL(`file:///Users/jberlin/WebstormProjects/wail/wail-ui/background/archives.html`)
})

app.on('window-all-closed', () => {
  app.quit()
})
