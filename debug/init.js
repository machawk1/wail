const {app, Menu, dialog, BrowserWindow, ipcMain} = require('electron')
const Promise = require('bluebird')
const path = require('path')
const url = require('url')

// global.settings = new ElectronSettings({configDirPath: path.join(process.cwd(), 'wail-config/wail-settings')})

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

app.commandLine.appendSwitch('js-flags', '--harmony')
app.commandLine.appendSwitch('disable-renderer-backgrounding')
app.commandLine.appendSwitch('disable-http-cache')

// ipcMain.on('archiveMan-initial-load', (event, cols) => {
//   console.log(cols)
// })

let m

const dlExtensions = async (update = false) => {
  if (update) {
    const installExtension = require('electron-devtools-installer')
    await Promise.all([
      installExtension.default(installExtension['REACT_DEVELOPER_TOOLS'], update),
      installExtension.default(installExtension['REDUX_DEVTOOLS'], update),
      installExtension.default(installExtension['REACT_PERF'], update)
    ])
  }
}

app.on('ready', async () => {
  await dlExtensions()
  require('electron-debug')({
    showDevTools: true
  })
  console.log('app ready')
  m = new BrowserWindow({
    width: 1100,
    height: 700
  })
  let loadMe = url.format({
    protocol: 'file',
    pathname: `${__dirname}/newTwitterSignIn.html`,
    slashes: true,
    hash: encodeURIComponent(JSON.stringify({
      key: 'K1y1GmSdDfUmBNMJeX1lf8Ono',
      secret: 'Ksd87lVkQWRVeXUIYjqqPF7mfUZuRq1aU1fgAFJHdDz3AY7NTY'
    }))
  })
  m.loadURL(loadMe)
})

app.on('window-all-closed', () => {
  app.quit()
})
