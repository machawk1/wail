import cp from 'child_process'
import named from 'named-regexp'
import S from 'string'
import fs from 'fs-extra'
import rp from 'request-promise'
import serializeError from 'serialize-error'
import Promise from 'bluebird'
import isRunning from 'is-running'
import Datastore from 'nedb'
import path from 'path'
import findP from 'find-process'
import {
  findProcessOnHeritrixPort,
  findHPidWindows,
  findWbPidWindows,
  heritrixFinder,
  wasHeritrixStartError,
  heritrixLaunchErrorReport,
  killPid
} from '../../util/serviceManHelpers'
import { processStates, WaybakProcessController, HeritrixProcessController } from './processControlers'

export default class ServiceManager {
  constructor (settings) {
    this._wbPC = null
    this._hPC = null
    this._pidStore = new Datastore({
      filename: path.join(settings.get('wailCore.db'), 'pids.db'),
      autoload: true
    })
    this._isWin = process.platform === 'win32'
    this._settings = settings
  }
}
