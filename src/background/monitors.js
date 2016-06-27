import schedule from 'node-schedule'
import rp from 'request-promise'
import named from 'named-regexp'
import through2 from 'through2'
import S from 'string'
import moment from 'moment'
import _ from 'lodash'
import Promise from 'bluebird'
import fs from 'fs-extra'
import settings from '../settings/settings'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

function heritrixAccesible() {
   console.log("checking heritrix accessibility")
   let optionEngine =  settings.get('heritrix.optionEngine')
   return new Promise((resolve, reject)=> {
      rp(optionEngine)
         .then(success => {
            resolve({status: true})
         })
         .catch(err => {
            resolve({status: false, error: err})
         })
   })
}

function getHeritrixJobsState() {
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
            jobs[didMath.capture('job')].log = true
            jobs[didMath.capture('job')].launch = didMath.capture('launch')
            jobs[didMath.capture('job')].logPath = item.path
            this.push(jobs[didMath.capture('job')])
         } else {
            if (item.stats.isDirectory()) {
               let jid = job.exec(item.path)

               if (jid) {
                  counter += 1
                  jobsConfs[jid.capture('job')] =
                     fs.readFileSync(`${heritrixJobP}/${jid.capture('job')}/crawler-beans.cxml`, "utf8")
                  jobs[jid.capture('job')] = {
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
            let lastLine = S(lines[lines.length - 1])

            if (lastLine.contains('Ended by operator')) {
               // jobs[item.jobId].progress.ended = true
               let nextToLast = S(lines[lines.length - 2])
               let nextLastfields = nextToLast.collapseWhitespace().s.split(' ')
               jobs[item.jobId].runs.push({
                  ended: true,
                  timestamp: moment(nextLastfields[0]),
                  discovered: nextLastfields[1],
                  queued: nextLastfields[2],
                  downloaded: nextLastfields[3],
               })

            } else {
               let fields = lastLine.collapseWhitespace().s.split(' ')
               jobs[item.jobId].runs.push({
                  ended: false,
                  timestamp: moment(fields[0]),
                  discovered: fields[1],
                  queued: fields[2],
                  downloaded: fields[3],
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
                           job[1].runs.sort((j1, j2) => j1.timestamp.isAfter(j2.timestamp))
                           return job[1]
                        })
                        .value()
                     resolve({count: counter, confs: jobsConfs, jobs: sortedJobs,})
                  } else {
                     resolve({error: "count zero", count: 0, stack: 'ere'})
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

function waybackAccesible() {
   console.log("checking wayback accessibility")
   let wburi = settings.get('wayback.uri_wayback')
   return new Promise((resolve, reject)=> {
      rp({uri: wburi})
         .then(success => {
            resolve({status: true})
         })
         .catch(err => {
            resolve({status: false, error: err})
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
class monitors {
   constructor() {
      this.schedules = []
      this.started = {
         jobs: false,
         reachability: false,
         test: false,
      }

      this.statues = {
         heritrix: false,
         wayback: false
      }

      this.checkJobStatuses = this.checkJobStatuses.bind(this)
      this.checkReachability = this.checkReachability.bind(this)
      this.simpleTest = this.simpleTest.bind(this)
      this.cancelAll = this.cancelAll.bind(this)
   }

   cancelAll() {
      this.schedules.forEach(s => s.cancel())
   }

   checkReachability(cb) {
      if (!this.started.reachability) {
         //every two minutes
         this.schedules.push(schedule.scheduleJob('*/5 * * * *', () => {

            heritrixAccesible(false)
               .then(ha => this.statues.heritrix = ha.status)
               .catch(hdown => this.statues.heritrix = hdown.status)
               .finally(() =>
                  waybackAccesible(false)
                     .then(wba => this.statues.wayback = wba.status)
                     .catch(wbdown => this.statues.wayback = wbdown.status)
                     .finally(() => {
                        cb(this.statues)
                        console.log("Done with status checks ", this.statues)
                     })
               )
         }))
         this.started.reachability = true
      }
   }

   checkJobStatuses(cb) {
      if (!this.started.jobs) {
         //every two minutes
         this.schedules.push(schedule.scheduleJob('*/1 * * * *', () => {
            getHeritrixJobsState()
               .then(status => {
                  cb(status)
               })
               .catch(error => {
                  cb(error)
               })
         }))
         this.started.jobs = true
      }
   }

   simpleTest(cb) {
      console.log("simple test")
      if (!this.started.test) {
         //every two minutes
         this.schedules.push(schedule.scheduleJob('*/2    *    *    *    *    *', () => {
            console.log("firing simple test")
            cb(`From the background ${Date.now()}`)
         }))
         this.started.test = true
      }
   }
}

const Monitors = new monitors
export default Monitors

