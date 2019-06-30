import '../../../wailPollyfil'
import autobind from 'autobind-decorator'
import {ipcRenderer, remote} from 'electron'
import childProcess from 'child_process'
import cp from 'child_process'
import os from 'os'
import path from 'path'
import through2 from 'through2'
import S from 'string'
import fs from 'fs-extra'
import del from 'del'
import streamSort from 'sort-stream2'
import bytewise from 'bytewise'
import schedule from 'node-schedule'
import util from 'util'
import Logger from '../../logger/logger'
import chokidar from 'chokidar'

S.TMPL_OPEN = '{'
S.TMPL_CLOSE = '}'

const settings = remote.getGlobal('settings')
const logger = new Logger({ path: remote.getGlobal('indexLogPath') })
const logString = 'indexer %s'
const logStringError = 'indexer error where[ %s ] stack [ %s ]'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
let prevIndexingDone = true

const archiveWatchers = []

function generatePathIndex (genCdx) {
  let index = []
  let count = 0
  let onlyWarf = through2.obj(function (item, enc, next) {
    if (!item.stats.isDirectory() && path.extname(item.path) === '.warc') {
      this.push(item)
      count++
    }
    next()
  })
  fs.walk(settings.get('warcs'))
    .on('error', (err) => onlyWarf.emit('error', err)) // forward the error on
    .pipe(onlyWarf)
    .on('data', item => {
      index.push(`${path.basename(item.path)}\t${item.path}`)
    })
    .on('end', () => {
      if (count > 0) {
        console.log('The count was greater than zero')
        fs.writeFile(settings.get('index'), index.join(os.EOL), 'utf8', err => {
          console.log('Releasing pindex writelock')
          if (err) {
            console.error('generating path index with error', err)
            logger.error(util.format(logStringError, 'generate path index on end', err.stack))
            prevIndexingDone = true
          } else {
            console.log('done generating path index no error')
            logger.info(util.format(logString, 'done generating path index no error'))
            genCdx()
          }
        })
      } else {
        console.log('There were no warcs to index')
        logger.info(util.format(logString, 'There were no warcs to index'))
        prevIndexingDone = true
      }
    })
    .on('error', err => {
      if (Reflect.has(err, 'stack')) {
        logger.error(util.format(logStringError, 'generateIndexPath on error', err.stack))
      } else {
        logger.error(util.format(logStringError, 'generateIndexPath on error', `${err.message} ${err.fileName} ${err.lineNumber} `))
      }
      console.error('generating path index with error', err)
      prevIndexingDone = true
    })
}

//  implements bytewise sorting of export LC_ALL=C; sort
function unixSort (a, b) {
  return bytewise.compare(bytewise.encode(a), bytewise.encode(b))
}

function generateCDX () {
  let replace = /.warc+$/g
  let cdxHeaderIncluded = false

  let onlyWorf = through2.obj(function (item, enc, next) {
    if (!item.stats.isDirectory() && path.extname(item.path) === '.warc') {
      this.push(item)
    }
    next()
  })

  let cdxp = settings.get('cdx')
  let cdxIndexer = settings.get('cdxIndexer')

  let worfToCdx = through2.obj(function (item, enc, next) {
    let through = this // hope this ensures that this is through2.obj
    let cdx = path.basename(item.path).replace(replace, '.cdx')
    let cdxFile = `${cdxp}/${cdx}`
    childProcess.exec(`${cdxIndexer} ${item.path} ${cdxFile}`, (err, stdout, stderr) => {
      if (err) {
        logger.error(util.format(logStringError, `generateCDX exec cdxinder ${stderr}`, err.stack))
        next()
      } else {
        fs.readFile(cdxFile, 'utf8', (errr, value) => {
          if (errr) {
            logger.error(util.format(logStringError, `generateCDX exec cdxinder read ${cdxFile}`, errr.stack))
          } else {
            through.push(value)
          }
          next()
        })
      }
    })
  })

  let uniqueLines = new Set()

  let cdxToLines = through2.obj(function (item, enc, next) {
    let through = this
    S(item).lines().forEach((line, index) => {
      if (!uniqueLines.has(line)) {
        if (index > 0) {
          if (!S(line).isEmpty()) {
            through.push(`${line.trim()}${os.EOL}`)
          }
        } else if (!cdxHeaderIncluded) {
          through.push(`${line}${os.EOL}`)
          cdxHeaderIncluded = true
        }
        uniqueLines.add(line)
      }
    })
    next()
  })
  if (process.platform === 'win32') {
    let writeStream = fs.createWriteStream(settings.get('indexCDX'))
    fs.walk(settings.get('warcs'))
      .on('error', (err) => onlyWorf.emit('error', err)) // forward the error on please....
      .pipe(onlyWorf)
      .on('error', (err) => worfToCdx.emit('error', err)) // forward the error on please....
      .pipe(worfToCdx)
      .pipe(cdxToLines)
      .pipe(streamSort(unixSort))
      .pipe(writeStream)
      .on('close', () => {
        writeStream.destroy()
        console.log('we have closed')
        del([ settings.get('wayback.allCDX'), settings.get('wayback.notIndexCDX') ], { force: true })
          .then(paths => {
            let deleted = `Deleted files and folders:\n${paths.join('\n')}`
            console.log(deleted)
            logger.info(util.format(logString, deleted))
            prevIndexingDone = true
          })
      })
      .on('error', err => {
        logger.error(util.format(logStringError, 'generateCDX on error', err.stack))
        prevIndexingDone = true
      })
  } else {
    let writeStream = fs.createWriteStream(settings.get('cdxTemp'))
    fs.walk(settings.get('warcs'))
      .on('error', (err) => onlyWorf.emit('error', err)) // forward the error on please....
      .pipe(onlyWorf)
      .on('error', (err) => worfToCdx.emit('error', err)) // forward the error on please....
      .pipe(worfToCdx)
      .pipe(cdxToLines)
      .pipe(writeStream)
      .on('close', () => {
        writeStream.destroy()
        console.log('we have closed')
        childProcess.exec(`export LC_ALL=C; sort -u ${settings.get('cdxTemp')} > ${settings.get('indexCDX')}`,
          (error, stdout, stderr) => {
            if (error) {
              logger.error(util.format(logStringError, `nix sorting cdx temp ${error}`))
            }
            del([ settings.get('wayback.allCDX'), settings.get('wayback.notIndexCDX') ], { force: true })
              .then(paths => {
                let deleted = `Deleted files and folders:\n${paths.join('\n')}`
                console.log(deleted)
                fs.remove(settings.get('cdxTemp'), (maybeError) => {
                  if (maybeError) {
                    logger.error(util.format(logStringError, `nix sorting cdx temp ${maybeError}`))
                  }
                  logger.info(util.format(logString, deleted))
                  prevIndexingDone = true
                })
              })
          })
      })
      .on('error', err => {
        logger.error(util.format(logStringError, 'generateCDX on error', err.stack))
        prevIndexingDone = true
      })
  }
}

class Indexer {
  constructor () {
    this.job = null
    this.started = false
  }

  @autobind
  indexer () {
    if (!this.started) {
      // let exec =settings.get('pywb.wbMan')

      // console.log(opts)
      // logger.info(util.format('Indexer %s', 'launching autoindexer'))
      // try {
      //   let autoIndexer = childProcess.spawn(exec,['autoindex', 'Wail'], opts)
      //   autoIndexer.stdout.on('data', (data) => {
      //     console.log(`stdout: ${data}`);
      //   });
      //
      //   autoIndexer.stderr.on('data', (data) => {
      //     console.log(`stderr: ${data}`);
      //   });
      //   // wayback.unref()
      // } catch (err) {
      //   logger.error(util.format('Indexer %s', 'launch autoindexer', err))
      // }
      let rule = new schedule.RecurrenceRule()
      // this process can take more than 10 seconds
      // so check 3x a minute
      rule.second = [ 10, 30, 50 ]
      this.job = schedule.scheduleJob(rule, () => {
        if (prevIndexingDone) {
          let opts = {
            cwd: settings.get('warcs')
            // stdio: [ 'ignore', 'ignore', 'ignore' ]
          }
          // prevIndexingDone = false
          // generatePathIndex(generateCDX)
          cp.exec(S(settings.get('pywb.reindexCol')).template({col: 'Wail'}), opts, (error, stdout, stderr) => {
            if (error) {
              logger.error('Indexer error %s', 'indexing error', stderr)
              console.error(error)
            }
            console.log(stderr)
            console.log(stdout)
            prevIndexingDone = true
          })
        }
      })
      this.started = true
    }
  }
}

ipcRenderer.on('start-index-indexing', (event) => {
  let dCol = S(settings.get('collections.colWarcs')).template({col: 'Wail'})
  let archiveWatcher = chokidar.watch(dCol, {
    ignoreInitial: true
  })
  archiveWatcher.on('add', (event, path) => {
    let opts = {
      cwd: settings.get('warcs')
    }
    cp.exec(S(settings.get('pywb.reindexCol')).template({col: 'Wail'}), opts, (error, stdout, stderr) => {
      if (error) {
        logger.error('Indexer error %s', 'indexing error', stderr)
        console.error(error)
      }
    })
  })

  archiveWatchers.push(archiveWatcher)
})

ipcRenderer.on('start-index-indexing-col', (event, col) => {
  let dCol = S(settings.get('collections.colWarcs')).template({col})
  let archiveWatcher = chokidar.watch(dCol, {
    ignoreInitial: true
  })
  archiveWatcher.on('add', (event, path) => {
    let opts = {
      cwd: settings.get('warcs')
    }
    cp.exec(S(settings.get('pywb.reindexCol')).template({col}), opts, (error, stdout, stderr) => {
      if (error) {
        logger.error('Indexer error %s', 'indexing error', stderr)
        console.error(error)
      }
    })
  })

  archiveWatchers.push(archiveWatcher)
})

ipcRenderer.on('stop', (event) => {
  console.log('Monitor get stop indexing monitoring')
  archiveWatchers.forEach(watcher => {
    watcher.close()
  })
  logger.info(util.format(logString, 'got stop indexing monitoring'))
  logger.cleanUp()
})

// let indexer = new Indexer()

// ipcRenderer.on('start-index-indexing', (event) => {
//   console.log('Monitor get start indexing monitoring')
//   logger.info(util.format(logString, 'got start indexing monitoring'))
//   ipcRenderer.send('got-it', { from: 'indexer', yes: true })
//   indexer.indexer()
// })
//
// ipcRenderer.on('stop', (event) => {
//   console.log('Monitor get stop indexing monitoring')
//   logger.info(util.format(logString, 'got stop indexing monitoring'))
//   logger.cleanUp()
//   indexer.job.cancel()
//   indexer.job = null
//   indexer = null
// })
