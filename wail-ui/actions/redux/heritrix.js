import {remote} from 'electron'
import {notifyInfo} from '../../actions/notification-actions'
import {joinStrings} from 'joinable'
import {batchActions} from 'redux-batched-actions'
import {
  CollectionEvents, CrawlEvents,
  JobActionEvents, RequestActions,
  RunningCrawlCounter, JobIdActions
} from '../../constants/wail-constants'
import {send} from 'redux-electron-ipc'
const {
  GOT_ALL_RUNS,
  CRAWLJOB_STATUS_UPDATE,
  BUILD_CRAWL_JOB,
  BUILT_CRAWL_CONF,
  CREATE_JOB,
  CRAWL_JOB_DELETED
} = CrawlEvents

const {
  START_JOB,
  RESTART_JOB,
  REMOVE_JOB,
  DELETE_JOB,
  TERMINATE_JOB
} = JobActionEvents

const {
  MAKE_REQUEST,
  HANDLED_REQUEST
} = RequestActions

const settings = remote.getGlobal('settings')

export function gotAllRuns (event, allRuns) {
  return {
    type: GOT_ALL_RUNS,
    allRuns
  }
}


export function madeJobConf (e, conf) {
  let updateRuns = {
    type: BUILT_CRAWL_CONF,
    crawlInfo: conf.crawlInfo
  }
  let updateJobIds = {
    type: JobIdActions.ADD_ID,
    jobId: conf.jobId
  }
  return dispatch => {
    dispatch(batchActions([ updateRuns, updateJobIds ]))
    dispatch(startJob(conf.jobId))
  }
}

export function crawlJobUpdate (e, crawlStatus) {
  return {
    type: CRAWLJOB_STATUS_UPDATE,
    crawlStatus
  }
}

export function buildDialogueCrawlJob (event, newCrawl) {
  let forMTI
  let urls
  let maybeArray = Array.isArray(newCrawl.urls)
  if (maybeArray) {
    forMTI = joinStrings(...newCrawl.urls, { separator: ' ' })
    urls = `Urls: ${forMTI} With depth of ${newCrawl.depth}`
  } else {
    forMTI = newCrawl.urls
    urls = `${newCrawl.urls} with depth of ${newCrawl.depth}`
  }
  let jId = new Date().getTime()
  window.logger.debug(`Building Heritrix crawl for ${newCrawl.forCol} ${urls}`)
  notifyInfo(`Building Heritrix crawl for ${newCrawl.forCol} with seeds: ${urls}`)
  return send('makeHeritrixJobConf', {
    urls: newCrawl.urls,
    depth: newCrawl.depth,
    jobId: jId,
    forCol: newCrawl.forCol
  })
}

export function startJob (jobId) {
  console.log('starting job for', jobId)
  return {
    type: MAKE_REQUEST,
    request: {
      type: START_JOB,
      jobId
    }
  }
}

export function restartJob (jobId) {
  console.log('restartJob', jobId)
  return {
    type: MAKE_REQUEST,
    request: {
      type: RESTART_JOB,
      jobId
    }
  }
}

export function removeJob (jobId) {
  console.log('removeJob', jobId)
  return {
    type: MAKE_REQUEST,
    request: {
      type: REMOVE_JOB,
      jobId
    }
  }
}

export function deleteJob (jobId) {
  console.log('deleteJob', jobId)
  return {
    type: MAKE_REQUEST,
    request: {
      type: DELETE_JOB,
      jobId
    }
  }
}

export function terminateJob (jobId) {
  console.log('terminateJob', jobId)
  return {
    type: MAKE_REQUEST,
    request: {
      type: TERMINATE_JOB,
      jobId
    }
  }
}

export function handledRequest (e, request) {
  console.log('handled request', request)
  return {
    type: HANDLED_REQUEST,
    request
  }
}

export function crawlStarted (jobId) {
  return dispatch => {
    dispatch(send('crawl-started', jobId))
    dispatch({
      type: RunningCrawlCounter.INCREMENT
    })
  }
}

export function crawlEnded () {
  return {
    type: RunningCrawlCounter.DECREMENT
  }
}
