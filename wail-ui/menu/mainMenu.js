import { dialog, app, shell } from 'electron'
import fs from 'fs-extra'
import S from 'string'
import cp from 'child_process'

const name = app.getName()

export function screenShotPDF (window) {
  if (window) {
    // console.log('Saving pdf')
    window.webContents.printToPDF({
      marginsType: 0,
      printBackground: true,
      printSelectionOnly: false,
    }, (error, data) => {
      if (error) {
        dialog.showErrorBox("Something went wrong :'(", 'Saving screen shot as PDF failed')
      } else {
        let opts = {
          title: 'Save Screen Shot As PDF',
          defaultPath: app.getPath('documents'),
          filters: [
            {name: 'PDF', extensions: ['pdf']}
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
                  buttons: ['Ok']
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
    window.webContents.capturePage((image) => {
      let opts = {
        title: 'Save Screen Shot',
        defaultPath: app.getPath('documents'),
        filters: [
          {name: 'PNG', extensions: ['png']},
          {name: 'JPG', extensions: ['jpg']}
        ]
      }
      let cb = (path) => {
        if (path) {
          let png = S(path.toLowerCase()).endsWith('png')

          let buf = png ? image.toPNG() : image.toJPEG(100)
          fs.writeFile(path, buf, 'binary', (wError) => {
            if (wError) {
              dialog.showErrorBox("Something went wrong :'(", 'Screen shot could not be saved to that path')
            } else {
              dialog.showMessageBox(window, {
                type: 'info',
                title: 'Done',
                message: 'Screen shot saved',
                buttons: ['Ok']
              }, (r) => console.log(r))
            }
          })
        }
      }
      dialog.showSaveDialog(window, opts, cb)
    })
  }
}

export const forceKill = {
  submenu: [
    {
      label: 'Force Termination',
      submenu: [
        {
          label: 'Heritrix',
          click (item, focusedWindow) {
            dialog.showMessageBox(focusedWindow, {
              type: 'question',
              title: 'Are you sure?',
              message: 'Forcefully terminating Heritrix will stop any crawls in progress',
              buttons: ['Im Sure', 'Cancel'],
              cancelId: 666
            }, (r) => {
              if (r === 1) {
                cp.exec("ps ax | grep 'heritrix' | grep -v grep | awk '{print \"kill -9 \" $1}' | sh")
              }
            })
          }
        },
        {
          label: 'Wayback',
          click (item, focusedWindow) {
            dialog.showMessageBox(focusedWindow, {
              type: 'question',
              title: 'Are you sure?',
              message: 'Forcefully terminating Wayback will stop any indexing in progress',
              buttons: ['Im Sure', 'Cancel'],
              cancelId: 666
            }, (r) => {
              if (r === 1) {
                cp.exec("ps ax | grep 'wayback' | grep -v grep | awk '{print \"kill -9 \" $1}' | sh")
              }
            })
          }
        }
      ]
    }
  ]
}

const menus = {
  linux: [
    {
      label: name,
      submenu: [
        {
          label: 'About',
          submenu: [
            {
              label: `Learn more about ${name}`,
              click () { shell.openExternal('https://github.com/N0taN3rd/wail/wiki') }
            },
            {
              label: 'WSDL',
              click () { shell.openExternal('https://ws-dl.cs.odu.edu/') }
            },
            {
              label: `Version: ${app.getVersion()}`
            }
          ]
        },
        {
          type: 'separator'
        },
        {
          label: 'Services',
          submenu: forceKill.submenu
        },
        {
          type: 'separator'
        },
        {
          role: 'quit'
        }
      ]
    },
    {
      label: 'File',
      submenu: [
        {
          label: 'Open Collections Location',
          click () {
            shell.openItem(global.settings.get('warcs'))
          }
        }
      ]
    },
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
          label: 'Toggle Developer Tools',
          accelerator: 'Ctrl+Shift+I',
          click (item, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.webContents.toggleDevTools()
            }
          }
        },
        {
          role: 'reload'
        },
        {
          type: 'separator'
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
              click (item, focusedWindow) {
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
          accelerator: 'Ctrl+W',
          role: 'close'
        },
        {
          label: 'Minimize',
          accelerator: 'Ctrl+M',
          role: 'minimize'
        }
      ]
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Submit Bug Report Via Email',
          click () { shell.openExternal('mailto:jberlin@cs.odu.edu') }
        },
        {
          label: 'Submit Bug Report Through Github',
          click () { shell.openExternal('https://github.com/N0taN3rd/wail/issues') }
        }
      ]
    }

  ],

  darwin: [
    {
      label: name,
      submenu: [
        {
          label: 'About',
          submenu: [
            {
              label: `Learn more about ${name}`,
              click () { shell.openExternal('https://github.com/N0taN3rd/wail/wiki') }
            },
            {
              label: 'WSDL',
              click () { shell.openExternal('https://ws-dl.cs.odu.edu/') }
            },
            {
              label: `Version: ${app.getVersion()}`
            }
          ]
        },
        {
          type: 'separator'
        },
        {
          label: 'Services',
          submenu: forceKill.submenu
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
    },
    {
      label: 'File',
      submenu: [
        {
          label: 'Open Collections Location',
          click () {
            shell.openItem(global.settings.get('warcs'))
          }
        }
      ]
    },
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
          label: 'Toggle Developer Tools',
          accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
          click (item, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.webContents.toggleDevTools()
            }
          }
        },
        {
          type: 'separator'
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
              click (item, focusedWindow) {
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
          accelerator: 'Cmd+W',
          role: 'close'
        },
        {
          label: 'Minimize',
          accelerator: 'Cmd+M',
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
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Submit Bug Report Via Email',
          click () { shell.openExternal('mailto:jberlin@cs.odu.edu') }
        },
        {
          label: 'Submit Bug Report Through Github',
          click () { shell.openExternal('https://github.com/N0taN3rd/wail/issues') }
        }
      ]
    }

  ],
  windows: [
    {
      label: name,
      submenu: [
        {
          label: 'About',
          submenu: [
            {
              label: `Learn more about ${name}`,
              click () { shell.openExternal('https://github.com/N0taN3rd/wail/wiki') }
            },
            {
              label: 'WSDL',
              click () { shell.openExternal('https://ws-dl.cs.odu.edu/') }
            },
            {
              label: `Version: ${app.getVersion()}`
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
    },
    {
      label: 'File',
      submenu: [
        {
          label: 'Open Collections Location',
          click () {
            shell.openItem(global.settings.get('warcs'))
          }
        }
      ]
    },
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
          label: 'Toggle Developer Tools',
          accelerator: 'Ctrl+Shift+I',
          click (item, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.webContents.toggleDevTools()
            }
          }
        },
        {
          type: 'separator'
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
              click (item, focusedWindow) {
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
          accelerator: 'Ctrl+W',
          role: 'close'
        },
        {
          label: 'Minimize',
          accelerator: 'Ctrl+M',
          role: 'minimize'
        }
      ]
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Submit Bug Report Via Email',
          click () { shell.openExternal('mailto:jberlin@cs.odu.edu') }
        },
        {
          label: 'Submit Bug Report Through Github',
          click () { shell.openExternal('https://github.com/N0taN3rd/wail/issues') }
        }
      ]
    }
  ]
}

var template

if (process.platform === 'darwin') {
  template = menus.darwin
} else if (process.platform === 'linux') {
  template = menus.linux
} else {
  template = menus.windows
}

export default template

