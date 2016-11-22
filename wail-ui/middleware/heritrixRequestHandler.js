import * as notify from '../actions/notification-actions'
import {send} from 'redux-electron-ipc'
import {batchActions} from 'redux-batched-actions'
import {HeritrixRequestTypes, JobActionEvents, RequestTypes, RequestActions} from '../constants/wail-constants'

const { START_JOB, RESTART_JOB, REMOVE_JOB, DELETE_JOB, TERMINATE_JOB } = JobActionEvents

const {
  BUILD_CRAWL_JOB, BUILT_CRAWL_CONF, BUILT_CRAWL_JOB, LAUNCHED_CRAWL_JOB,
  ACCESSIBILITY, ADD_HERITRIX_JOB_DIRECTORY, BUILD_HERITIX_JOB, FORCE_CRAWL_FINISH,
  TERMINATE_CRAWL, TEARDOWN_CRAWL, RESCAN_JOB_DIR, KILL_HERITRIX,
  LAUNCH_HERITRIX_JOB, SEND_HERITRIX_ACTION, REQUEST_SUCCESS, REQUEST_FAILURE
} = RequestTypes

const { MAKE_REQUEST, HANDLED_REQUEST } = RequestActions

const makeRequest = (store, next, action, request) => {
  console.log('make request', request)
  let { jobId } = request
  let job = store.getState().get('crawls').get(`${jobId}`)
  let latestRun = job.get('latestRun')
  console.log(job)
  switch (request.type) {
    case START_JOB:
      console.log('start job')
      console.log('start or restart heritrix job', jobId)
      if (latestRun.get('ended')) {
        console.log('start or restart heritrix job it had jobs but not running', jobId)
        notify.notifyInfo(`Starting Heritrix Crawl for ${job.displayUrls()}`)
        return next(send('send-to-requestDaemon', {
          type: HeritrixRequestTypes.BUILD_LAUNCH_JOB,
          jobId
        }))
      } else {
        console.log('start or restart heritrix job it had jobs but running', jobId)
        notify.notifyInfo(`Terminating and Restarting Heritrix Crawl for ${job.displayUrls()}`)
        return next(send('send-to-requestDaemon', {
          type: HeritrixRequestTypes.TERMINATE_RESTART_JOB,
          jobId
        }))
      }
    case RESTART_JOB:
      console.log('start or restart heritrix job', jobId)
      if (latestRun.get('ended')) {
        console.log('start or restart heritrix job it had jobs but not running', jobId)
        notify.notifyInfo(`Restarting Heritrix Crawl for ${job.displayUrls()}`)
        return next(send('send-to-requestDaemon', {
          type: HeritrixRequestTypes.BUILD_LAUNCH_JOB,
          jobId
        }))
      } else {
        console.log('start or restart heritrix job it had jobs but running', jobId)
        notify.notifyInfo(`Terminating and Restarting Heritrix Crawl for ${job.displayUrls()}`)
        return next(send('send-to-requestDaemon', {
          type: HeritrixRequestTypes.TERMINATE_RESTART_JOB,
          jobId
        }))
      }
    case REMOVE_JOB:
    case DELETE_JOB: {
      // TODO handle better
      let message = `Terminating Heritrix Crawl for ${job.displayUrls()}`
      return next(send('send-to-requestDaemon', {
        type: HeritrixRequestTypes.TERMINATE_JOB,
        jobId
      }))
    }
    case TERMINATE_JOB: {
      console.log('terminate job', jobId)
      notify.notifyInfo(`Terminating Heritrix Crawl for ${job.displayUrls()}`)
      return next(send('send-to-requestDaemon', {
        type: HeritrixRequestTypes.TERMINATE_JOB,
        jobId
      }))
    }
    default: {
      console.log('in default of handling actions heritrix request handler')
      return next(action)
    }
  }
}

const handledRequest = (store, next, action, handledRequest) => {
  let { type, rtype, jobId } = handledRequest
  let job = store.getState().get('crawls').get(`${jobId}`)
  switch (type) {
    case BUILT_CRAWL_JOB:
      if (rtype === REQUEST_SUCCESS) {
        notify.notifySuccess(`Heritrix Crawl for ${job.displayUrls()} was built`)
        return next(action)
      } else {
        notify.notifyError(`Heritrix Crawl for ${job.displayUrls()} was not built`)
        return next(action)
      }
    case LAUNCHED_CRAWL_JOB:
      if (rtype === REQUEST_SUCCESS) {
        notify.notifySuccess(`Heritrix Crawl started for ${job.displayUrls()}`)
        return next(send('crawl-started', jobId))
      } else {
        notify.notifyError(`Heritrix Crawl for ${job.displayUrls()} did not start`)
        return next(action)
      }
    case TERMINATE_CRAWL:
      if (rtype === REQUEST_SUCCESS) {
        notify.notifySuccess(`Heritrix Crawl started for ${job.displayUrls()} is ending`)
        return next(action)
      } else {
        notify.notifyError(`Heritrix Crawl for ${job.displayUrls()} was to to start ending but it did not`)
        return next(action)
      }
    case TEARDOWN_CRAWL:
      if (rtype === REQUEST_SUCCESS) {
        notify.notifySuccess(`Heritrix Crawl started for ${job.displayUrls()} ended`)
        return next(action)
      } else {
        notify.notifyError(`Heritrix Crawl for ${job.displayUrls()} could not be ended`)
        return next(action)
      }
    case RESCAN_JOB_DIR:
      if (rtype === REQUEST_SUCCESS) {
        notify.notifySuccess(`Rescanned Heritrix Crawl Directory for ${job.displayUrls()}`)
        return next(action)
      } else {
        notify.notifyError(`Rescanning Heritrix Crawl Directory for ${job.displayUrls()} failed`)
        return next(action)
      }
    default:
      return next(action)
  }
}

export default (store, next, action) => {
  console.log('heritrix request handler middleware', action)
  if (action.type === MAKE_REQUEST) {
    return makeRequest(store, next, action, action.request)
  } else if (action.type === HANDLED_REQUEST) {
    return handledRequest(store, next, action, action.request)
  } else {
    return next(action)
  }
}
