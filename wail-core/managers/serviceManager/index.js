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