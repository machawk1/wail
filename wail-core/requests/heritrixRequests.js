import { ipcRenderer as ipc, remote } from 'electron'
import Promise from 'bluebird'
import rp from 'request-promise'
import _ from 'lodash'
import wc from '../../wail-ui/constants/wail-constants'
import { HeritrixRequest } from './requestTypes'

const settings = remote.getGlobal('settings')
const pathMan = remote.getGlobal('pathMan')

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
const {
  BUILT_CRAWL_JOB,
  LAUNCHED_CRAWL_JOB,
  ACCESSIBILITY,
  ADD_HERITRIX_JOB_DIRECTORY,
  BUILD_HERITIX_JOB,
  FORCE_CRAWL_FINISH,
  RESCAN_JOB_DIR,
  KILL_HERITRIX,
  LAUNCH_HERITRIX_JOB,
  TERMINATE_CRAWL,
  TEARDOWN_CRAWL,
  SEND_HERITRIX_ACTION,
  REQUEST_SUCCESS,
  REQUEST_FAILURE
} = wc.RequestTypes

const optsReplaceUrl = (jobId, settingsKey) => {
  let options = _.cloneDeep(settings.get(settingsKey))
  options.url = `${options.url}${jobId}`
  return options
}

const optsReplaceUrlForm = (jobId, formVal, settingsKey) => {
  let options = _.cloneDeep(settings.get(settingsKey))
  options.url = `${options.url}${jobId}`
  options.form.action = formVal
  return options
}

export class BuildJobRequest extends HeritrixRequest {
  constructor (jobId) {
    super(jobId, BUILD_HERITIX_JOB, `buildHeritrixJob[${jobId}]`,
      optsReplaceUrl(jobId, 'heritrix.buildOptions'), 1)
  }

  completedSuccess () {
    console.log('BuildJobRequest completedSuccess')
    ipc.send('handled-request', {
      type: BUILT_CRAWL_JOB,
      rtype: REQUEST_SUCCESS,
      jobId: this.jobId
    })
  }

  completedError () {
    console.log('BuildJobRequest completedError')
    ipc.send('handled-request', {
      type: BUILT_CRAWL_JOB,
      rtype: REQUEST_FAILURE,
      jobId: this.jobId,
      err: this.finalError
    })
  }
}

export class LaunchJobRequest extends HeritrixRequest {
  constructor (jobId) {
    super(jobId, LAUNCH_HERITRIX_JOB, `launchHeritrixJob[${jobId}]`,
      optsReplaceUrl(jobId, 'heritrix.launchJobOptions'), 2)
    console.log('LaunchJobRequest', this)
  }

  completedSuccess () {
    console.log('LaunchJobRequest completedSuccess ')
    ipc.send('handled-request', {
      type: LAUNCHED_CRAWL_JOB,
      rtype: REQUEST_SUCCESS,
      jobId: this.jobId
    })
  }

  completedError () {
    console.log('LaunchJobRequest completedError ')
    ipc.send('handled-request', {
      type: LAUNCHED_CRAWL_JOB,
      rtype: REQUEST_FAILURE,
      jobId: this.jobId,
      err: this.finalError
    })
  }
}

export class TerminateJobRequest extends HeritrixRequest {
  constructor (jobId) {
    super(jobId, TERMINATE_CRAWL, `TerminateHeritrixJob[${jobId}]`,
      optsReplaceUrlForm(jobId, 'terminate', 'heritrix.sendActionOptions'), 3)
  }

  completedSuccess () {
    console.log('TerminateJobRequest completedSuccess ')
    ipc.send('handled-request', {
      type: TERMINATE_CRAWL,
      rtype: REQUEST_SUCCESS,
      jobId: this.jobId
    })
  }

  completedError () {
    console.log('TerminateJobRequest completedError ')
    ipc.send('handled-request', {
      type: TERMINATE_CRAWL,
      rtype: REQUEST_FAILURE,
      jobId: this.jobId,
      err: this.finalError
    })
  }
}

export class TeardownJobRequest extends HeritrixRequest {
  constructor (jobId) {
    super(jobId, TEARDOWN_CRAWL, `TerminateHeritrixJob[${jobId}]`,
      optsReplaceUrlForm(jobId, 'teardown', 'heritrix.sendActionOptions'), 4)
  }

  completedSuccess () {
    console.log('TeardownJobRequest completedSuccess ')
    ipc.send('handled-request', {
      type: TEARDOWN_CRAWL,
      rtype: REQUEST_SUCCESS,
      jobId: this.jobId
    })
  }

  completedError () {
    console.log('TeardownJobRequest completedError ')
    ipc.send('handled-request', {
      type: TEARDOWN_CRAWL,
      rtype: REQUEST_FAILURE,
      jobId: this.jobId,
      err: this.finalError
    })
  }
}

export class RescanJobDirRequest extends HeritrixRequest {
  constructor () {
    super(666, RESCAN_JOB_DIR, 'rescanJobDir',
      settings.get('heritrix.reScanJobs'))
  }

  completedSuccess () {
    console.log('RescanJobDirRequest completedSuccess ')
    ipc.send('handled-request', {
      type: RESCAN_JOB_DIR,
      rtype: REQUEST_SUCCESS
    })
  }

  completedError () {
    console.log('RescanJobDirRequest completedError ')
    ipc.send('handled-request', {
      type: RESCAN_JOB_DIR,
      rtype: REQUEST_FAILURE,
      err: this.finalError
    })
  }

  makeRequest () {
    console.log('RescanJobDirRequest makeRequest ')
    return rp(this.options)
      .then(success => {
        console.log('RescanJobDirRequest makeRequest request success')
        this.completedSuccess()
        return {
          done: true,
          doRetry: false
        }
      })
      .catch(error => {
        console.log('RescanJobDirRequest makeRequest request error')
        this.handleError(error)
        if (this.doRetry) {
          console.log('RescanJobDirRequest makeRequest request retrying')
          return {
            done: false,
            doRetry: true
          }
        } else {
          if (this.trueFailure) {
            console.log('RescanJobDirRequest makeRequest request true error')
            this.completedError()
            return {
              done: true,
              doRetry: false
            }
          } else {
            console.log('RescanJobDirRequest makeRequest request false errror')
            this.completedSuccess()
            return {
              done: true,
              doRetry: false
            }
          }
        }
      })
  }
}

export class BuildLaunchJob {
  constructor (jobId) {
    this.q = [
      new BuildJobRequest(jobId),
      new LaunchJobRequest(jobId)
    ]
    this.type = 'build'
    this.jobId = jobId
    this.curStatePriority = 1
  }

  maybeMore () {
    return this.q.length > 0
  }

  makeRequest () {
    let request = this.q.shift()
    this.curStatePriority = request.priority
    console.log(`Build Launch Job making request for jobId ${request.jobId} of type ${request.rtype}`)
    return rp(request.options)
      .then(success => {
        console.log(`Build Launch Job made request for jobId ${request.jobId} of type ${request.rtype} it was successful`)
        request.completedSuccess()
        if (this.maybeMore()) {
          console.log(`Build Launch Job made request for jobId ${request.jobId} has more`)
          return Promise.resolve({
            done: false,
            doRetry: false
          })
        } else {
          console.log(`Build Launch Job made request for jobId ${request.jobId} is done`)
          return Promise.resolve({
            done: true,
            doRetry: false
          })
        }
      })
      .catch(error => {
        console.log(`Build Launch Job made request for jobId ${request.jobId} had error`, error)
        request.handleError(error)
        if (request.doRetry) {
          console.log(`Build Launch Job made request for jobId ${request.jobId} had retrying`)
          this.q.unshift(request)
          return Promise.resolve({
            done: false,
            doRetry: true
          })
        } else {
          if (request.trueFailure) {
            console.log(`Build Launch Job made request for jobId ${request.jobId} had error it was a true error`)
            request.completedError()
            return Promise.resolve({
              done: true,
              doRetry: false
            })
          } else {
            console.log(`Build Launch Job made request for jobId ${request.jobId} had error it was not a true error`)
            request.completedSuccess()
            if (this.maybeMore()) {
              console.log(`Build Launch Job made request for jobId ${request.jobId} has more`)
              return Promise.resolve({
                done: false,
                doRetry: false
              })
            } else {
              console.log(`Build Launch Job made request for jobId ${request.jobId} is done`)
              return Promise.resolve({
                done: true,
                doRetry: false
              })
            }
          }
        }
      })
  }
}

export class StopJob {
  constructor (jobId) {
    this.q = [
      new TeardownJobRequest(jobId)
    ]
    this.type = 'stopjob'
    this.curStatePriority = 3
  }

  maybeMore () {
    return this.q.length > 0
  }

  makeRequest () {
    let request = this.q.shift()
    console.log(`Stop Job making request for jobId ${request.jobId} of type ${request.rtype}`)
    return rp(request.options)
      .then(success => {
        console.log(`Stop Job made request for jobId ${request.jobId} of type ${request.rtype} it was successful`)
        request.completedSuccess()
        if (this.maybeMore()) {
          console.log(`Stop Job made request for jobId ${request.jobId} has more`)
          return {
            done: false,
            doRetry: false
          }
        } else {
          console.log(`Stop Job made request for jobId ${request.jobId} is done`)
          return {
            done: true,
            doRetry: false
          }
        }
      })
      .catch(error => {
        console.log(`Stop Job made request for jobId ${request.jobId} had error`, error)
        request.handleError(error)
        if (request.doRetry) {
          console.log(`Stop Job made request for jobId ${request.jobId} had retrying`)
          this.q.unshift(request)
          return {
            done: false,
            doRetry: true
          }
        } else {
          if (request.trueFailure) {
            console.log(`Stop Job made request for jobId ${request.jobId} had error it was a true error`)
            request.completedError()
            return {
              done: true,
              doRetry: false
            }
          } else {
            console.log(`Stop Job made request for jobId ${request.jobId} had error it was not a true error`)
            request.completedSuccess()
            if (this.maybeMore()) {
              console.log(`Stop Job made request for jobId ${request.jobId} has more`)
              return {
                done: false,
                doRetry: false
              }
            } else {
              console.log(`Stop Job made request for jobId ${request.jobId} is done`)
              return {
                done: true,
                doRetry: false
              }
            }
          }
        }
      })
  }
}

export class TerminateAndRestartJob {
  constructor (jobId) {
    this.q = [
      new TeardownJobRequest(jobId),
      new BuildJobRequest(jobId),
      new LaunchJobRequest(jobId)
    ]
    this.type = 'terminateAndRestart'
  }

  maybeMore () {
    return this.q.length > 0
  }

  makeRequest () {
    let request = this.q.shift()
    console.log(`Stop Job making request for jobId ${request.jobId} of type ${request.rtype}`)
    return rp(request.options)
      .then(success => {
        console.log(`Stop Job made request for jobId ${request.jobId} of type ${request.rtype} it was successful`)
        request.completedSuccess()
        if (this.maybeMore()) {
          console.log(`Stop Job made request for jobId ${request.jobId} has more`)
          return {
            done: false,
            doRetry: false
          }
        } else {
          console.log(`Stop Job made request for jobId ${request.jobId} is done`)
          return {
            done: true,
            doRetry: false
          }
        }
      })
      .catch(error => {
        console.log(`Stop Job made request for jobId ${request.jobId} had error`, error)
        request.handleError(error)
        if (request.doRetry) {
          console.log(`Stop Job made request for jobId ${request.jobId} had retrying`)
          this.q.unshift(request)
          return {
            done: false,
            doRetry: true
          }
        } else {
          if (request.trueFailure) {
            console.log(`Stop Job made request for jobId ${request.jobId} had error it was a true error`)
            request.completedError()
            return {
              done: true,
              doRetry: false
            }
          } else {
            console.log(`Stop Job made request for jobId ${request.jobId} had error it was not a true error`)
            request.completedSuccess()
            if (this.maybeMore()) {
              console.log(`Stop Job made request for jobId ${request.jobId} has more`)
              return {
                done: false,
                doRetry: false
              }
            } else {
              console.log(`Stop Job made request for jobId ${request.jobId} is done`)
              return {
                done: true,
                doRetry: false
              }
            }
          }
        }
      })
  }
}

export class JobLifeCycle {
  constructor (jobId, starting) {
    this.q = makeJobLifeCycle(jobId, starting)
    this.jobId = jobId
    this.type = 'joblc'
    this.curStatePriority = starting
  }

  goto (nextRWithPriority) {
    console.log(`Heritrix Job Life Cycle going to next priority ${nextRWithPriority} before`, this.q)
    this.q = _.dropWhile(this.q, r => r.priority < nextRWithPriority)
    console.log(`Heritrix Job Life Cycle going to next priority ${nextRWithPriority} after`, this.q)
  }

  maybeMore () {
    return this.q.length > 0
  }

  makeRequest () {
    return new Promise((resolve, reject) => {
      let request = this.q.shift()
      this.curStatePriority = request.priority
      console.log(`Heritrix Job Life Cycle making request for jobId ${this.jobId} of type ${this.rtype}`)
      rp(request.options)
        .then(success => {
          console.log(`Heritrix Job Life Cycle made request for jobId ${this.jobId} of type ${this.rtype} it was successful`)
          request.completedSuccess()
          if (this.maybeMore()) {
            console.log(`Heritrix Job Life Cycle made request for jobId ${this.jobId} has more`)
            resolve({
              done: false,
              doRetry: false
            })
          } else {
            console.log(`Heritrix Job Life Cycle made request for jobId ${this.jobId} is done`)
            resolve({
              done: true,
              doRetry: false
            })
          }
        })
        .catch(error => {
          console.log(`Heritrix Job Life Cycle made request for jobId ${this.jobId} had error`, error)
          request.handleError(error)
          if (request.doRetry) {
            console.log(`Heritrix Job Life Cycle made request for jobId ${this.jobId} had retrying`)
            this.q.unshift(request)
            resolve({
              done: false,
              doRetry: true
            })
          } else {
            if (request.trueFailure) {
              console.log(`Heritrix Job Life Cycle made request for jobId ${this.jobId} had error it was a true error`)
              request.completedError()
              resolve({
                done: true,
                doRetry: false
              })
            } else {
              console.log(`Heritrix Job Life Cycle made request for jobId ${this.jobId} had error it was not a true error`)
              request.completedSuccess()
              if (this.maybeMore()) {
                console.log(`Heritrix Job Life Cycle made request for jobId ${this.jobId} has more`)
                resolve({
                  done: false,
                  doRetry: false
                })
              } else {
                console.log(`Heritrix Job Life Cycle made request for jobId ${this.jobId} is done`)
                resolve({
                  done: true,
                  doRetry: false
                })
              }
            }
          }
        })
    })
  }
}

const makeJobLifeCycle = (jobId, starting) => {
  if (starting === 1 || starting === 2) {
    return [
      new BuildJobRequest(jobId),
      new LaunchJobRequest(jobId),
      new TeardownJobRequest(jobId)
    ]
  } else {
    return [
      new TerminateJobRequest(jobId),
      new TeardownJobRequest(jobId)
    ]
  }
}
