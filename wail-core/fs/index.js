import chokidar from 'chokidar'
import walk from 'klaw'
import fsep from './fsePromise'
import directorySize from './directorySize'
import pathExists from './pathExists'
import pathIs from './pathIs'
import completeAssign from '../util/completeAssign'

const base = {
  walk,
  chokidarWatch: chokidar.watch,
  FSWatcher: chokidar.FSWatcher
}

export default completeAssign(base, fsep, directorySize, pathExists, pathIs)
