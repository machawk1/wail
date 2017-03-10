import kph from 'key-path-helpers'
import ElectronSettings from 'electron-settings'
import { remote, ipcRender as ipc } from 'electron'

export default class Settings {
  constructor () {
    this._settingsDir = remote.getGlobal('settingsDir')
    this._settingsCache = null
  }

  async configure () {
    ElectronSettings.configure({
      settingsDir: this._settingsDir,
      settingsFileName: 'settings.json',
      prettify: true
    })
    let wasError = false
    try {
      this._settingsCache = await ElectronSettings.get()
    } catch (error) {
      console.error('getting settings', error)
      wasError = true
    }
    if (!wasError) {
      ElectronSettings.on('write', ::this._repopulateCache)
    }
    return wasError
  }

  _repopulateCache () {
    let wasError = false, nSettings
    try {
      nSettings = ElectronSettings.getSync()
    } catch (error) {
      console.error('getting settings', error)
      wasError = true
    }
    this._settingsCache = nSettings
  }

  get (what) {
    if (typeof what === 'string') {
      return kph.getValueAtKeyPath(this._settingsCache, what)
    }
    return this._settingsCache
  }

  async set (what, to) {
    await ElectronSettings.set(what, to, {prettify: true})
    this._settingsCache = await ElectronSettings.get()
  }
}
