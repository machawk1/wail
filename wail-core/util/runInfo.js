import moment from 'moment'

export default class RunInfo {
  constructor (run,jobId) {

    this.jobId = jobId
    this.ending = run.ending
    this.ended = run.ended
    this.timestamp = run.timestamp
    this.tsMoment = moment(run.timestamp)
    this.discovered = run.discovered
    this.queued = run.queued
    this.downloaded = run.downloaded
  }

  compare(ri) {
    if (this.tsMoment.isBefore(ri.tsMoment)) {
      return 1
    }

    if (this.tsMoment.isAfter(ri.tsMoment)) {
      return -1
    }

    return 0
  }
}