import RunInfo from './runInfo'
import moment from 'moment'
import _ from 'lodash'

export default class CrawlRunInfo {
  constructor (crawlInfo) {
    this.jobId = crawlInfo.jobId
    this.created = moment(crawlInfo.jobId)
    this.urls = crawlInfo.urls
    this.forCol = crawlInfo.forCol
    this.depth = crawlInfo.depth
    this.path = crawlInfo.path
    this.confP = crawlInfo.confP
    this.running = crawlInfo.running
    this.latestRun = null
    this.lastUpdated = null
    this.started = null
    this.jobId = null
    this.ending = null
    this.ended = null
    this.timestamp = null
    this.tsMoment = null
    this.discovered = null
    this.queued = null
    this.downloaded = null
    let runs = (crawlInfo.runs || []).map(r => new RunInfo(r, this.jobId))
    this.populateRunInfo(runs)
  }

  equals (other) {
    if (!(other instanceof CrawlRunInfo)) {
      return false
    }
    return _.isEqual(this, other)
  }

  populateRunInfo (runs) {
    this.runs.sort((j1, j2) => j1.compare(j2))
    if (this.runs.length > 0) {
      this.latestRun = this.runs[ 0 ]
      this.lastUpdated = this.latestRun.tsMoment
    }
  }

  toString () {
    return `CrawlInfo[forCol: ${this.forCol}, urls: ${this.urls}, running: ${this.running}, #runs:${this.runs.length}]`
  }
}
