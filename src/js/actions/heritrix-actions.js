import 'babel-polyfill'
import wc from "../constants/wail-constants"
import child_process from "child_process"
import rp from "request-promise"
import cheerio from "cheerio"
import fs from "fs-extra"
import ServiceDispatcher from "../dispatchers/service-dispatcher"
import CrawlDispatcher from "../dispatchers/crawl-dispatcher"
import EditorDispatcher from "../dispatchers/editorDispatcher"
import named from 'named-regexp'
import through2 from 'through2'
import S from 'string'
import moment from 'moment'


process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
const EventTypes = wc.EventTypes
const heritrix = wc.Heritrix
const paths = wc.Paths

export function heritrixAccesible() {
   console.log("checking heritrix accessibility")
   // ServiceDispatcher.dispatch({
   //    type: EventTypes.HERITRIX_STATUS_UPDATE,
   //    status: true,
   // })
   rp(wc.Heritrix.uri_heritrix)
      .then(success => {
         console.log("heritrix success", success)
         ServiceDispatcher.dispatch({
            type: EventTypes.HERITRIX_STATUS_UPDATE,
            status: true,
         })
      })
      .catch(err => {
         console.log("heritrix err", err)
         ServiceDispatcher.dispatch({
            type: EventTypes.HERITRIX_STATUS_UPDATE,
            status: false,
         })
      }).finally(() => console.log("heritrix finally"))
}

function* sequentialActions(actions, jobId) {
   let index = 0
   let options = {
      method: 'POST',
      uri: `https://localhost:8443/engine/job/${jobId}`,
      headers: {
         Accept: "application/xml",
         'Content-type': 'application/x-www-form-urlencoded',
      },
      form: {
         action: ''
      },
      auth: {
         username: 'lorem',
         password: 'ipsum',
         sendImmediately: false
      },
      rejectUnauthorized: false,
      resolveWithFullResponse: true,
   }

   while (index < actions.length) {
      options.form.action = actions[index++]
      yield options
   }

}

export function launchHeritrix() {
   console.log(`sh ${ wc.Paths.heritrixBin} -a lorem:ipsum`)
   child_process.exec(`${wc.Paths.heritrixBin}  -a lorem:ipsum`, (err, stdout, stderr) => {
      console.log(err, stdout, stderr)
      let wasError = !err

      ServiceDispatcher.dispatch({
         type: EventTypes.HERITRIX_STATUS_UPDATE,
         status: wasError,
      })
   })
}

export function killHeritrix() {
   // child_process.exec("ps ax | grep \'heritrix\' | grep -v grep | awk \'{print \"kill -9 \" $1}\' | sh", (err, stdout, stderr) => {
   //    console.log(err, stdout, stderr)
   // })
   let options = {
      method: 'POST',
      uri: `https://localhost:8443/engine/`,
      form: {
         action: "Exit Java Process",
         im_sure: "on"
      },
      auth: {
         'username': 'lorem',
         'password': 'ipsum',
         'sendImmediately': false
      },
      rejectUnauthorized: false,
      resolveWithFullResponse: true,
   }

   rp(options)
      .then(response => {
         console.log("this should never ever be reached", response)
      })
      .catch(err => {

         console.log("herritrix kills itself and never replies", err)
         // POST failed...

      })
}

export function makeHeritrixJobConf(urls, hops, jobId) {
   console.log('in makeHeritrixJobConf')
   fs.readFileAsync(wc.Heritrix.jobConf, "utf8")
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
            urlText = `\r\n${urls.join("\r\n")}\r\n`
         } else {
            urlText = `\r\n${urls}\r\n`
         }
         urlConf.text(urlText)

         // <property name="maxHops" value="''' + str(depth) + '''" />
         let maxHops = doc('bean[class="org.archive.modules.deciderules.TooManyHopsDecideRule"]').find('property[name="maxHops"]')
         maxHops.attr('value', `${hops}`)
         // console.log(doc('bean[class="org.archive.modules.deciderules.TooManyHopsDecideRule"]').html())
         let warFolder = doc('bean[id="warcWriter"]').find('property[name="storePaths"]').find('list')
         warFolder.append(`<value>${wc.Paths.warcs}</value>`)
         let confPath = `${wc.Paths.heritrixJob}/${jobId}`
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
   console.log('building heritrix job')
   //`https://lorem:ipsum@localhost:8443/engine/job/${jobId}`
   let options = {
      method: 'POST',
      uri: `https://localhost:8443/engine/job/${jobId}`,
      headers: {
         Accept: "application/xml",
         'Content-type': 'application/x-www-form-urlencoded',
      },
      form: {
         action: "build"
      },
      'auth': {
         'username': 'lorem',
         'password': 'ipsum',
         'sendImmediately': false
      },
      rejectUnauthorized: false,
      resolveWithFullResponse: true,
   }

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

export function launchHeritrixJob(jobId) {

   let options = {
      method: 'POST',
      uri: `https://localhost:8443/engine/job/${jobId}`,
      headers: {
         Accept: "application/xml",
         /* 'Content-type': 'application/x-www-form-urlencoded' */ // Set automatically
      },
      form: {
         action: "launch"
      },
      auth: {
         'username': 'lorem',
         'password': 'ipsum',
         'sendImmediately': false
      },
      rejectUnauthorized: false,
      resolveWithFullResponse: true,
   }

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

}

export function restartHeritrixJob(jobId) {

}

export function forceCrawlFinish(jobId) {
   sendActionToHeritrix(sequentialActions(["terminate", "teardown"], jobId))
}

export function restartJob(jobId) {
   buildHeritrixJob(jobId)
}

export function deleteHeritrixJob(jobId) {

}

export function sendActionToHeritrix(act, jobId) {

   let options

   let isActionGenerator = act instanceof sequentialActions
   let notDone = false

   if (isActionGenerator) {
      let nextAction = act.next()
      console.log('We have a actionGenerator', nextAction)
      notDone = !nextAction.done
      if (nextAction.done)
         return
      options = nextAction.value
      console.log(options)
   } else {
      options = {
         method: 'POST',
         uri: `https://localhost:8443/engine/job/${jobId}`,
         headers: {
            Accept: "application/xml",
            'Content-type': 'application/x-www-form-urlencoded',
         },
         form: {
            action: act
         },
         auth: {
            username: 'lorem',
            password: 'ipsum',
            sendImmediately: false
         },
         rejectUnauthorized: false,
         resolveWithFullResponse: true,
      }
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

export function getHeritrixJobsState() {
   const jobLaunch = named.named(/[a-zA-Z0-9-/.]+jobs\/(:<job>\d+)\/(:<launch>\d+)\/logs\/progress\-statistics\.log$/)
   const job = named.named(/[a-zA-Z0-9-/.]+jobs\/(:<job>\d+)/)

   let jobs = {}
   let count = 0
   let jobsConfs = {}
   let onlyJobLaunchsProgress = through2.obj(function (item, enc, next) {
      let didMath = jobLaunch.exec(item.path)
      if (didMath) {
         jobs[didMath.capture('job')].log = true
         jobs[didMath.capture('job')].launch = didMath.capture('launch')
         jobs[didMath.capture('job')].path = item.path
         this.push(jobs[didMath.capture('job')])
      } else {
         if (item.stats.isDirectory()) {
            let jid = job.exec(item.path)

            if (jid) {
               count += 1
               jobsConfs[jid.capture('job')] = 
                  fs.readFileSync(`${wc.Paths.heritrixJob}/${jid.capture('job')}/crawler-beans.cxml`, "utf8")
               jobs[jid.capture('job')] = {
                  log: false,
                  jobId: jid.capture('job'),
                  launch: '',
                  path: '',
                  progress: [],
               }
            }
         }
      }

      next()
   })


   let launchStats = through2.obj(function (item, enc, next) {
      fs.readFile(item.path, "utf8", (err, data)=> {
         if (err) throw err
         // console.log(data)
         let lines = data.trim().split('\n')
         let lastLine = S(lines[lines.length - 1])

         if (lastLine.contains('Ended by operator')) {
            // jobs[item.jobId].progress.ended = true
            let nextToLast = S(lines[lines.length - 2])
            let nextLastfields = nextToLast.collapseWhitespace().s.split(' ')
            jobs[item.jobId].progress.push({
               ended: true,
               endedOn: moment(lastLine.collapseWhitespace().s),
               timestamp: moment(nextLastfields[0]),
               discovered: nextLastfields[1],
               queued: nextLastfields[2],
               downloaded: nextLastfields[3],
            })

         } else {
            let fields = lastLine.collapseWhitespace().s.split(' ')
            jobs[item.jobId].progress.push({
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


   fs.walk(wc.Paths.heritrixJob)
      .pipe(onlyJobLaunchsProgress)
      .pipe(launchStats)
      .on('data', item => {
         return
      })
      .on('end', function () {
         if (count > 0) {

            EditorDispatcher.dispatch({
               type: EventTypes.STORE_HERITRIX_JOB_CONFS,
               confs: jobsConfs
            })
            CrawlDispatcher.dispatch({
               type: EventTypes.HERITRIX_CRAWL_ALL_STATUS,
               jobReport: jobs,
            })
         }

      })
      .on('error', function (err, item) {
         console.log(err.message)
         console.log(item.path) // the file the error occurred on
      })
}
