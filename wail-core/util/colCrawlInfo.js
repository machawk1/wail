import moment from 'moment'

export default class ColCrawlInfo {
  constructor (crawlInfo) {
    this.timestamp = moment(crawlInfo.jobId)
    this.path = crawlInfo.path
    this.urls = crawlInfo.urls
  }

  compare (ri) {
    if (this.timestamp.isBefore(ri.timestamp)) {
      return 1
    }

    if (this.timestamp.isAfter(ri.timestamp)) {
      return -1
    }

    return 0
  }
}
