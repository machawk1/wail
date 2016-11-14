import Immutable, {Map, List} from 'immutable'
import S from 'string'
import ColCrawlInfo from '../../wail-core/util/colCrawlInfo'
import wailConstants from '../constants/wail-constants'

const { ADD_METADATA_TO_COLLECTION } = wailConstants.EventTypes

export default  (state = Map(), action) => {
  console.log('in collections reducer', action)
  switch (action.type) {
    case 'got-all-runs':
      let { allRuns } = action
      if ((allRuns || []).length > 0) {
        window.logger.debug(`intial job state load ${allRuns.length} jobs`)
        this.crawlJobs = allRuns.map((r, idx) => {
          // console.log(r)
          this.jobIndex.set(r.jobId, idx)
          return new CrawlInfo(r)
        })
        this.emit('jobs-updated')
      } else {
        console.log('there was no runs in the db')
        logger.debug('there was no runs in the db')
      }
    default:
      return state
  }
}

