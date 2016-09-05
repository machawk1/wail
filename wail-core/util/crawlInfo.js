import RunInfo from './runInfo'

export default class CrawlInfo {
  constructor (crawlInfo) {
    this.jobId = crawlInfo.jobId
    this.urls = crawlInfo.urls
    this.forCol = crawlInfo.forCol
    this.depth = crawlInfo.depth
    this.path = crawlInfo.path
    this.confP = crawlInfo.confP
    this.running = crawlInfo.running
    this.runs = crawlInfo.runs.map(r => new RunInfo(r, this.jobId))
    this._sortRuns()
  }

  _sortRuns () {
    this.runs.sort((j1, j2) => j1.compare(j2))
  }

  toString () {
    return `CrawlInfo[forCol: ${this.forCol}, urls: ${this.urls}, running: ${this.running}, #runs:${this.runs.length}]`
  }

}