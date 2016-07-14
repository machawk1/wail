const name = require('electron').app.getName()

let settingSubMenu = {
  label: 'Settings',
  submenu: [
    {
      label: 'View Or Edit',
      click (item, focusedWindow) {
        console.log('settings menu clicked',focusedWindow)
        if (focusedWindow) global.showSettingsMenu(focusedWindow)
      }
    },
  ]
}

let viewSubMenu = {
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
      label: 'Reload',
      accelerator: 'CmdOrCtrl+R',
      click (item, focusedWindow) {
        if (focusedWindow) focusedWindow.reload()
      }
    },
  ]
}

let windowSubMenu = {
  role: 'Window',
  submenu: [
    {
      role: 'minimize'
    },
    {
      role: 'close'
    },
  ]
}

let aboutSubMenu = {
  label: 'About',
  submenu: [
    {
      label: `Learn more about ${name}`,
      click () { require('electron').shell.openExternal('http://machawk1.github.io/wail/') }
    },
    {
      label: 'WSDL',
      click () { require('electron').shell.openExternal('https://ws-dl.cs.odu.edu/') }
    },
  ]
}

let helpSubMenu = {
  label: 'Help',
  submenu: [
    {
      label: 'Submit Bug Report',
      click () { require('electron').shell.openExternal('mailto:wail@matkelly.com') }
    },
  ]
}

let template

if (process.platform === 'darwin') {
  let darWinMenu = {
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
          },
        ]
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
        label: 'Help',
        submenu: [
          {
            label: 'Submit Bug Report',
            click () { require('electron').shell.openExternal('mailto:wail@matkelly.com') }
          },
        ]
      },
      {
        type: 'separator'
      },
      {
        role: 'quit'
      },
    ]
  }

  windowSubMenu = {
    label: 'Window',
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
      },
      {
        type: 'separator'
      },
      {
        label: 'Bring All to Front',
        role: 'front'
      },
      {
        type: 'separator'
      },
      {
        label: 'Toggle Developer Tools',
        accelerator: 'Alt+Command+I',
        click (item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.webContents.toggleDevTools()
          }
        }
      },
    ]
  }
  template = [ darWinMenu, windowSubMenu ]
} else {
  template = [ viewSubMenu, windowSubMenu, aboutSubMenu, helpSubMenu ]
}

export default template
