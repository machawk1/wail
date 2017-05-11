import chokidar from 'chokidar'
import walk from 'klaw'
import fs from 'fs-extra'
import directorySize from './directorySize'
import pathExists from './pathExists'
import pathIs from './pathIs'
import completeAssign from '../util/completeAssign'

const base = {
  walk,
  chokidarWatch: chokidar.watch,
  FSWatcher: chokidar.FSWatcher
}

export default completeAssign(base, fs, directorySize, pathExists, pathIs)
