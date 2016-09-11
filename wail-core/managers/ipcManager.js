import {ipcMain as ipc} from 'electron'
import EventEmitter from 'eventemitter3'

export default class IpcManager extends EventEmitter {
  constructor () {
    super()
  }
}
