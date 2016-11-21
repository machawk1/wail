const menubar = require('menubar')
const { ipcMain } = require('electron')
const path = require('path')
app.commandLine.appendSwitch('js-flags', '--harmony')

const options = {
  dir: __dirname,
  icon: path.join(__dirname, 'whale.png'),
  tooltip: 'WAIL',
  width: 500
}
const monitorMBar = menubar(options)

monitorMBar.on('ready', () => {
  if (process.env.NODE_ENV === 'development') {
    let installExtension = require('electron-devtools-installer')
    try {
      installExtension.default(installExtension[ 'REACT_DEVELOPER_TOOLS' ])
    } catch (e) {
      console.error(e)
    }
  }
})