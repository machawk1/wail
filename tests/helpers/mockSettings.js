import fs from 'fs-extra'
import kph from 'key-path-helpers'
import path from 'path'

export default class MockSettings {
  constructor () {
    this._settingsCache = null
  }

  configure (pathToSettings) {
    this._settingsCache = fs.readJsonSync(pathToSettings)
  }

  get (what) {
    if (typeof what === 'string') {
      return kph.getValueAtKeyPath(this._settingsCache, what)
    }
    return this._settingsCache
  }
}
