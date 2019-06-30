import cp from 'child_process'
import {shell} from 'electron'

export function openFSLocation (itemPath) {
  if (process.platform === 'darwin') {
    cp.exec(`open ${itemPath}`)
  } else {
    shell.openItem(itemPath)
  }
}

export function openUrlInBrowser (uri) {
  shell.openExternal(uri)
}
