const name = require('electron').app.getName()
//
// let settingSubMenu = {
//   label: 'Settings',
//   submenu: [
//     {
//       label: 'View Or Edit',
//       click (item, focusedWindow) {
//         console.log('settings menu clicked', focusedWindow)
//         if (focusedWindow) global.showSettingsMenu(focusedWindow)
//       }
//     },
//   ]
// }
//
// let viewSubMenu = {
//   label: 'View',
//   submenu: [
//     {
//       label: 'Toggle Developer Tools',
//       accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
//       click (item, focusedWindow) {
//         if (focusedWindow) {
//           focusedWindow.webContents.toggleDevTools()
//         }
//       }
//     },
//     {
//       label: 'Reload',
//       accelerator: 'CmdOrCtrl+R',
//       click (item, focusedWindow) {
//         if (focusedWindow) focusedWindow.reload()
//       }
//     },
//   ]
// }
//
// let editSubMenu = {
//   label: 'Edit',
//   submenu: [
//     {
//       role: 'undo'
//     },
//     {
//       role: 'redo'
//     },
//     {
//       type: 'separator'
//     },
//     {
//       role: 'cut'
//     },
//     {
//       role: 'copy'
//     },
//     {
//       role: 'paste'
//     },
//     {
//       role: 'pasteandmatchstyle'
//     },
//     {
//       role: 'delete'
//     },
//     {
//       role: 'selectall'
//     },
//     // { label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:' },
//     // { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:' },
//     // { type: 'separator' },
//     // { label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
//     // { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
//     // { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
//     // { label: 'Select All', accelerator: 'CmdOrCtrl+A', selector: 'selectAll:' }
//   ]
// }
//
// let windowSubMenu = {
//   role: 'Window',
//   submenu: [
//     {
//       role: 'minimize'
//     },
//     {
//       role: 'close'
//     },
//   ]
// }
//
// let aboutSubMenu = {
//   label: 'About',
//   submenu: [
//     {
//       label: `Learn more about ${name}`,
//       click () { require('electron').shell.openExternal('http://machawk1.github.io/wail/') }
//     },
//     {
//       label: 'WSDL',
//       click () { require('electron').shell.openExternal('https://ws-dl.cs.odu.edu/') }
//     },
//   ]
// }
//
// let helpSubMenu = {
//   label: 'Help',
//   submenu: [
//     {
//       label: 'Submit Bug Report',
//       click () { require('electron').shell.openExternal('mailto:wail@matkelly.com') }
//     },
//   ]
// }
//
// let template
//
// if (process.platform === 'darwin') {
//   let darWinMenu = {
//     label: name,
//     submenu: [
//       {
//         label: 'About',
//         submenu: [
//           {
//             label: `Learn more about ${name}`,
//             click () { require('electron').shell.openExternal('http://machawk1.github.io/wail/') }
//           },
//           {
//             label: 'WSDL',
//             click () { require('electron').shell.openExternal('https://ws-dl.cs.odu.edu/') }
//           },
//         ]
//       },
//       {
//         type: 'separator'
//       },
//       {
//         role: 'hide'
//       },
//       {
//         role: 'hideothers'
//       },
//       {
//         role: 'unhide'
//       },
//       {
//         type: 'separator'
//       },
//       {
//         label: 'Help',
//         submenu: [
//           {
//             label: 'Submit Bug Report',
//             click () { require('electron').shell.openExternal('mailto:wail@matkelly.com') }
//           },
//         ]
//       },
//       {
//         type: 'separator'
//       },
//       {
//         role: 'quit'
//       },
//     ]
//   }
//
//   windowSubMenu = {
//     label: 'Window',
//     submenu: [
//       {
//         label: 'Close',
//         accelerator: 'CmdOrCtrl+W',
//         role: 'close'
//       },
//       {
//         type: 'separator'
//       },
//       {
//         label: 'Minimize',
//         accelerator: 'CmdOrCtrl+M',
//         role: 'minimize'
//       },
//       {
//         type: 'separator'
//       },
//       {
//         label: 'Bring All to Front',
//         role: 'front'
//       },
//       {
//         type: 'separator'
//       },
//       {
//         label: 'Toggle Developer Tools',
//         accelerator: 'Alt+Command+I',
//         click (item, focusedWindow) {
//           if (focusedWindow) {
//             focusedWindow.webContents.toggleDevTools()
//           }
//         }
//       },
//     ]
//   }
//   template = [ darWinMenu, editSubMenu, windowSubMenu ]
// } else {
//   template = [ viewSubMenu, editSubMenu, windowSubMenu, aboutSubMenu, helpSubMenu ]
// }

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
      },
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
        role: 'togglefullscreen'
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
    ]
  },
  {
    role: 'window',
    submenu: [
      {
        role: 'minimize'
      },
      {
        role: 'close'
      },
    ]
  },
  {
    role: 'help',
    submenu: [
      {

        label: 'Submit Bug Report',
        click () { require('electron').shell.openExternal('mailto:wail@matkelly.com') }

      },
    ]
  },
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
          },
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
      },
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
}

export default template
