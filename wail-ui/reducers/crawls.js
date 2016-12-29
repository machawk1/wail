import Immutable, {Map, List} from 'immutable'
import S from 'string'
import makeCrawlInfoRecord from '../records/crawlInfoRecord'
import {CrawlEvents, JobIdActions} from '../constants/wail-constants'
const {
  GOT_ALL_RUNS,
  CRAWLJOB_STATUS_UPDATE,
  BUILD_CRAWL_JOB,
  BUILT_CRAWL_CONF,
  CREATE_JOB,
  CRAWL_JOB_DELETED
} = CrawlEvents

const { ADD_ID, REMOVE_ID } = JobIdActions

const runsReducer = (state = Map(), action) => {
  console.log('runs reducer', action)
  switch (action.type) {
    case GOT_ALL_RUNS:
      let { allRuns } = action
      if ((allRuns || []).length > 0) {
        let runs = {}
        window.logger.debug(`intial job state load ${allRuns.length} jobs`)
        allRuns.forEach(r => {
          runs[ r.jobId ] = makeCrawlInfoRecord(r)
        })
        return state.merge(runs)
      } else {
        window.logger.debug('there was no runs in the db')
        return state
      }
    case BUILT_CRAWL_CONF: {
      let { crawlInfo } = action
      return state.set(`${crawlInfo.jobId}`, makeCrawlInfoRecord(crawlInfo))
    }
    case CRAWLJOB_STATUS_UPDATE: {
      let { jobId, stats } = action.crawlStatus
      if (stats.ended) {
        return state.updateIn([ `${jobId}` ], crawlRecord => crawlRecord.updateLatestRun(stats))
      } else {
        return state.updateIn([ `${jobId}` ], crawlRecord => crawlRecord.updateLatestRun(stats))
      }
    }
    default:
      return state
  }
}

const jobIds = (state = List(), action) => {
  switch (action.type) {
    case GOT_ALL_RUNS: {
      let { allRuns } = action
      if ((allRuns || []).length > 0) {
        return state.merge(allRuns.map(r => r.jobId))
      } else {
        return state
      }
    }
    case ADD_ID:
      return state.unshift(action.jobId)
    case REMOVE_ID:
      let idx = state.indexOf(action.jobId)
      console.log('remove heritrix job',action.jobId,'idx',idx)
      if (idx >= 0) {
        return state.remove(idx)
      } else {
        return state
      }
    default:
      return state
  }
}

const original = (state = Map(), action) => {
  console.log('in crawls reducer', action)
  switch (action.type) {
    case GOT_ALL_RUNS:
      let { allRuns } = action
      if ((allRuns || []).length > 0) {
        window.logger.debug(`intial job state load ${allRuns.length} jobs`)
        let crawlJobs = {}
        let jobIds = []
        let crawlsToCol = {}
        allRuns.forEach(r => {
          let cinfo = makeCrawlInfoRecord(r)
          jobIds.push(cinfo.get('jobId'))
          crawlJobs[ cinfo.get('jobId') ] = cinfo
          if (!crawlsToCol[ cinfo.get('forCol') ]) {
            crawlsToCol[ cinfo.get('forCol') ] = []
          }
          crawlsToCol[ cinfo.get('forCol') ].push(cinfo.get('jobId'))
        })
        return state.withMutations(map =>
          map.set('runningJobs', 0)
            .merge(crawlJobs)
            .set('colCrawls', Immutable.fromJS(crawlsToCol))
            .set('jobIds', List(jobIds))
        )
      } else {
        window.logger.debug('there was no runs in the db')
        return state.withMutations(map => map
          .set('runningJobs', 0).set('colCrawls', Map()).set('jobIds', List()))
      }
    case CRAWLJOB_STATUS_UPDATE: {
      let { jobId, stats } = action.crawlStatus
      if (stats.ended) {
        return state.updateIn([ `${jobId}` ], crawlRecord => crawlRecord.updateLatestRun(stats)).update('runningJobs', val => val - 1)
      } else {
        return state.updateIn([ `${jobId}` ], crawlRecord => crawlRecord.updateLatestRun(stats))
      }
    }
    default:
      return state
  }
}

export {
  runsReducer,
  jobIds
}
