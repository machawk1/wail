import moment from 'moment'

export default class RunInfo {
  constructor (run, jobId) {
    this.started = run.started
    this.jobId = jobId
    this.ending = run.ending || false
    this.ended = run.ended
    this.timestamp = run.timestamp
    this.tsMoment = moment(run.timestamp)
    this.discovered = run.discovered
    this.queued = run.queued
    this.downloaded = run.downloaded
  }

  update (stats) {
    this.ended = stats.ended
    this.ending = stats.ending
    this.timestamp = stats.timestamp
    this.tsMoment = moment(stats.timestamp)
    this.discovered = stats.discovered
    this.queued = stats.queued
    this.downloaded = stats.downloaded
  }

  compare (ri) {
    if (this.tsMoment.isBefore(ri.tsMoment)) {
      return 1
    }

    if (this.tsMoment.isAfter(ri.tsMoment)) {
      return -1
    }

    return 0
  }

  toJSON () {
    return {
      ended: this.ended,
      ending: this.ending,
      timestamp: this.timestamp,
      discovered: this.discovered,
      queued: this.queued,
      downloaded: this.downloaded
    }
  }
}
