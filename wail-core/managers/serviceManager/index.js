import isRunning from 'is-running'
import WaybackProcessController from './processControlers/waybackProcessController'
import HeritrixProcessController from './processControlers/heritrixProcessController'

export default class ServiceManager {
  constructor (settings) {
    this._wbPC = new WaybackProcessController(settings)
    this._hPC = new HeritrixProcessController(settings)
    this._isWin = process.platform === 'win32'
    this._settings = settings
  }

  startWayback () {
    return this._wbPC.launchWayback()
  }

  restartWayback () {
    return this._wbPC.restart()
  }

  killWayback () {
    return this._wbPC.killProcess()
  }

  observeWayback (subscriber) {
    return this._wbPC.observe(subscriber)
  }

  isWaybackRunning () {
    if (this._wbPC.pid) {
      return isRunning(this._wbPC.pid)
    } else {
      return false
    }
  }

  startHeritrix () {
    return this._hPC.launchHeritrix()
  }

  killHeritrix () {
    return this._hPC.killProcess()
  }

  observeHeritrix (subscriber) {
    return this._hPC.observe(subscriber)
  }

  isHeritrixRunning () {
    if (this._hPC.pid) {
      return isRunning(this._hPC.pid)
    } else {
      return false
    }
  }

  startService (which) {
    if (which === 'heritrix') {
      return this._hPC.killProcess()
    } else {
      return this._wbPC.killProcess()
    }
  }

  async killAllServices () {
    await this._wbPC.killProcess()
    await this._hPC.killProcess()
  }

  killService (which) {
    if (which === 'all') {
      return this.killAllServices()
    } else if (which === 'heritrix') {
      return this._hPC.killProcess()
    } else {
      return this._wbPC.killProcess()
    }
  }

  isServiceUp (which) {
    if (which === 'heritrix') {
      return this.isHeritrixRunning()
    } else {
      return this.isWaybackRunning()
    }
  }
}
