import wc from '../../../wail-ui/constants/wail-constants'
import {
  TerminateAndRestartJob,
  BuildLaunchJob,
  StopJob,
  JobLifeCycle,
  RescanJobDirRequest
} from '../../requests/heritrixRequests'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const {
  BUILD_HERITIX_JOB,
  RESCAN_JOB_DIR,
  LAUNCH_HERITRIX_JOB,
  TERMINATE_CRAWL,
  TEARDOWN_CRAWL,
} = wc.RequestTypes

const {
  BUILD_LAUNCH_JOB,
  STOP_JOB,
  TERMINATE_RESTART_JOB,
  TERMINATE_JOB,
  PERMANENT_DELETE_JOB
} = wc.HeritrixRequestTypes

const priorities = {
  1: 'BUILD_HERITIX_JOB',
  2: 'LAUNCH_HERITRIX_JOB',
  3: 'TEARDOWN_CRAWL',
  4: 'TERMINATE_CRAWL',
  BUILD_HERITIX_JOB: 1,
  LAUNCH_HERITRIX_JOB: 2,
  TEARDOWN_CRAWL: 3,
  TERMINATE_CRAWL: 4
}

export default class HeritrixRequestManager {
  constructor () {
    this.requestForJob = new Map()
    this.jobRequestQ = []
    this.working = false
  }

  queueRequest (request) {
    console.log('heritrix request manager queuing request', request)
    let {jobId, type} = request
    switch (type) {
      case BUILD_LAUNCH_JOB: {
        let haveRequestFor = this.requestForJob.has(jobId)
        if (!haveRequestFor) {
          console.log('heritrix request manager no duplicates for request', request)
          this.buildLaunchJob(request.jobId)
        } else {
          console.log('heritrix request manager has duplicates for request', request)
        }
        break
      }
      case TERMINATE_RESTART_JOB: {
        let haveRequestFor = this.requestForJob.has(jobId)
        if (!haveRequestFor) {
          console.log('heritrix request manager no duplicates for request', request)
          this.buildTerminateLaunch(request.jobId)
        } else {
          console.log('heritrix request manager has duplicates for request', request)
        }
        break
      }
      case TERMINATE_JOB:
      case TEARDOWN_CRAWL: {
        let haveRequestFor = this.requestForJob.has(jobId)
        if (!haveRequestFor) {
          console.log('heritrix request manager no duplicates for request', request)
          this.stopJob(request.jobId)
        }
        break
      }
      case RESCAN_JOB_DIR: {
        let haveRequestFor = this.requestForJob.has(jobId)
        if (!haveRequestFor) {
          this.rescanJobDir(jobId)
        }
        break
      }
    }
  }

  handleRequest () {
    let jobId = this.jobRequestQ.shift()
    let jr = this.requestForJob.get(jobId)
    console.log('heritrix request manager making for request for job', jobId)
    jr.makeRequest()
      .then(maybeDone => {
        let {done, doRetry} = maybeDone
        if (done) {
          console.log(`heritrix request manager job ${jobId} is done`)
          this.requestForJob.delete(jobId)
          this.maybeMore()
        } else {
          if (doRetry) {
            console.log(`heritrix request manager job ${jobId} is not done but needs a retry`)
            this.jobRequestQ.unshift(jobId)
          } else {
            console.log(`heritrix request manager job ${jobId} is not done queuing it`)
            this.jobRequestQ.push(jobId)
          }
          this.maybeMore()
        }
      })
  }

  maybeMore () {
    console.log('heritrix request manager do we have more requests to process?')
    if (this.jobRequestQ.length > 0) {
      console.log('heritrix request manager Yes we do handling them')
      this.handleRequest()
    } else {
      console.log('heritrix request manager No we do not. Waiting for more')
      this.working = false
    }
  }

  buildLaunchJob (jobId) {
    let jbl = new BuildLaunchJob(jobId)
    this.requestForJob.set(jobId, jbl)
    console.log(`heritrix request manager creating build launch job for job ${jobId}`)
    this.jobRequestQ.push(jobId)
    if (!this.working) {
      console.log('heritrix request manager was not working it is now')
      this.working = true
      this.handleRequest()
    }
  }

  buildTerminateLaunch (jobId) {
    let jbl = new TerminateAndRestartJob(jobId)
    this.requestForJob.set(jobId, jbl)
    console.log(`heritrix request manager creating build launch job for job ${jobId}`)
    this.jobRequestQ.push(jobId)
    if (!this.working) {
      console.log('heritrix request manager was not working it is now')
      this.working = true
      this.handleRequest()
    }
  }

  stopJob (jobId) {
    let stopper = new StopJob(jobId)
    this.requestForJob.set(jobId, stopper)
    console.log(`heritrix request manager creating stopper for job ${jobId}`)
    this.jobRequestQ.push(jobId)
    if (!this.working) {
      console.log('heritrix request manager was not working it is now')
      this.working = true
      this.handleRequest()
    }
  }

  jobLifeCyle (jobId, starting) {
    let jlc = new JobLifeCycle(jobId, starting)
    console.log(`heritrix request manager creating job lif cycle for job ${jobId} starting at ${priorities[starting]}`)
    this.requestForJob.set(jobId, jlc)
    this.jobRequestQ.push(jobId)
    if (!this.working) {
      console.log('heritrix request manager was not working it is now')
      this.working = true
      this.handleRequest()
    }
  }

  rescanJobDir (jobId) {
    let rsjd = new RescanJobDirRequest()
    console.log(`heritrix request manager creating rescanJobDir`)
    this.requestForJob.set(jobId, rsjd)
    this.jobRequestQ.push(jobId)
    if (!this.working) {
      console.log('heritrix request manager was not working it is now')
      this.working = true
      this.handleRequest()
    }
  }
}
