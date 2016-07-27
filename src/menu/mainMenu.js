import { dialog, app } from 'electron'
import fs from 'fs-extra'
import S from 'string'
import util from 'util'
const name = app.getName()

const errorMessage = {
  type: 'error',
  buttons: [ 'Ok' ],
  title: 'Something went wrong'
}

export function screenShotPDF (window) {
  if (window) {
    // console.log('Saving pdf')
    window.webContents.printToPDF({}, (error, data) => {
      if (error) {
        dialog.showErrorBox("Something went wrong :'(", 'Saving screen shot as PDF failed')
      } else {
        let opts = {
          title: 'Save Screen Shot As PDF',
          defaultPath: app.getPath('documents'),
          filters: [
            { name: 'PDF', extensions: [ 'pdf' ] },
          ]
        }
        let cb = (path) => {
          if (path) {
            fs.writeFile(path, data, (wError) => {
              if (wError) {
                dialog.showErrorBox("Something went wrong :'(", 'PDF screen shot could not be saved to that path')
              } else {
                dialog.showMessageBox(window, {
                  type: 'info',
                  title: 'Done',
                  message: 'PDF screen shot saved',
                  buttons: [ 'Ok' ]
                }, (r) => console.log(r))
              }
            })
          }
        }
        dialog.showSaveDialog(window, opts, cb)
      }
    })
  }
}

export function screenShot (window) {
  if (window) {
    // console.log('Taking image Screenshot')
    let size = window.getSize()
    // console.log(size)
    // console.log(util.inspect(window,{depth: null,colors:true}))
    window.webContents.capturePage((image) => {
      let opts = {
        title: 'Save Screen Shot',
        defaultPath: app.getPath('documents'),
        filters: [
          { name: 'PNG', extensions: [ 'png' ] },
          { name: 'JPG', extensions: [ 'jpg' ] },
        ]
      }
      let cb = (path) => {
        if (path) {
          let png = S(path.toLowerCase()).endsWith('png')

          let buf = png ? image.toPng() : image.toJpeg(100)
          fs.writeFile(path, buf, 'binary', (wError) => {
            if (wError) {
              dialog.showErrorBox("Something went wrong :'(", 'Screen shot could not be saved to that path')
            } else {
              dialog.showMessageBox(window, {
                type: 'info',
                title: 'Done',
                message: 'Screen shot saved',
                buttons: [ 'Ok' ]
              }, (r) => console.log(r))
            }
          })
        }
      }
      dialog.showSaveDialog(window, opts, cb)
    })
  }
}

const template = [
  {
    label: 'Edit',
    submenu: [
      {
        role: 'undo'
      },
      {
        role: 'redo'
      },
      {
        type: 'separator'
      },
      {
        role: 'cut'
      },
      {
        role: 'copy'
      },
      {
        role: 'paste'
      },
      {
        role: 'pasteandmatchstyle'
      },
      {
        role: 'delete'
      },
      {
        role: 'selectall'
      }
    ]
  },
  {
    label: 'View',
    submenu: [
      {
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click (item, focusedWindow) {
          if (focusedWindow) focusedWindow.reload()
        }
      },
      {
        label: 'Toggle Developer Tools',
        accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
        click (item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.webContents.toggleDevTools()
          }
        }
      },
      {
        label: 'Screen Shot',
        submenu: [
          {
            label: 'Save As PDF',
            click (item, focusedWindow) {
              screenShotPDF(focusedWindow)
            }
          },
          {
            label: 'As image',
            click(item, focusedWindow) {
              screenShot(focusedWindow)
            }
          }
        ]
      }
    ]
  },
  {
    role: 'window',
    submenu: [
      {
        label: 'Close',
        accelerator: 'CmdOrCtrl+W',
        role: 'close'
      },
      {
        type: 'separator'
      },
      {
        label: 'Minimize',
        accelerator: 'CmdOrCtrl+M',
        role: 'minimize'
      }
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Submit Bug Report',
        click () { require('electron').shell.openExternal('mailto:jberlin@cs.odu.edu') }
      }
    ]
  }
]

if (process.platform === 'darwin') {
  template.unshift({
    label: name,
    submenu: [
      {
        label: 'About',
        submenu: [
          {
            label: `Learn more about ${name}`,
            click () { require('electron').shell.openExternal('http://machawk1.github.io/wail/') }
          },
          {
            label: 'WSDL',
            click () { require('electron').shell.openExternal('https://ws-dl.cs.odu.edu/') }
          }
        ]
      },
      {
        type: 'separator'
      },
      {
        role: 'services',
        submenu: []
      },
      {
        type: 'separator'
      },
      {
        role: 'hide'
      },
      {
        role: 'hideothers'
      },
      {
        role: 'unhide'
      },
      {
        type: 'separator'
      },
      {
        role: 'quit'
      }
    ]
  })
  // Window menu.
  template[ 3 ].submenu = [
    {
      label: 'Close',
      accelerator: 'CmdOrCtrl+W',
      role: 'close'
    },
    {
      label: 'Minimize',
      accelerator: 'CmdOrCtrl+M',
      role: 'minimize'
    },
    {
      label: 'Zoom',
      role: 'zoom'
    },
    {
      type: 'separator'
    },
    {
      label: 'Bring All to Front',
      role: 'front'
    }
  ]
} else {
  template.unshift({
    label: name,
    submenu: [
      {
        label: 'About',
        submenu: [
          {
            label: `Learn more about ${name}`,
            click () { require('electron').shell.openExternal('http://machawk1.github.io/wail/') }
          },
          {
            label: 'WSDL',
            click () { require('electron').shell.openExternal('https://ws-dl.cs.odu.edu/') }
          }
        ]
      },
      {
        type: 'separator'
      },
      {
        role: 'quit'
      }
    ]
  })
}

export default template
