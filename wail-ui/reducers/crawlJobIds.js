import {List} from 'immutable'
import {CrawlEvents} from '../constants/wail-constants'

const { GOT_ALL_RUNS } = CrawlEvents

export default (state = List(), action) => {
  console.log('in crawls reducer', action)
  switch (action.type) {
    case GOT_ALL_RUNS:
      let { allRuns } = action
      if ((allRuns || []).length > 0) {
        window.logger.debug(`intial job state load ${allRuns.length} jobs`)
        return state.merge(allRuns.map(r => r.jobId))
      } else {
        window.logger.debug('there was no runs in the db')
        return state
      }
    default:
      return state
  }
}

