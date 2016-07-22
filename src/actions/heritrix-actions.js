import childProcess from 'child_process'
import cheerio from 'cheerio'
import fs from 'fs-extra'
import path from 'path'
import named from 'named-regexp'
import through2 from 'through2'
import S from 'string'
import moment from 'moment'
import _ from 'lodash'
import Promise from 'bluebird'
import os from 'os'
import { remote } from 'electron'
import util from 'util'
import wc from '../constants/wail-constants'
import ServiceStore from '../stores/serviceStore'
import ServiceDispatcher from '../dispatchers/service-dispatcher'
import RequestDispatcher from '../dispatchers/requestDispatcher'
import CrawlDispatcher from '../dispatchers/crawl-dispatcher'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const isWindows = os.platform() === 'win32'
const EventTypes = wc.EventTypes
const RequestTypes = wc.RequestTypes

const settings = remote.getGlobal('settings')
const logger = remote.getGlobal('logger')
const logString = 'heritirx-actions %s'
const logStringError = 'heritirx-actions error where[ %s ] stack [ %s ]'

const jobEndStatus = /[a-zA-Z0-9\-:]+\s(?:CRAWL\sEND(?:(?:ING)|(?:ED)).+)/

let jobLaunchRe
let jobRe

if (isWindows) {
  jobLaunchRe = /[a-zA-Z0-9-:\\.]+jobs\\(:<job>\d+)\\(:<launch>\d+)\\logs\\progress\-statistics\.log$/
  jobRe = /[a-zA-Z0-9-:\\.]+jobs\\(:<job>\d+)/
} else {
  jobLaunchRe = /[a-zA-Z0-9-/.]+jobs\/(:<job>\d+)\/(:<launch>\d+)\/logs\/progress\-statistics\.log$/
  jobRe = /[a-zA-Z0-9-/.]+jobs\/(:<job>\d+)/
}

export function heritrixAccesible (startOnDown = false) {
  console.log('checking heritrix accessibility')
  let optionEngine = _.cloneDeep(settings.get('heritrix.optionEngine'))

  RequestDispatcher.dispatch({
    type: EventTypes.REQUEST_HERITRIX,
    rType: RequestTypes.ACCESSIBILITY,
    opts: optionEngine,
    from: `heritrixAccesible[${startOnDown}]`,
    timeReceived: null,
    startOnDown,
    success: function (response) {
      console.log('heritrix success')
      ServiceDispatcher.dispatch({
        type: EventTypes.HERITRIX_STATUS_UPDATE,
        status: true
      })
    },
    error: function (err) {
      ServiceDispatcher.dispatch({
        type: EventTypes.HERITRIX_STATUS_UPDATE,
        status: false,
        error: err.message,
      })
      if (startOnDown) {
        launchHeritrix()
      }
    }
  })
}

function * sequentialActions (actions, jobId) {
  let index = 0
  let options = _.cloneDeep(settings.get('heritrix.sendActionOptions'))
  options.uri = `${options.uri}${jobId}`
  while (index < actions.length) {
    options.form.action = actions[ index++ ]
    yield options
  }
}

export function launchHeritrix (cb) {
  let wasError = false
  if (process.platform === 'win32') {
    let heritrixPath = settings.get('heritrix.path')
    logger.info(util.format(logString, 'win32 launching heritrix'))
    let opts = {
      cwd: heritrixPath,
      env: {
        JAVA_HOME: settings.get('jdk'),
        JRE_HOME: settings.get('jre'),
        HERITRIX_HOME: heritrixPath,
      },
      detached: true,
      shell: false,
      stdio: [ 'ignore', 'ignore', 'ignore' ]
    }
    let usrpwrd = `${settings.get('heritrix.username')}:${settings.get('heritrix.password')}`
    try {
      let heritrix = childProcess.spawn('bin\\heritrix.cmd', [ '-a', `${usrpwrd}` ], opts)
      heritrix.unref()
    } catch (err) {
      wasError = true
      logger.error(util.format(logStringError, 'win32 launch', err.stack))
    }
    ServiceDispatcher.dispatch({
      type: EventTypes.HERITRIX_STATUS_UPDATE,
      status: !wasError,
    })

    if (!wasError) {
      if (cb) {
        cb()
      }
    }
  } else {
    var hStart
    if (os.platform() === 'darwin') {
      hStart = settings.get('heritrixStartDarwin')
    } else {
      hStart = settings.get('heritrixStart')
    }
    childProcess.exec(hStart, (err, stdout, stderr) => {
      console.log(hStart)
      console.log(err, stdout, stderr)
      if (err) {
        let stack
        wasError = true
        if (Reflect.has(err, 'stack')) {
          stack = `${stderr} ${err.stack}`
        } else {
          stack = `${stderr}`
        }
        logger.error(util.format(logStringError, `linux/osx launch ${stdout}`, stack))
      }

      ServiceDispatcher.dispatch({
        type: EventTypes.HERITRIX_STATUS_UPDATE,
        status: !wasError,
      })

      if (!wasError) {
        if (cb) {
          cb()
        }
      }
    })
  }
}

export function killHeritrix (cb) {
  let options = _.cloneDeep(settings.get('heritrix.killOptions'))
  // options.agent = httpsAgent

  RequestDispatcher.dispatch({
    type: EventTypes.REQUEST_HERITRIX,
    rType: RequestTypes.KILL_HERITRIX,
    opts: options,
    from: 'killHeritrix',
    timeReceived: null,
    success: function (response) {
      console.log('this should never ever be reached', response)
      if (cb) {
        cb()
      }
    },
    error: function (err) {
      console.log('herritrix kills itself and never replies', err)
      if (cb) {
        cb()
      }
    }
  })
}

export function addJobDirectoryHeritrix (confPath) {
  let options = _.cloneDeep(settings.get('heritrix.addJobDirectoryOptions'))
  options.form.addPath = confPath
  RequestDispatcher.dispatch({
    type: EventTypes.REQUEST_HERITRIX,
    rType: RequestTypes.ADD_HERITRIX_JOB_DIRECTORY,
    opts: options,
    from: `addJobToHeritrix[${confPath}]`,
    timeReceived: null,
    success: function (response) {
      console.log('success in addJobDirectoryHeritrix', response)
      logger.info(util.format(logString, `'303 success in addJobDirectoryHeritrix ${confPath}`))
    },
    error: function (err) {
      if (err.statusCode === 303) {
        console.log('303 success in addJobDirectoryHeritrix', err)
        logger.info(util.format(logString, `'303 success in addJobDirectoryHeritrix ${confPath}`))
      } else {
        // POST failed...
        console.log('addJobDirectoryHeritrix failed', err)
        logger.error(util.format(logStringError, `addJobDirectoryHeritrix failed ${err.message}`, err.statusCode))
      }
    }
  })
}

export function makeHeritrixJobConf (urls, hops = 1, jobId) {
  console.log('in makeHeritrixJobConf')
  fs.readFileAsync(settings.get('heritrix.jobConf'), 'utf8')
    .then(data => {
      let doc = cheerio.load(data, {
        xmlMode: true
      })
      if (!jobId) {
        jobId = new Date().getTime()
      }
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
      warFolder.append(`<value>${settings.get('warcs')}</value>${os.EOL}`)
      // let confPath = `${wc.Paths.heritrixJob}/${jobId}`
      let confPath = path.join(settings.get('heritrixJob'), `${jobId}`)
      fs.ensureDir(confPath, er => {
        if (er) {
          logger.error(util.format(logStringError, `makeHeritrixJobConf ensureDir ${er.message}`, er.stack))
        }
        fs.writeFile(path.join(confPath, 'crawler-beans.cxml'), doc.xml(), 'utf8', error => {
          if (error) {
            logger.error(util.format(logStringError, `makeHeritrixJobConf writeConf ${error.message}`, error.stack))
            console.log('done writting file with error', error)
          } else {
            console.log('done writting file')
            addJobDirectoryHeritrix(confPath)
            CrawlDispatcher.dispatch({
              type: EventTypes.BUILT_CRAWL_CONF,
              id: jobId,
              path: confPath,
              urls: urls
            })
          }
        })
      })
    })
    .catch(error => {
      logger.error(util.format(logStringError, `makeHeritrixJobConf readConf ${error.message}`, error.stack))
    })
}

export function rescanJobDir () {
  RequestDispatcher.dispatch({
    type: EventTypes.REQUEST_HERITRIX,
    rType: RequestTypes.RESCAN_JOB_DIR,
    from: 'rescanJobDir',
    opts: settings.get('heritrix.reScanJobs'),
    jId: 666,
    timeReceived: null,
    success: function (response) {
      console.log('Yes we rescanned the job directory', response)
    },
    error: function (err) {
      console.log('There was an error in rescanning the job directory but who cares')
    }
  })
}

export function buildHeritrixJob (jobId) {
  //  `https://lorem:ipsum@localhost:8443/engine/job/${jobId}`
  if (false) {//!ServiceStore.heritrixStatus()) {
    launchHeritrix(() => {
      buildHeritrixJob(jobId)
    })
  } else {
    let options = _.cloneDeep(settings.get('heritrix.buildOptions'))
    console.log('options uri before setting', options.uri)
    options.uri = `${options.uri}${jobId}`
    // options.agent = httpsAgent
    console.log(`building heritrix job ${jobId}`)
    console.log('Options after setting options.uri', options.uri)
    logger.info(util.format(logString, `building heritrix job ${jobId} with options ${options}`))

    RequestDispatcher.dispatch({
      type: EventTypes.REQUEST_HERITRIX,
      rType: RequestTypes.BUILD_HERITIX_JOB,
      opts: options,
      from: `buildHeritrixJob[${jobId}]`,
      jId: jobId,
      timeReceived: null,
      success: function (response) {
        console.log('sucess in building job', response)
        CrawlDispatcher.dispatch({
          type: EventTypes.BUILT_CRAWL_JOB,
          id: jobId
        })
      },
      error: function (err)  {
        if (err.statusCode === 303) {
          console.log('303 success in building job', err)
          CrawlDispatcher.dispatch({
            type: EventTypes.BUILT_CRAWL_JOB,
            id: jobId
          })
        } else {
          // POST failed...
          console.log('failur in building job', err)
          logger.error(util.format(logStringError, `building hereitrix job ${err.message} the uri ${options.uri}`, err.stack))
        }
      }
    })
  }
}

export function launchHeritrixJob (jobId) {
  // options.agent = httpsAgent
  if (false) {//!ServiceStore.heritrixStatus()) {
    launchHeritrix(() => {
      launchHeritrixJob(jobId)
    })
  } else {
    let options = _.cloneDeep(settings.get('heritrix.launchJobOptions'))
    console.log('options uri before setting', options.uri)
    console.log('the jobid', jobId)
    options.uri = `${options.uri}${jobId}`
    console.log(`launching heritrix job ${jobId}`)
    console.log('Options after setting options.uri', options.uri)

    RequestDispatcher.dispatch({
      type: EventTypes.REQUEST_HERITRIX,
      rType: RequestTypes.LAUNCH_HERITRIX_JOB,
      opts: options,
      from: `launchHeritrixJob[${jobId}]`,
      jId: jobId,
      timeReceived: null,
      success: function (response) {
        // POST succeeded...
        console.log('sucess in launching job', response)
        CrawlDispatcher.dispatch({
          type: EventTypes.LAUNCHED_CRAWL_JOB,
          id: jobId
        })
      },
      error: function (err) {
        if (err.statusCode === 303) {
          console.log('303 success in launch job', err)
          CrawlDispatcher.dispatch({
            type: EventTypes.LAUNCHED_CRAWL_JOB,
            id: jobId
          })
        } else {
          // POST failed...
          console.log('failur in launching job', err)
          logger.error(util.format(logStringError, `launching hereitrix job ${err.message} the uri ${options.uri}`, err.stack))
        }
      }
    })
  }
}

export function teardownJob (jobId) {
  let teardown = _.cloneDeep(settings.get('heritrix.sendActionOptions'))
  teardown.uri = `${teardown.uri}${jobId}`
  teardown.form.action = 'teardown'
  RequestDispatcher.dispatch({
    type: EventTypes.REQUEST_HERITRIX,
    rType: RequestTypes.FORCE_CRAWL_FINISH,
    opts: teardown,
    from: `tearDownJob[${jobId}]`,
    jId: jobId,
    timeReceived: null,
    success: function (response) {
      // POST succeeded...
      console.log(`teardownJob post succeeded for ${jobId}`, response)
    },
    error: function (err) {
      logger.error(util.format(logStringError, `teardownJob for ${jobId} to heritrix ${err.message}`, err.stack))
      console.log(`teardownJob post failed? in sendAction to heritrix for ${jobId}`, err)
    }
  })
}

export function forceCrawlFinish (jobId, cb) {
  if (!ServiceStore.heritrixStatus()) {
    if (cb) {
      cb()
    }
    return
  }

  let terminate = _.cloneDeep(settings.get('heritrix.sendActionOptions'))
  terminate.uri = `${terminate.uri}${jobId}`
  terminate.form.action = 'terminate'

  let teardown = _.cloneDeep(settings.get('heritrix.sendActionOptions'))
  teardown.uri = `${teardown.uri}${jobId}`
  teardown.form.action = 'teardown'

  // optimization and call stack reasons
  // sendActionToHeritrix(sequentialActions([ 'terminate', 'teardown' ], jobId), jobId, cb)
  RequestDispatcher.dispatch({
    type: EventTypes.REQUEST_HERITRIX,
    rType: RequestTypes.FORCE_CRAWL_FINISH,
    opts: [ terminate, teardown ],
    from: `forceCrawlFinish[${jobId}]`,
    jId: jobId,
    callback: cb,
    timeReceived: null,
    success: function (response) {
      // POST succeeded...
      console.log(`forceCrawlFinish action post succeeded in sendAction to heritrix for ${jobId}`, response)
      if (cb) {
        cb()
      }
    },
    error: function (err) {
      logger.error(util.format(logStringError, `sendAction for ${jobId} to heritrix ${err.message}`, err.stack))
      console.log(`forceCrawlFinish action post failed? in sendAction to heritrix for ${jobId}`, err)
      if (cb) {
        cb()
      }
    }
  })
}

export function restartJob (jobId) {
  buildHeritrixJob(jobId)
}

export function deleteHeritrixJob (jobId, cb) {
  forceCrawlFinish(jobId, cb)
}

export function sendActionToHeritrix (act, jobId, cb) {
  if (!ServiceStore.heritrixStatus()) {
    if (cb) {
      cb()
    }
    return
  }

  let options

  let isActionGenerator = act instanceof sequentialActions
  // let notDone = false

  if (isActionGenerator) {
    console.log('We have a actionGenerator')
    options = []
    for (let actionOpt of act) {
      console.log('Action from that generator', actionOpt.form.action)
      options.push(actionOpt)
    }
    // let nextAction = act.next()
    // console.log('We have a actionGenerator', nextAction)
    // notDone = !nextAction.done
    // if (nextAction.done) {
    //   if (cb) {
    //     cb()
    //   }
    //   return
    // }

    // options = nextAction.value
    // console.log(options)
  } else {
    options = _.cloneDeep(settings.get('heritrix.sendActionOptions'))
    options.uri = `${options.uri}${jobId}`
    options.form.action = act
  }
  // options.agent = httpsAgent

  RequestDispatcher.dispatch({
    type: EventTypes.REQUEST_HERITRIX,
    rType: RequestTypes.SEND_HERITRIX_ACTION,
    opts: options,
    from: `sendActionToHeritrix[${jobId}]`,
    jId: jobId,
    callback: cb,
    timeReceived: null,
    success: function (response) {
      // POST succeeded...
      if (isActionGenerator) {
        console.log(`sequential action post succeeded in sendAction to heritrix for ${jobId}`, response)
      } else {
        console.log(`post succeeded in sendAction to heritrix for ${jobId}`, response)
      }
    },
    error: function (err) {
      logger.error(util.format(logStringError, `sendAction for ${jobId} to heritrix ${err.message}`, err.stack))
      if (isActionGenerator) {
        console.log(`sequential action post failed? in sendAction to heritrix for ${jobId}`, err)
      } else {
        console.log(`sequential action post failed? in sendAction to heritrix for ${jobId}`, err)
      }
    }
  })
}

function sortJobs (j1, j2) {
  if (j1.timestamp.isBefore(j2.timestamp)) {
    return 1
  }

  if (j1.timestamp.isAfter(j2.timestamp)) {
    return -1
  }

  return 0
}

export function getHeritrixJobsState () {
  console.log('Get heritrix Job State')
  return new Promise((resolve, reject) => {
    let jobLaunch = named.named(jobLaunchRe)
    let job = named.named(jobRe)
    let jobs = {}
    let counter = 0
    let jobsConfs = {}
    let heritrixJobP = settings.get('heritrixJob')
    let onlyJobLaunchsProgress = through2.obj(function (item, enc, next) {
      let didMath = jobLaunch.exec(item.path)
      if (didMath) {
        console.log('Only job launch did match')
        jobs[ didMath.capture('job') ].log = true
        jobs[ didMath.capture('job') ].launch = didMath.capture('launch')
        jobs[ didMath.capture('job') ].logPath = item.path
        this.push(jobs[ didMath.capture('job') ])
      } else {
        if (item.stats.isDirectory()) {
          let jid = job.exec(item.path)

          if (jid) {
            console.log('is a directory we have a jobid')
            counter += 1
            jobsConfs[ jid.capture('job') ] =
              fs.readFileSync(`${heritrixJobP}/${jid.capture('job')}/crawler-beans.cxml`, 'utf8')
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
      fs.readFile(item.logPath, 'utf8', (err, data) => {
        if (err) throw err
        // console.log(data)
        let lines = data.trim().split(os.EOL)
        let lastLine = S(lines[ lines.length - 1 ])
        if (jobEndStatus.test(lastLine.s)) {
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

    fs.ensureDir(heritrixJobP, err => {
      if (err) {
        logger.error(util.format(logStringError, `ensuring ${heritrixJobP} ${err.message}`, err.stack))
        reject(err)
      } else {
        fs.walk(heritrixJobP)
          .pipe(onlyJobLaunchsProgress)
          .pipe(launchStats)
          .on('data', item => {})
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
              resolve({ count: counter, confs: jobsConfs, jobs: sortedJobs, })
            } else {
              resolve({ error: 'count zero', count: 0, stack: 'ere' })
            }
          })
          .on('error', function (error, item) {
            logger.error(util.format(logStringError, `walking ${heritrixJobP} on item: ${item.path}, ${error.message}`, error.stack))
            console.log(error.message)
            console.log(item.path) // the file the error occurred on
            reject(error)
          })
      }
    })
  })
}
