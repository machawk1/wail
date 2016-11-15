import Immutable, {Map, List} from 'immutable'
import S from 'string'
import makeCrawlInfoRecord from '../records/crawlInfoRecord'
import wailConstants from '../constants/wail-constants'
const log = console.log.bind(console)
const EventTypes = wailConstants.EventTypes
const From = wailConstants.From

export default (state = Map(), action) => {
  console.log('in crawls reducer', action)
  switch (action.type) {
    case 'got-all-runs':
      let { allRuns } = action
      if ((allRuns || []).length > 0) {
        window.logger.debug(`intial job state load ${allRuns.length} jobs`)
        let crawlJobs = {}
        let crawlsToCol = {}
        allRuns.forEach(r => {
          let cinfo = makeCrawlInfoRecord(r)
          crawlJobs[ cinfo.get('jobId') ] = cinfo
          if (!crawlsToCol[ cinfo.get('forCol') ]) {
            crawlsToCol[ cinfo.get('forCol') ] = []
          }
          crawlsToCol[ cinfo.get('forCol') ].push(cinfo.get('jobId'))
        })
        return state.merge(crawlJobs).set('runningJobs', 0).set('colCrawls', Immutable.fromJS(crawlsToCol))
      } else {
        logger.debug('there was no runs in the db')
        return state.set('runningJobs', 0).set('colCrawls', Map())
      }
    case 'crawljob-status-update': {
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

