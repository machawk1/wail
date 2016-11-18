import Immutable, {Map, List} from 'immutable'
import S from 'string'
import makeCrawlInfoRecord from '../records/crawlInfoRecord'
import wailConstants from '../constants/wail-constants'
import {CrawlEvents} from '../constants/wail-constants'
const log = console.log.bind(console)
const EventTypes = wailConstants.EventTypes
const From = wailConstants.From
const {
  GOT_ALL_RUNS,
  CRAWLJOB_STATUS_UPDATE,
  BUILD_CRAWL_JOB,
  BUILT_CRAWL_CONF,
  CREATE_JOB,
  CRAWL_JOB_DELETED
} = CrawlEvents

export default (state = Map(), action) => {
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
        return state.merge(crawlJobs)
          .withMutations(map => map.set('runningJobs', 0)
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

