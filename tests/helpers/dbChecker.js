import path from 'path'
import Promise from 'bluebird'
import _ from 'lodash'
import split from 'split2'
import through2 from 'through2'
import fs from 'fs-extra'
import isRunning from 'is-running'
import psTree from 'ps-tree'
import findP from 'find-process'
import pathExists from 'file-exists'
import Db from 'nedb'
import { heritrixFinder } from '../../wail-core/util/serviceManHelpers'

const hFindRegx = /(heritrix)|(java)/i

const colSeedFinder = {
  $where () {
    return this.forCol === 'default' && this.url === 'http://example.com'
  }
}

const testCrawlFinder = {
  $where () {
    return this.forCol === 'default' && this.urls === 'http://example.com'
  }
}

const dbPaths = () => {
  const plat = process.platform
  let base
  if (plat === 'linux') {
    base = path.join(process.env['HOME'], '.config/WAIL/database')
  } else if (plat === 'darwin') {
    base = plat.join(process.env['HOME'], 'Library/Application\\ Support/WAIL/database')
  }
  return {
    pids: path.join(base, 'pids.db'),
    crawls: path.join(base, 'crawls.db'),
    archives: path.join(base, 'archives.db'),
    archiveSeeds: path.join(base, 'archiveSeeds.db')
  }
}

const readDb = (dbPath, transformer) => new Promise((resolve, reject) => {
  let dbStream = fs.createReadStream(dbPath)
  let dbEntries = []
  let splitter = split()
  let parser = through2.obj(function (item, enc, next) {
    dbEntries.push(JSON.parse(item))
    next()
  })
  dbStream
    .pipe(splitter)
    .on('error', error => {
      splitter.emit('error', error)
    })
    .pipe(parser)
    .on('error', error => {
      parser.emit('error', error)
    })
    .on('finish', () => {
      dbStream.destroy()
      resolve(transformer(dbEntries))
    })
    .on('error', error => {
      dbStream.destroy()
      reject(error)
    })
})

const pidDbTrans = pidEntries => {
  const result = {wasError: false, empty: false}
  const len = pidEntries.length
  switch (len) {
    case 2: {
      let [a, b] = pidEntries
      if (a._id === 'heritrix') {
        result.heritrix = a
      } else {
        result.wayback = a
      }
      if (b._id === 'heritrix') {
        result.heritrix = b
      } else {
        result.wayback = b
      }
      break
    }
    case 4: {
      let [a, b, dela, delb] = pidEntries
      if (dela._id === 'heritrix') {
        result.heritrix = dela
      } else {
        result.wayback = dela
      }
      if (delb._id === 'heritrix') {
        result.heritrix = delb
      } else {
        result.wayback = delb
      }
      break
    }
    case 0: {
      result.empty = true
      break
    }
    default: {
      console.log('whoa there')
      result.wasError = true
      break
    }
  }
  return result
}

const pidSelector = who => pidEntries => {
  const result = {wasError: false, empty: false}
  const len = pidEntries.length
  switch (len) {
    case 2: {
      let [a, b] = pidEntries
      if (a._id === who) {
        result[who] = a
      } else {
        result[who] = b
      }
      break
    }
    case 4: {
      let [a, b, dela, delb] = pidEntries
      if (dela._id === who) {
        result[who] = dela
      } else {
        result[who] = delb
      }
      break
    }
    case 0: {
      result.empty = true
      break
    }
    default: {
      console.log('whoa there')
      result.wasError = true
      break
    }
  }
  return result
}

export default class DbChecker {
  constructor () {
    let {pids, crawls, archives, archiveSeeds} = dbPaths()
    this._pidPath = pids
    this._pidDb = null
    this._crawlDb = new Db({
      filename: crawls,
      autoload: true
    })
    this._archiveDb = new Db({
      filename: archives,
      autoload: true
    })
    this._archiveSeedsDb = new Db({
      filename: archiveSeeds,
      autoload: true
    })
  }

  readArchives () {
    return new Promise((resolve, reject) => {
      this._archiveDb.findOne({_id: 'default'}, (err, defCol) => {
        if (err) {
          reject(err)
        } else {
          resolve(defCol)
        }
      })
    })
  }

  readArchiveSeeds () {
    return new Promise((resolve, reject) => {
      this._archiveSeedsDb.find(colSeedFinder, (err, defCol) => {
        if (err) {
          reject(err)
        } else {
          resolve(defCol)
        }
      })
    })
  }

  readCrawls () {
    return new Promise((resolve, reject) => {
      this._crawlDb.find(testCrawlFinder, (err, testCrawl) => {
        if (err) {
          reject(err)
        } else {
          resolve(testCrawl)
        }
      })
    })
  }

  readPids () {
    return readDb(this._pidPath, pidDbTrans)
  }

  getHeritrixPid () {
    if (!this._pidDb) {
      this._pidDb = new Db({
        filename: this._pidPath,
        autoload: true
      })
    }
    return new Promise((resolve, reject) => {
      this._pidDb.findOne({_id: 'heritrix', who: 'heritrix'}, (err, h) => {
        if (err) {
          reject(err)
        } else {
          resolve(h)
        }
      })
    })
  }

  getWaybackPid () {
    if (!this._pidDb) {
      this._pidDb = new Db({
        filename: this._pidPath,
        autoload: true
      })
    }
    return new Promise((resolve, reject) => {
      this._pidDb.findOne({_id: 'wayback', who: 'wayback'}, (err, w) => {
        if (err) {
          reject(err)
        } else {
          resolve(w)
        }
      })
    })
  }

  isPidRunning (pid) {
    return isRunning(pid)
  }

  determinIfSpawnedHeritrixIsWails () {
    return findP('name', hFindRegx).then(findResults => heritrixFinder(findResults))
  }

  getProcessTreeForPid (pid) {
    return new Promise((resolve, reject) => {
      psTree(pid, (err, kids) => {
        if (err) {
          reject(err)
        } else {
          resolve(kids)
        }
      })
    })
  }

  findProcessBy (by, what) {
    return findP(by, what)
  }

  filePathExists (aPath) {
    return pathExists(aPath)
  }
}
