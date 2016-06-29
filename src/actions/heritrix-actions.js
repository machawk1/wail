import 'babel-polyfill'
import child_process from "child_process"
import rp from "request-promise"
import cheerio from "cheerio"
import fs from "fs-extra"
import named from 'named-regexp'
import through2 from 'through2'
import S from 'string'
import moment from 'moment'
import _ from 'lodash'
import Promise from 'bluebird'
import os from 'os'
import wc from "../constants/wail-constants"
import ServiceStore from '../stores/serviceStore'
import ServiceDispatcher from "../dispatchers/service-dispatcher"
import CrawlDispatcher from "../dispatchers/crawl-dispatcher"
import settings from '../settings/settings'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
const EventTypes = wc.EventTypes


export function heritrixAccesible() {
   console.log("checking heritrix accessibility")
   let optionEngine = settings.get('heritrix.optionEngine')

   rp(optionEngine)
      .then(success => {
         console.log("heritrix success", success)
         ServiceDispatcher.dispatch({
            type: EventTypes.HERITRIX_STATUS_UPDATE,
            status: true,
         })
      })
      .catch(err => {
         ServiceDispatcher.dispatch({
            type: EventTypes.HERITRIX_STATUS_UPDATE,
            status: false,
         })
      }).finally(() => console.log("heritrix finally"))

}

function* sequentialActions(actions, jobId) {
   let index = 0
   let options = settings.get('heritrix.sendActionOptions')
   options.uri = `${options.uri}${jobId}`
   while (index < actions.length) {
      options.form.action = actions[index++]
      yield options
   }
}

export function launchHeritrix(cb) {
   if(process.platform === 'win32'){
      let heritrixPath = settings.get('heritrix.path')
      console.log(heritrixPath)
      let opts = {
         cwd: heritrixPath,
         env: {
            JAVA_HOME: settings.get('jdk'),
            JRE_HOME: settings.get('jre'),
            HERITRIX_HOME: heritrixPath,
         },
         detached: true,
         shell: false,
         stdio: ['ignore', 'ignore', 'ignore']
      }
      let usrpwrd = `${settings.get("heritrix.username")}:${settings.get("heritrix.password")}`
      let heritrix = child_process.spawn("bin\\heritrix.cmd", ['-a',`${usrpwrd}`], opts)
      heritrix.unref()
      if (cb) {
         cb()
      }
   } else {
      child_process.exec(settings.get('heritrixStart'), (err, stdout, stderr) => {
         console.log(err, stdout, stderr)
         let wasError = !err
         if (cb) {
            cb()
         }
         ServiceDispatcher.dispatch({
            type: EventTypes.HERITRIX_STATUS_UPDATE,
            status: wasError,
         })
      })
   }

}

export function killHeritrix() {
   let options = settings.get('heritrix.killOptions')
   rp(options)
      .then(response => {
         console.log("this should never ever be reached", response)
      })
      .catch(err => {
         console.log("herritrix kills itself and never replies", err)
      })
}

export function makeHeritrixJobConf(urls, hops, jobId) {
   console.log('in makeHeritrixJobConf')
   fs.readFileAsync(settings.get('heritrix.jobConf'), "utf8")
      .then(data => {
         let doc = cheerio.load(data, {
            xmlMode: true
         })
         let jobId = new Date().getTime()
         // console.log(doc.xml())
         let urlConf = doc('bean[id="longerOverrides"]').find('prop[key="seeds.textSource.value"]')
         let urlText
         if (Array.isArray(urls)) {
            console.log('array')
            urlText = `${os.EOL}${urls.join(os.EOL)}${os.EOL}`
         } else {
            urlText = `${os.EOL}${urls}${os.EOL}`
         }
         urlConf.text(urlText)

         // <property name="maxHops" value="''' + str(depth) + '''" />
         let maxHops = doc('bean[class="org.archive.modules.deciderules.TooManyHopsDecideRule"]').find('property[name="maxHops"]')
         maxHops.attr('value', `${hops}`)
         // console.log(doc('bean[class="org.archive.modules.deciderules.TooManyHopsDecideRule"]').html())
         let warFolder = doc('bean[id="warcWriter"]').find('property[name="storePaths"]').find('list')
         // warFolder.append(`<value>${wc.Paths.warcs}</value>`)
         warFolder.append(`<value>${settings.get('warcs')}</value>`)
         // let confPath = `${wc.Paths.heritrixJob}/${jobId}`
         let confPath = `${settings.get('heritrixJob')}/${jobId}`
         fs.ensureDir(confPath, er => {
            fs.writeFile(`${confPath}/crawler-beans.cxml`, doc.xml(), 'utf8', error => {
               console.log("done writting file", error)
               CrawlDispatcher.dispatch({
                  type: EventTypes.BUILT_CRAWL_CONF,
                  id: jobId,
                  path: confPath,
                  urls: urls,
               })
            })

         })

      })
}

export function buildHeritrixJob(jobId) {
   let data = {action: "launch"}
   //`https://lorem:ipsum@localhost:8443/engine/job/${jobId}`
   let options = settings.get('heritrix.buildOptions')
   options.uri = `${options.uri}${jobId}`
   console.log('building heritrix job')
   if (!ServiceStore.heritrixStatus()) {
      launchHeritrix(() => {
         rp(options)
            .then(response => {
               // POST succeeded...
               console.log("sucess in building job", response)
               CrawlDispatcher.dispatch({
                  type: EventTypes.BUILT_CRAWL_JOB,
                  id: jobId,
               })
            })
            .catch(err => {
               if (err.statusCode == 303) {
                  console.log("303 sucess in building job", err)
                  CrawlDispatcher.dispatch({
                     type: EventTypes.BUILT_CRAWL_JOB,
                     id: jobId,
                  })
               } else {
                  // POST failed...
                  console.log("failur in building job", err)
               }
            })
      })
   } else {
      rp(options)
         .then(response => {
            // POST succeeded...
            console.log("sucess in building job", response)
            CrawlDispatcher.dispatch({
               type: EventTypes.BUILT_CRAWL_JOB,
               id: jobId,
            })
         })
         .catch(err => {
            if (err.statusCode == 303) {
               console.log("303 sucess in building job", err)
               CrawlDispatcher.dispatch({
                  type: EventTypes.BUILT_CRAWL_JOB,
                  id: jobId,
               })
            } else {
               // POST failed...
               console.log("failur in building job", err)
            }
         })
   }
}

export function launchHeritrixJob(jobId) {

   let options = settings.get('heritrix.launchJobOptions')
   options.uri = `${options.uri}${jobId}`
   if (!ServiceStore.heritrixStatus()) {
      launchHeritrix(() => {
         rp(options)
            .then(response => {
               // POST succeeded...
               console.log("sucess in launching job", response)
               CrawlDispatcher.dispatch({
                  type: EventTypes.LAUNCHED_CRAWL_JOB,
                  id: jobId,
               })
            })
            .catch(err => {

               if (err.statusCode == 303) {
                  console.log("303 sucess in launch job", err)
                  CrawlDispatcher.dispatch({
                     type: EventTypes.LAUNCHED_CRAWL_JOB,
                     id: jobId,
                  })
               } else {
                  // POST failed...
                  console.log("failur in launching job", err)
               }
               // POST failed...

            })
      })
   } else {
      rp(options)
         .then(response => {
            // POST succeeded...
            console.log("sucess in launching job", response)
            CrawlDispatcher.dispatch({
               type: EventTypes.LAUNCHED_CRAWL_JOB,
               id: jobId,
            })
         })
         .catch(err => {

            if (err.statusCode == 303) {
               console.log("303 sucess in launch job", err)
               CrawlDispatcher.dispatch({
                  type: EventTypes.LAUNCHED_CRAWL_JOB,
                  id: jobId,
               })
            } else {
               // POST failed...
               console.log("failur in launching job", err)
            }
         })
   }
}


export function forceCrawlFinish(jobId, cb) {
   sendActionToHeritrix(sequentialActions(["terminate", "teardown"], jobId), jobId, cb)
}

export function restartJob(jobId) {
   buildHeritrixJob(jobId)
}


export function deleteHeritrixJob(jobId, cb) {
   forceCrawlFinish(jobId, cb)
}

export function sendActionToHeritrix(act, jobId, cb) {
   if(!ServiceStore.heritrixStatus()){
      if(cb){
         cb()
      }
      return
   }
      
   let options

   let isActionGenerator = act instanceof sequentialActions
   let notDone = false

   if (isActionGenerator) {
      let nextAction = act.next()
      console.log('We have a actionGenerator', nextAction)
      notDone = !nextAction.done
      if (nextAction.done) {
         if (cb) {
            cb()
         }
         return
      }

      options = nextAction.value
      console.log(options)
   } else {
      options = settings.get('heritrix.sendActionOptions')
      options.uri = `${options.uri}${jobId}`
      options.form.action = act
   }

   rp(options)
      .then(response => {
         // POST succeeded...
         console.log(`post succeeded in sendAction ${act} to heritrix`, response)
         if (isActionGenerator && notDone) {
            console.log("we have next in action generator")
            sendActionToHeritrix(act, jobId)
         }
      })
      .catch(err => {
         console.log(`post failed? in sendAction ${act} to heritrix`, err)
         if (isActionGenerator && notDone) {
            console.log("we have next in action generator", `is done? ${notDone}`)
            sendActionToHeritrix(act, jobId)
         }

      })

}

function sortJobs(j1, j2) {
   if(j1.timestamp.isBefore(j2.timestamp)){
      return 1
   }

   if(j1.timestamp.isAfter(j2.timestamp)){
      return -1
   }

   return 0
}

export function getHeritrixJobsState() {
   return new Promise((resolve, reject) => {
      const jobLaunch = named.named(/[a-zA-Z0-9-/.]+jobs\/(:<job>\d+)\/(:<launch>\d+)\/logs\/progress\-statistics\.log$/)
      const job = named.named(/[a-zA-Z0-9-/.]+jobs\/(:<job>\d+)/)

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
                           job[1].runs.sort(sortJobs)
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
