import {ipcRenderer as ipc, remote} from 'electron'
import {joinStrings} from 'joinable'
import wc from '../../constants/wail-constants'
import {CollectionEvents, CrawlEvents, JobActionEvents, RequestActions} from '../../constants/wail-constants'
const EventTypes = wc.EventTypes
const From = wc.From
const {
  GOT_ALL_RUNS,
  CRAWLJOB_STATUS_UPDATE,
  BUILD_CRAWL_JOB,
  BUILT_CRAWL_CONF,
  CREATE_JOB,
  CRAWL_JOB_DELETED,
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

export function createJob (conf) {
  return {
    type: CREATE_JOB,
    conf
  }
}

export function madeJobConf (conf) {
  return {
    type: EventTypes.CREATE_JOB,
    conf
  }
}

export function crawlJobUpdate (e, crawlStatus) {
  return {
    type: CRAWLJOB_STATUS_UPDATE,
    crawlStatus
  }
}

// type: EventTypes.BUILD_CRAWL_JOB,
//   from: From.BASIC_ARCHIVE_NOW,
//   forCol: this.state.forCol

export function buildCrawlJob (url, forCol = wc.Default_Collection) {
  let depth = 1
  let jobId = new Date().getTime()
  ipc.send('makeHeritrixJobConf', { url, depth, jobId, forCol })
  window.logger.debug(`Building Heritrix crawl for ${forCol} seed(s): ${url}`)
  return {
    type: EventTypes.QUEUE_MESSAGE,
    message: {
      title: 'Info',
      level: 'info',
      message: `Archiving ${url} For ${forCol} Now!`,
      uid: `Archiving ${url} ${forCol} Now!`
    }
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
  ipc.send('makeHeritrixJobConf', {
    urls: newCrawl.urls,
    depth: newCrawl.depth,
    jobId: jId,
    forCol: newCrawl.forCol
  })
  window.logger.debug(`Building Heritrix crawl for ${newCrawl.forCol} ${urls}`)
  return {
    type: EventTypes.QUEUE_MESSAGE,
    message: {
      title: 'Info',
      level: 'info',
      message: `Building Heritrix crawl for ${newCrawl.forCol} with seeds:  ${urls}`,
      uid: `Building Heritrix crawl for ${urls}`
    }
  }
}

export function builtHeritrixJob (event, jobId) {
  return {
    type: EventTypes.BUILT_CRAWL_JOB,
    message: {
      title: 'Info',
      level: 'info',
      message: `Heritrix Crawl Built for job: `,
      uid: `Heritrix Crawl Built for job: `
    }
  }
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

