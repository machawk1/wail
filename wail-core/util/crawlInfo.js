import RunInfo from './runInfo'
import moment from 'moment'
import _ from 'lodash'

export default class CrawlInfo {
  constructor (crawlInfo) {
    this.jobId = crawlInfo.jobId
    this.created = moment(crawlInfo.jobId)
    this.urls = crawlInfo.urls
    this.forCol = crawlInfo.forCol
    this.depth = crawlInfo.depth
    this.path = crawlInfo.path
    this.confP = crawlInfo.confP
    this.running = crawlInfo.running
    this.runs = (crawlInfo.runs || []).map(r => new RunInfo(r, this.jobId))
    this.sortRuns()
  }

  equals(other) {
    if (!(other instanceof CrawlInfo)) {
        return false
    }

    return _.isEqual(this,other)
  }

  sortRuns () {
    this.runs.sort((j1, j2) => j1.compare(j2))
  }

  toString () {
    return `CrawlInfo[forCol: ${this.forCol}, urls: ${this.urls}, running: ${this.running}, #runs:${this.runs.length}]`
  }

}
