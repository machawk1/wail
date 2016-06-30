import child_process from "child_process"
import os from 'os'
import path from 'path'
import rp from 'request-promise'
import named from 'named-regexp'
import through2 from 'through2'
import S from 'string'
import moment from 'moment'
import _ from 'lodash'
import Promise from 'bluebird'
import fs from 'fs-extra'
import del from "del"
import streamSort from "sort-stream2"
import bytewise from "bytewise"
import cron from 'cron'
import ReadWriteLock from 'rwlock'
import settings from '../settings/settings'
import schedule from 'node-schedule'
const indexLock = new ReadWriteLock()
const jobLock = new ReadWriteLock()

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
  indexLock.readLock('pindex', warcReadRelease => {
    console.log("Aquiring pindex readlock")
    fs.walk(settings.get('warcs'))
      .on('error', (err) => onlyWarf.emit('error', err)) // forward the error on
      .pipe(onlyWarf)
      .on('data', item => {
        index.push(`${path.basename(item.path)}\t${item.path}`)
      })
      .on('end', () => {
        console.log("Aquiring pindex writelock")
        indexLock.writeLock('pindex', indexWriteRelease => {
          if (count > 0) {
            console.log('The count was greater than zero')
            fs.writeFile(settings.get('index'), index.join(os.EOL), 'utf8', err => {
              console.log("Releasing pindex writelock")
              if (err) {
                indexWriteRelease()
                console.error('generating path index with error', err)
                throw  err
              } else {

                console.log('done generating path index no error')
                genCdx()
              }
            })
          } else {
            console.log("There were no warcs to index")
            indexWriteRelease()
          }

        })
        console.log("Releasing pindex readlock")
        warcReadRelease()
      })
  })
}

//implements bytewise sorting of export LC_ALL=C; sort
function unixSort (a, b) {
  return bytewise.compare(bytewise.encode(a), bytewise.encode(b))
}

function generateCDX () {
  let replace = /.warc+$/g
  let cdxHeaderIncluded = false

  let onlyWorf = through2.obj(function (item, enc, next) {
    if (!item.stats.isDirectory() && path.extname(item.path) === '.warc')
      this.push(item)
    next()
  })

  let cdxp = settings.get('cdx')
  let cdxIndexer = settings.get('cdxIndexer')

  let worfToCdx = through2.obj(function (item, enc, next) {
    let through = this //hope this ensures that this is through2.obj
    let cdx = path.basename(item.path).replace(replace, '.cdx')
    let cdxFile = `${cdxp}/${cdx}`
    child_process.exec(`${cdxIndexer} ${item.path} ${cdxFile}`, (err, stdout, stderr) => {
      if (err) {
        throw err
      }
      fs.readFile(cdxFile, 'utf8', (errr, value)=> {
        if (errr) {
          throw errr
        }
        through.push(value)
        next()
      })
    })
  })

  let uniqueLines = new Set()

  let cdxToLines = through2.obj(function (item, enc, next) {
    let through = this
    S(item).lines().forEach((line, index) => {
      if (!uniqueLines.has(line)) {
        if (index > 0) {
          through.push(line + os.EOL)
        } else if (!cdxHeaderIncluded) {
          through.push(line + os.EOL)
          cdxHeaderIncluded = true
        }
        uniqueLines.add(line)
      }
    })
    next()
  })

  let writeStream = fs.createWriteStream(settings.get('indexCDX'))
  indexLock.writeLock('indedxCDX', indexCDXWriteRelease => {
    console.log('Acquiring write lock for indexCDX')
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
            console.log('Releaseing write lock for indexCDX')
            console.log('Deleted files and folders:\n', paths.join('\n'))
            indexCDXWriteRelease()
          })
      })
  })

}

function heritrixAccesible () {
  console.log("checking heritrix accessibility")
  let optionEngine = settings.get('heritrix.optionEngine')
  return new Promise((resolve, reject)=> {
    rp(optionEngine)
      .then(success => {
        resolve({ status: true })
      })
      .catch(err => {
        resolve({ status: false, error: err })
      })
  })
}

function getHeritrixJobsState () {
  return new Promise((resolve, reject) => {
    let jobLaunch = named.named(/[a-zA-Z0-9-/.]+jobs\/(:<job>\d+)\/(:<launch>\d+)\/logs\/progress\-statistics\.log$/)
    let job = named.named(/[a-zA-Z0-9-/.]+jobs\/(:<job>\d+)/)

    let jobs = {}
    let counter = 0
    let jobsConfs = {}

    let heritrixJobP = settings.get('heritrixJob')

    let onlyJobLaunchsProgress = through2.obj(function (item, enc, next) {
      let didMath = jobLaunch.exec(item.path)
      if (didMath) {
        jobs[ didMath.capture('job') ].log = true
        jobs[ didMath.capture('job') ].launch = didMath.capture('launch')
        jobs[ didMath.capture('job') ].logPath = item.path
        this.push(jobs[ didMath.capture('job') ])
      } else {
        if (item.stats.isDirectory()) {
          let jid = job.exec(item.path)

          if (jid) {
            counter += 1
            jobsConfs[ jid.capture('job') ] =
              fs.readFileSync(`${heritrixJobP}/${jid.capture('job')}/crawler-beans.cxml`, "utf8")
            jobs[ jid.capture('job') ] = {
              log: false,
              jobId: jid.capture('job'),
              launch: '',
              path: `${heritrixJobP}/${jid.capture('job')}`,
              logPath: ' ',
              urls: '',
              runs: [],
            }
          }
        }
      }

      next()
    })

    let launchStats = through2.obj(function (item, enc, next) {
      fs.readFile(item.logPath, "utf8", (err, data)=> {
        if (err) throw err
        // console.log(data)
        let lines = data.trim().split('\n')
        let lastLine = S(lines[ lines.length - 1 ])

        if (lastLine.contains('Ended by operator')) {
          // jobs[item.jobId].progress.ended = true
          let nextToLast = S(lines[ lines.length - 2 ])
          let nextLastfields = nextToLast.collapseWhitespace().s.split(' ')
          jobs[ item.jobId ].runs.push({
            ended: true,
            timestamp: moment(nextLastfields[ 0 ]),
            discovered: nextLastfields[ 1 ],
            queued: nextLastfields[ 2 ],
            downloaded: nextLastfields[ 3 ],
          })

        } else {
          let fields = lastLine.collapseWhitespace().s.split(' ')
          jobs[ item.jobId ].runs.push({
            ended: false,
            timestamp: moment(fields[ 0 ]),
            discovered: fields[ 1 ],
            queued: fields[ 2 ],
            downloaded: fields[ 3 ],
          })

        }
      })
      this.push(item)
      next()
    })

    //return { confs: jobsConfs, obs: sortedJobs, }
    fs.ensureDir(heritrixJobP, err => {
      if (err) {
        reject(err)
      } else {
        fs.walk(heritrixJobP)
          .pipe(onlyJobLaunchsProgress)
          .pipe(launchStats)
          .on('data', item => {
          })
          .on('end', function () {
            if (counter > 0) {
              let sortedJobs = _.chain(jobs)
                .toPairs()
                .map(job => {
                  job[ 1 ].runs.sort((j1, j2) => j1.timestamp.isAfter(j2.timestamp))
                  return job[ 1 ]
                })
                .value()
              resolve({ count: counter, confs: jobsConfs, jobs: sortedJobs, })
            } else {
              resolve({ error: "count zero", count: 0, stack: 'ere' })
            }
          })
          .on('error', function (error, item) {
            console.log(error.message)
            console.log(item.path) // the file the error occurred on
            reject(error)
          })
      }
    })

  })

}

function waybackAccesible () {
  console.log("checking wayback accessibility")
  let wburi = settings.get('wayback.uri_wayback')
  return new Promise((resolve, reject)=> {
    rp({ uri: wburi })
      .then(success => {
        resolve({ status: true })
      })
      .catch(err => {
        resolve({ status: false, error: err })
      })
  })
}

/*

 *    *    *    *    *    *
 ┬    ┬    ┬    ┬    ┬    ┬
 │    │    │    │    │    |
 │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
 │    │    │    │    └───── month (1 - 12)
 │    │    │    └────────── day of month (1 - 31)
 │    │    └─────────────── hour (0 - 23)
 │    └──────────────────── minute (0 - 59)
 └───────────────────────── second (0 - 59, OPTIONAL)

 */

export class Indexer {
  constructor () {
    this.schedule = null
    this.started = false
    this.indexer = this.indexer.bind(this)
  }

  indexer () {
    if (!this.started) {
      this.schedules = new cron.CronJob('*/10 * * * * *', () => {
        generatePathIndex(generateCDX)
      }, null, true)
      this.started = true
    }
  }
}

export class JobMonitor {
  constructor () {
    this.schedule = null
    this.started = false
    this.checkJobStatuses = this.checkJobStatuses.bind(this)
  }

  checkJobStatuses (cb) {
    if (!this.started) {
      this.schedule = new cron.CronJob('*/20 * * * *', () => {
        jobLock.writeLock(release => {
          getHeritrixJobsState()
            .then(status => {
              release()
              cb(status)
            })
            .catch(error => {
              release()
              cb(error)
            })
        })

      }, null, true)
      this.started = true
    }
  }
}

export class StatusMonitor {
  constructor () {
    this.job = null
    this.started = false
    this.checkReachability = this.checkReachability.bind(this)
    this.statues = {
      heritrix: false,
      wayback: false
    }
  }

  checkReachability (cb) {
    if (!this.started) {
      //every two minutes
      let rule = new schedule.RecurrenceRule()
      rule.second = [ 0, 10, 20, 30, 40, 50 ]
      this.job = schedule.scheduleJob(rule, function () {
        heritrixAccesible()
          .then(ha => this.statues.heritrix = ha.status)
          .catch(hdown => this.statues.heritrix = hdown.status)
          .finally(() =>
            waybackAccesible()
              .then(wba => this.statues.wayback = wba.status)
              .catch(wbdown => this.statues.wayback = wbdown.status)
              .finally(() => {
                cb(this.statues)
                console.log("Done with status checks ", this.statues)
              })
          )
      })
      this.started = true
    }
  }
}

class monitors {
  constructor () {
    this.schedules = []
    this.started = {
      jobs: false,
      index: false,
      reachability: false,
      test: false,
    }

    this.statues = {
      heritrix: false,
      wayback: false
    }

    this.checkJobStatuses = this.checkJobStatuses.bind(this)
    this.checkReachability = this.checkReachability.bind(this)
    this.indexer = this.indexer.bind(this)
    this.cancelAll = this.cancelAll.bind(this)
  }

  cancelAll () {
    this.schedules.forEach(s => s.cancel())
  }

  indexer () {
    if (!this.started.index) {
      this.schedules.push(new cron.CronJob('*/10 * * * * *', () => {
        generatePathIndex(generateCDX)
      }, null, true))
      this.started.index = true
    }
  }

  checkReachability (cb) {
    if (!this.started.reachability) {
      //every two minutes
      this.schedules.push(new cron.CronJob('*/5 * * * *', () => {

        heritrixAccesible()
          .then(ha => this.statues.heritrix = ha.status)
          .catch(hdown => this.statues.heritrix = hdown.status)
          .finally(() =>
            waybackAccesible()
              .then(wba => this.statues.wayback = wba.status)
              .catch(wbdown => this.statues.wayback = wbdown.status)
              .finally(() => {
                cb(this.statues)
                console.log("Done with status checks ", this.statues)
              })
          )
      }, null, true))
      this.started.reachability = true
    }
  }

  checkJobStatuses (cb) {
    if (!this.started.jobs) {
      //every two minutes
      this.schedules.push(new cron.CronJob('*/20 * * * *', () => {
        jobLock.writeLock(release => {
          getHeritrixJobsState()
            .then(status => {
              release()
              cb(status)
            })
            .catch(error => {
              release()
              cb(error)
            })
        })

      }, null, true))
      this.started.jobs = true
    }
  }

}

