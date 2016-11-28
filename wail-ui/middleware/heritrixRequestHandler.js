import * as notify from '../actions/notification-actions'
import {send} from 'redux-electron-ipc'
import {crawlStarted, crawlEnded} from '../actions/redux/heritrix'
import {HeritrixRequestTypes, JobActionEvents, RequestTypes, RequestActions} from '../constants/wail-constants'

const { START_JOB, RESTART_JOB, REMOVE_JOB, DELETE_JOB, TERMINATE_JOB } = JobActionEvents

const {
  BUILT_CRAWL_JOB, LAUNCHED_CRAWL_JOB,
  TERMINATE_CRAWL, TEARDOWN_CRAWL, RESCAN_JOB_DIR,
  REQUEST_SUCCESS,
} = RequestTypes

const { MAKE_REQUEST, HANDLED_REQUEST } = RequestActions

const makeRequest = (store, next, action, request) => {
  console.log('make request', request)
  let { jobId } = request
  let job = store.getState().get('runs').get(`${jobId}`)
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
  let job = store.getState().get('runs').get(`${jobId}`)
  switch (type) {
    case BUILT_CRAWL_JOB:
      if (rtype === REQUEST_SUCCESS) {
        notify.notifySuccess(`Heritrix Crawl for ${job.displayUrls()} was built`)
      } else {
        notify.notifyError(`Heritrix Crawl for ${job.displayUrls()} was not built`)
      }
      break
    case LAUNCHED_CRAWL_JOB:
      if (rtype === REQUEST_SUCCESS) {
        notify.notifySuccess(`Heritrix Crawl for ${job.displayUrls()} has started`)
        store.dispatch(crawlStarted(jobId))
      } else {
        notify.notifyError(`Heritrix Crawl for ${job.displayUrls()} did not start`)
      }
      break
    case TEARDOWN_CRAWL:
      if (rtype === REQUEST_SUCCESS) {
        notify.notifySuccess(`Heritrix Crawl for ${job.displayUrls()} is ending`)
      } else {
        notify.notifyError(`Heritrix Crawl for ${job.displayUrls()} was asked to start ending but it did not`)
      }
      break
    case TERMINATE_CRAWL:
      if (rtype === REQUEST_SUCCESS) {
        notify.notifySuccess(`Heritrix Crawl for ${job.displayUrls()} has ended`)
      } else {
        notify.notifyError(`Heritrix Crawl for ${job.displayUrls()} was asked to end but it did not`)
      }
      store.dispatch(crawlEnded())
      break
    case RESCAN_JOB_DIR:
      if (rtype === REQUEST_SUCCESS) {
        notify.notifySuccess(`Rescanned Heritrix Crawl Directory for ${job.displayUrls()}`)
      } else {
        notify.notifyError(`Rescanning Heritrix Crawl Directory for ${job.displayUrls()} failed`)
      }
      break
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
