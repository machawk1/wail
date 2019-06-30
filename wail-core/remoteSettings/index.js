import kph from 'key-path-helpers'
import * as fs from 'fs-extra'
import path from 'path'
import { remote, ipcRenderer as ipc } from 'electron'

export default class RemoteSettings {
  constructor () {
    this._settingsDir = remote.getGlobal('settingsDir')
    this._settingsCache = null
  }

  configure () {
    this._settingsCache = fs.readJsonSync(path.join(this._settingsDir, 'settings.json'))
    ipc.on('repopulate-settings-cache', () => {
      this._repopulateCache()
    })
  }

  _repopulateCache () {
    this._settingsCache = fs.readJsonSync(path.join(this._settingsDir, 'settings.json'))
  }

  get (what) {
    if (typeof what === 'string') {
      return kph.getValueAtKeyPath(this._settingsCache, what)
    }
    return this._settingsCache
  }
}
