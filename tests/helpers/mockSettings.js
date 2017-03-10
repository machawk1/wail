import fs from 'fs-extra'
import kph from 'key-path-helpers'
import path from 'path'

export default class MockSettings {
  constructor () {
    this._settingsCache = null
  }

  configure () {
    this._settingsCache = fs.readJsonSync(path.join(process.cwd(), 'tests',
      'testServiceMan', 'settings.json'))
  }

  get (what) {
    if (typeof what === 'string') {
      return kph.getValueAtKeyPath(this._settingsCache, what)
    }
    return this._settingsCache
  }
}