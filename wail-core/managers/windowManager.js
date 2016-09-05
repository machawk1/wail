import {BrowserWindow} from 'electron'
import EventEmitter from 'eventemitter3'

export default class WindowManager extends EventEmitter {
  constructor () {
    super()
    this.windows = new Map()
  }

  init (winConfigs) {
    winConfigs.forEach(w => {
      this.windows.set(w.name, {
        window: null,
        url: w.url,
        config: w.config,
        onClose: w.onClose
      })
    })
  }

  show(who) {
    let w = this.windows.get(who)
    if (w.window == null) {

    }
  }
}