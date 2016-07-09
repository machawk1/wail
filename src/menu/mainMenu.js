const name = require('electron').remote.app.getName()


let settingSubMenu = {
  label: 'Settings',
  submenu: [
    {
      label: 'View Or Edit',
      click(item, focusedWindow) {
        if (focusedWindow) focusedWindow.reload()
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
      click(item, focusedWindow) {
        if (focusedWindow) {
          focusedWindow.webContents.toggleDevTools()
        }
      }
    },
    {
      label: 'Reload',
      accelerator: 'CmdOrCtrl+R',
      click(item, focusedWindow) {
        if (focusedWindow) focusedWindow.reload()
      }
    },
  ]
}

let windowSubMenu = {
  role: 'window',
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
      click() { require('electron').shell.openExternal('http://machawk1.github.io/wail/') }
    },
    {
      label: 'WSDL',
      click() { require('electron').shell.openExternal('https://ws-dl.cs.odu.edu/') }
    },
  ]
}

let helpSubMenu = {
  role: 'help',
  submenu: [
    {
      label: 'Submit Bug Report',
      click() { require('electron').shell.openExternal('mailto:wail@matkelly.com') }
    },
  ]
}

let template = [ settingSubMenu, viewSubMenu, windowSubMenu, aboutSubMenu, helpSubMenu ]

if (process.platform === 'darwin') {
  // Window menu.
  template.unshift({
    label: name,
    submenu: [
      {
        role: 'about'
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
      },
    ]
  })
  template[ 2 ].submenu = [
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
    },
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
    }
  ]
}

export default template
