import moment from 'moment'
import Immutable from 'immutable'

const RunRecord = Immutable.Record({
  started: false,
  jobId: 0,
  ending: false,
  ended: true,
  timestamp: 0,
  tsMoment: moment(),
  discovered: 0,
  queued: 0,
  downloaded: 0
})

export default class RunInfoRecord extends RunRecord {
  updateStats (stats) {
    if (stats.warcs) {
      delete stats.warcs
    }
    stats.tsMoment = moment(stats.timestamp)
    stats.jobId = this.get('jobId')
    return this.merge(stats)
  }

  status () {
    if (this.ending && !this.get('ended')) {
      return 'Ending'
    }
    return this.get('ended') ? 'Ended' : 'Running'
  }
}
