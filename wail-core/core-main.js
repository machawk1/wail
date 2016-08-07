import menubar from 'menubar'
import {ipcMain} from 'electron'
import path from 'path'

const options = {
  dir: __dirname,
  icon: path.join(__dirname,'whale.png'),
  tooltip: 'WAIL',
  width: 500
}


const wailMenuBar = menubar(options)



wailMenuBar.on('ready', () => {
  if (process.env.NODE_ENV === 'development') {
    let installExtension = require('electron-devtools-installer')
    try {
      installExtension.default(installExtension[ 'REACT_DEVELOPER_TOOLS' ])
    } catch (e) {
      console.error(e)
    }
  }
})