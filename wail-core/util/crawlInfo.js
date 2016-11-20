import RunInfo from './runInfo'
import moment from 'moment'
import _ from 'lodash'

export default class CrawlInfo {
  constructor (crawlInfo) {
    this.jobId = crawlInfo.jobId
    this.created = moment(crawlInfo.jobId)
    this.createdts = crawlInfo.jobId
    this.urls = crawlInfo.urls
    this.forCol = crawlInfo.forCol
    this.depth = crawlInfo.depth
    this.path = crawlInfo.path
    this.confP = crawlInfo.confP
    this.running = crawlInfo.running
    this.latestRun = new RunInfo(crawlInfo.latestRun)
  }

  urlsToJobId () {
    let uTj = []
    if (Array.isArray(this.urls)) {
      for (let url of new Set(this.urls)) {
        uTj.push({ url, jobId: this.jobId })
      }
    } else {
      uTj.push({ url: this.urls, jobId: this.jobId })
    }
    return uTj
  }

  equals (other) {
    if (!(other instanceof CrawlInfo)) {
      return false
    }

    return _.isEqual(this, other)
  }

  sortRuns () {
    this.runs.sort((j1, j2) => j1.compare(j2))
  }

  toString () {
    return `CrawlInfo[forCol: ${this.forCol}, urls: ${this.urls}, running: ${this.running}, #runs:${this.runs.length}]`
  }

  toJSON () {
    return {
      jobId: this.jobId,
      created: this.createdts,
      urls: this.urls,
      forCol: this.forCol,
      depth: this.depth,
      path: this.path,
      confP: this.confP,
      running: this.running,
      latestRun: this.latestRun,
    }
  }

}
