import moment from 'moment'
import Immutable from 'immutable'
import _ from 'lodash'
const log = console.log.bind(console)

export class RunInfoRecord extends Immutable.Record({
  started: false, jobId: null, ending: false,
  ended: true, timestamp: null, tsMoment: null,
  discovered: 0, queued: 0, downloaded: 0,
}) {
  updateStats (stats) {
    stats.tsMoment = moment(stats.timestamp)
    stats.jobId = this.get('jobId')
    return this.merge(stats)
  }
}

export function makeRunInfoRecord (run, jobId) {
  if (!run.tsMoment) {
    run.tsMoment = moment(run.timestamp)
  }
  run.jobId = jobId
  return new RunInfoRecord(run)
}
