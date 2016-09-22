import autobind from 'autobind-decorator'
import {default as wc} from '../../constants'
import {
  JobLifeCycle,
  RescanJobDirRequest
} from '../../requests'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const {
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

  @autobind
  queueRequest (request) {
    console.log('heritrix request manager queuing request',request)
    let {
      jobId,
      rType
    } = request
    switch (rType) {
      case BUILD_HERITIX_JOB:
      case LAUNCH_HERITRIX_JOB:
        let haveRequestFor = this.requestForJob.has(jobId)
        if (!haveRequestFor) {
          console.log('heritrix request manager no duplicates for request',request)
          this.jobLifeCyle(request.jobId, priorities[ rType ])
        } else {
          console.log('heritrix request manager has duplicates for request',request)
        }
        break
      case TERMINATE_CRAWL:
      case TEARDOWN_CRAWL:
        let haveRequestFor = this.requestForJob.has(jobId)
        if (!haveRequestFor) {
          console.log('heritrix request manager no duplicates for request',request)
          this.jobLifeCyle(request.jobId, priorities[ rType ])
        } else {
          console.log('heritrix request manager has duplicates for request',request)
          let theJobsLc = this.requestForJob.get(jobId)
          let maybeNext = priorities[ rType ]
          if (theJobsLc.curStatePriority < maybeNext) {
            console.log('heritrix request manager has duplicates for request and its priority is greater',request)
            theJobsLc.goto(3)
          }
        }
        break
      case RESCAN_JOB_DIR:
        let haveRequestFor = this.requestForJob.has(jobId)
        if (!haveRequestFor) {
          this.rescanJobDir(jobId)
        }
        break
    }
  }

  @autobind
  handleRequest () {
    let jobId = this.jobRequestQ.shift()
    let jr = this.requestForJob.get(jobId)
    console.log('heritrix request manager making for request for job',jobId)
    jr.makeRequest()
      .then(maybeDone => {
        let {
          done,
          doRetry
        } = maybeDone
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

  @autobind
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

  @autobind
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

  @autobind
  rescanJobDir(jobId) {
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