import {ipcRenderer as ipc} from 'electron'
import {notifyInfo} from '../actions/redux/notifications'
import {HeritrixRequestTypes, JobActionEvents, RequestTypes, RequestActions} from '../constants/wail-constants'
const {
  START_JOB,
  RESTART_JOB,
  REMOVE_JOB,
  DELETE_JOB,
  TERMINATE_JOB
} = JobActionEvents

const {
  BUILD_CRAWL_JOB,
  BUILT_CRAWL_CONF,
  BUILT_CRAWL_JOB,
  LAUNCHED_CRAWL_JOB,
  ACCESSIBILITY,
  ADD_HERITRIX_JOB_DIRECTORY,
  BUILD_HERITIX_JOB,
  FORCE_CRAWL_FINISH,
  TERMINATE_CRAWL,
  TEARDOWN_CRAWL,
  RESCAN_JOB_DIR,
  KILL_HERITRIX,
  LAUNCH_HERITRIX_JOB,
  SEND_HERITRIX_ACTION,
  REQUEST_SUCCESS,
  REQUEST_FAILURE
} = RequestTypes

const {
  MAKE_REQUEST,
  HANDLED_REQUEST
} = RequestActions

const makeRequest = (store, next, action, request) => {
  console.log('make request', request)
  let { jobId } = request
  let job = store.getState().get('crawls').get(`${jobId}`)
  console.log(job)
  switch (request.type) {
    case START_JOB:
      console.log('start job')
      console.log('start or restart heritrix job', jobId)
      if (job.get('runs').size > 0) {
        let latestRun = job.get('latestRun')
        if (latestRun.get('ended')) {
          console.log('start or restart heritrix job it had jobs but not running', jobId)
          ipc.send('send-to-requestDaemon', {
            type: HeritrixRequestTypes.BUILD_LAUNCH_JOB,
            jobId
          })
        } else {
          console.log('start or restart heritrix job it had jobs but running', jobId)
          ipc.send('send-to-requestDaemon', {
            type: HeritrixRequestTypes.TERMINATE_RESTART_JOB,
            jobId
          })
        }
      } else {
        console.log('start or restart heritrix job it had not jobs', jobId)
        ipc.send('send-to-requestDaemon', {
          type: HeritrixRequestTypes.BUILD_LAUNCH_JOB,
          jobId
        })
      }
      // let was = request.type === START_JOB ? 'Starting' : 'Restarting'
      // let message = `${was} Heritrix Crawl for ${job.displayUrls()}`
      return next(action)
    case RESTART_JOB:
      console.log('start or restart heritrix job', jobId)
      if (job.get('runs').size > 0) {
        let latestRun = job.get('latestRun')
        if (latestRun.get('ended')) {
          console.log('start or restart heritrix job it had jobs but not running', jobId)
          ipc.send('send-to-requestDaemon', {
            type: HeritrixRequestTypes.BUILD_LAUNCH_JOB,
            jobId
          })
        } else {
          console.log('start or restart heritrix job it had jobs but running', jobId)
          ipc.send('send-to-requestDaemon', {
            type: HeritrixRequestTypes.TERMINATE_RESTART_JOB,
            jobId
          })
        }
      } else {
        console.log('start or restart heritrix job it had not jobs', jobId)
        ipc.send('send-to-requestDaemon', {
          type: HeritrixRequestTypes.BUILD_LAUNCH_JOB,
          jobId
        })
      }
      // let was = request.type === START_JOB ? 'Starting' : 'Restarting'
      // let message = `${was} Heritrix Crawl for ${job.displayUrls()}`
      return next(action)
    case REMOVE_JOB:
    case DELETE_JOB: {
      // TODO handle better
      ipc.send('send-to-requestDaemon', {
        type: HeritrixRequestTypes.TERMINATE_JOB,
        jobId
      })
      let message = `Terminating Heritrix Crawl for ${job.displayUrls()}`
      return next(notifyInfo(message))
    }
    case TERMINATE_JOB: {
      console.log('terminate job', jobId)
      ipc.send('send-to-requestDaemon', {
        type: HeritrixRequestTypes.TERMINATE_JOB,
        jobId
      })
      let message = `Terminating Heritrix Crawl for ${job.displayUrls()}`
      return next(notifyInfo(message))
    }
    default: {
      console.log('in default of handling actions heritrix request handler')
      return next(request)
    }
  }
}

const handledRequest = (store, next, handledRequest) => {
  switch (handledRequest.type) {
    case BUILT_CRAWL_JOB:
    case LAUNCHED_CRAWL_JOB:
    case TERMINATE_CRAWL:
    case TEARDOWN_CRAWL:
    case RESCAN_JOB_DIR:
    default:
      return next(handledRequest)
  }
}

export default store => next => action => {
  console.log('heritrix request handler middleware', action)
  if (action.type === MAKE_REQUEST) {
    return makeRequest(store, next, action, action.request)
  } else if (action.type === HANDLED_REQUEST) {
    return handledRequest(store, next, action.request)
  } else {
    return next(action)
  }
}
