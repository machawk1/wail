import "babel-polyfill"
import autobind from 'autobind-decorator'
import { ipcRenderer, remote } from "electron"
import named from 'named-regexp'
import through2 from 'through2'
import S from 'string'
import moment from 'moment'
import _ from 'lodash'
import Promise from 'bluebird'
import fs from 'fs-extra'
import ReadWriteLock from 'rwlock'
import settings from '../settings/settings'
import schedule from 'node-schedule'
import os from 'os'
import util from 'util'
import Logger from '../logger/logger'


const logger = new Logger({path: remote.getGlobal('jobLogPath')})


const logString = "jobs %s"
const logStringError = "jobs error where [ %s ] stack [ %s ]"
const jobEndStatus = /[a-zA-Z0-9\-:]+\s(?:CRAWL\sEND(?:(?:ING)|(?:ED)).+)/

const jobLock = new ReadWriteLock()
const jobCache = {
  cache: null,
  index: new Map(),
}

const isWindows = os.platform() == 'win32'

let jobLaunchRe
let jobRe

if (isWindows) {
  jobLaunchRe = /[a-zA-Z0-9-:\\.]+jobs\\(:<job>\d+)\\(:<launch>\d+)\\logs\\progress\-statistics\.log$/
  jobRe = /[a-zA-Z0-9-:\\.]+jobs\\(:<job>\d+)/
} else {
  jobLaunchRe = /[a-zA-Z0-9-/.]+jobs\/(:<job>\d+)\/(:<launch>\d+)\/logs\/progress\-statistics\.log$/
  jobRe = /[a-zA-Z0-9-/.]+jobs\/(:<job>\d+)/
}

function sortJobs (j1, j2) {
  if (j1.timestampm.isBefore(j2.timestampm)) {
    return 1
  }

  if (j1.timestampm.isAfter(j2.timestampm)) {
    return -1
  }

  return 0
}

function checkCache (newJobs) {
  /*
   Due to the job progress monitoring frequency and updates for react
   It is necessary to check for the existence of an actual change
   if there is one we will update otherwise just forget it
   */
  let actualUpdate = false
  let len = newJobs.length
  let positions = new Map()
  for (let i = 0; i < len; ++i) {
    let maybeNewJob = newJobs[ i ]

    if (!jobCache.index.has(maybeNewJob.jobId)) {
      console.log('checkCache we did not have a jobId', maybeNewJob.jobId)
      actualUpdate = true
      positions.set(maybeNewJob.jobId, i)
      continue
    } else {
      positions.set(maybeNewJob.jobId, i)
    }
    let idx = jobCache.index.get(maybeNewJob.jobId)
    let oldJob = jobCache.cache[ idx ]
    if (oldJob.launch !== maybeNewJob.launch) {
      actualUpdate = true
      continue
    }

    if (oldJob.runs.length !== maybeNewJob.runs.length) {
      actualUpdate = true
      continue
    }

    if (oldJob.runs.length > 0) {
      let ojr = oldJob.runs[ 0 ]
      let mnjr = maybeNewJob.runs[ 0 ]

      if (ojr.discovered !== mnjr.discovered) {
        actualUpdate = true
        continue

      }

      if (ojr.downloaded !== mnjr.downloaded) {
        actualUpdate = true
        continue
      }

      if (ojr.ended !== mnjr.ended) {
        actualUpdate = true
        continue
      }

      if (ojr.queued !== mnjr.queued) {
        actualUpdate = true
        continue
      }

      if (!ojr.timestampm.isSame(mnjr.timestampm)) {
        actualUpdate = true
      }
    }
  }

  if (actualUpdate) {
    jobCache.index = null
    jobCache.cache = null
    jobCache.index = positions
    jobCache.cache = newJobs
    return true
  } else {
    console.log("There is no update", jobCache.index, positions)
    return false
  }
}

function getHeritrixJobsState () {
  return new Promise((resolve, reject) => {
    let jobLaunch = named.named(jobLaunchRe)
    let job = named.named(jobRe)

    let jobs = {}
    let counter = 0
    let jobsConfs = {}

    let heritrixJobP = settings.get('heritrixJob')

    let onlyJobLaunchsProgress = through2.obj(function (item, enc, next) {
      let through = this
      let didMath = jobLaunch.exec(item.path)
      if (didMath) {
        jobs[ didMath.capture('job') ].log = true
        jobs[ didMath.capture('job') ].launch = didMath.capture('launch')
        jobs[ didMath.capture('job') ].logPath = item.path
        through.push(jobs[ didMath.capture('job') ])
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
      let through = this
      fs.readFile(item.logPath, "utf8", (err, data)=> {
        if (err) {
          logger.error(util.format(logStringError,`launchStats ${item.logPath}`,err.stack))
          through.push(item)
        }
        // console.log(data)
        let lines = data.trim().split('\n')
        let lastLine = S(lines[ lines.length - 1 ])

        if (jobEndStatus.test(lastLine.s)) {
          // jobs[item.jobId].progress.ended = true
          let nextToLast = S(lines[ lines.length - 2 ])
          let nextLastfields = nextToLast.collapseWhitespace().s.split(' ')
          let tsm = moment(nextLastfields[ 0 ])
          jobs[ item.jobId ].runs.push({
            ended: true,
            timestampm: tsm,
            timestamp: tsm.format(),
            discovered: nextLastfields[ 1 ],
            queued: nextLastfields[ 2 ],
            downloaded: nextLastfields[ 3 ],
          })

        } else {
          // TODO: check if last line is empty
          let fields = lastLine.collapseWhitespace().s.split(' ')
          let tsm = moment(fields[ 0 ])
          jobs[ item.jobId ].runs.push({
            ended: false,
            timestampm: tsm,
            timestamp: tsm.format(),
            discovered: fields[ 1 ],
            queued: fields[ 2 ],
            downloaded: fields[ 3 ],
          })

        }
      })
      through.push(item)
      next()
    })

    //return { confs: jobsConfs, obs: sortedJobs, }
    fs.ensureDir(heritrixJobP, err => {
      if (err) {
        logger.error(util.format(logStringError,"ensure dir heritrixJobP",err.stack))
        reject(err)
      } else {
        fs.walk(heritrixJobP)
          .on('error', (err) => onlyJobLaunchsProgress.emit('error', err)) // forward the error on
          .pipe(onlyJobLaunchsProgress)
          .on('error', (err) => launchStats.emit('error', err)) // forward the error on
          .pipe(launchStats)
          .on('data', item => {
          })
          .on('end', function () {
            if (counter > 0) {
              let sortedJobs = _.chain(jobs)
                .toPairs()
                .map(job => {
                  job[ 1 ].runs.sort(sortJobs)
                  if (job[ 1 ].runs.length > 1) {
                    job[ 1 ].runs = job[ 1 ].runs.slice(0, 1)
                  }
                  return job[ 1 ]
                })
                .value()
              if (jobCache.cache) {
                if (checkCache(sortedJobs)) {
                  resolve({ change: true, count: counter, confs: jobsConfs, jobs: sortedJobs, })
                } else {
                  resolve({ change: false })
                }

              } else {
                console.log('Job cache is null')
                logger.info(util.format(logString,"the job cache is null. Setting it"))
                jobCache.cache = sortedJobs
                let len = sortedJobs.length
                for (var i = 0; i < len; ++i) {
                  jobCache.index.set(sortedJobs[ i ].jobId, i)
                }
                resolve({ change: false, begin: 'We set ourselves at the first time and so does UI' })
              }

            } else {
              resolve({ change: false, error: "count zero", count: 0, stack: 'ere' })
            }
          })
          .on('error', function (error, item) {
            console.log(error.message)
            console.log(item.path) // the file the error occurred on
            logger.error(util.format(logStringError,`getHeritrixJobsState ${item.path}`,error.stack))
            reject(error)
          })
      }
    })

  })

}

class JobMonitor {
  constructor () {
    this.job = null
    this.started = false
  }
  
  @autobind
  checkJobStatuses (cb) {
    if (!this.started) {
      let rule = new schedule.RecurrenceRule()
      rule.second = [ 0, 20, 40 ]

      this.job = schedule.scheduleJob(rule, ()=> {
        console.log("Checking job stats")
        jobLock.writeLock(release => {
          getHeritrixJobsState()
            .then(status => {
              console.log("Done Checking job stats")
              release()
              cb(status)
            })
            .catch(error => {
              console.log("Done Checking job stats with error")
              logger.error(util.format(logStringError,"checkJobStatuses",error.stack))
              release()
              cb({ change: false })
            })
        })

      })
      this.started = true
    }
  }
}

let jobMonitor = new JobMonitor()

ipcRenderer.on("start-crawljob-monitoring", (event) => {
  console.log('Monitor get start crawljob monitoring')
  logger.info(util.format(logString,"got start crawljob monitoring"))
  ipcRenderer.send('got-it',{ from: 'jobs' ,yes: true})
  jobMonitor.checkJobStatuses(statues => {
    if (statues.change) {
      ipcRenderer.send("crawljob-status-update", statues)
    }
  })
})

ipcRenderer.on("stop", (event) => {
  console.log('Monitor get start indexing monitoring')
  logger.info(util.format(logString,"got stop crawljob monitoring"))
  logger.cleanUp()
  jobMonitor.job.cancel()
  jobMonitor.job = null
  jobMonitor = null
})