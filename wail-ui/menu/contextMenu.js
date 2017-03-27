import {Menu} from 'electron'

export default class ContextMenu {
  maybeShow (props, bwinow) {
    let editFlags = props.editFlags
    let menuTemp = []
    if (editFlags.canCut) {
      menuTemp.push({
        label: 'Cut',
        click (item, window) {
          window.webContents.cut()
        },
        enabled: true,
        visible: props.isEditable
      })
    }

    if (editFlags.canCopy) {
      if (menuTemp.length > 0) {
        menuTemp.push({
          type: 'separator'
        })
      }
      menuTemp.push({
        label: 'Copy',
        click (item, window) {
          window.webContents.copy()
        }
      })
    }

    if (editFlags.canPaste) {
      if (menuTemp.length > 0) {
        menuTemp.push({
          type: 'separator'
        })
      }
      menuTemp.push({
        label: 'Paste',
        click (item, window) {
          window.webContents.paste()
        }
      })
      menuTemp.push({
        label: 'Paste and Match Style',
        click (item, window) {
          window.webContents.pasteAndMatchStyle()
        }
      })
    }

    if (editFlags.canSelectAll) {
      if (menuTemp.length > 0) {
        menuTemp.push({
          type: 'separator'
        })
      }
      menuTemp.push({
        label: 'Select All',
        click (item, window) {
          window.webContents.selectAll()
        },
        enabled: true
      })
    }
    Menu.buildFromTemplate(menuTemp).popup(bwinow)
  }
}
