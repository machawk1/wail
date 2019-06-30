import moment from 'moment'
import Immutable from 'immutable'
import {joinStrings} from 'joinable'
import RunInfoRecord from './runInfoRecord'

const CrawlRecord = Immutable.Record({
  lastUpdated: null,
  jobId: 0,
  created: 0,
  urls: '',
  forCol: '',
  depth: 0,
  path: '',
  confP: null,
  running: false,
  latestRun: new RunInfoRecord()
})

export class CrawlInfoRecord extends CrawlRecord {
  displayUrls () {
    if (Array.isArray(this.get('urls'))) {
      return joinStrings(...this.get('urls'), { separator: ' ' })
    } else {
      return this.get('urls')
    }
  }

  status () {
    return this.latestRun.status()
  }

  timeStamp () {
    return this.latestRun.tsMoment
  }

  timeStampFormatted () {
    return this.latestRun.tsMoment.format('MMM DD YYYY h:mma')
  }

  discovered () {
    return this.latestRun.discovered
  }

  queued () {
    return this.latestRun.queued
  }

  downloaded () {
    return this.latestRun.downloaded
  }

  updateLatestRun (run) {
    if (run.ended) {
      return this.set('latestRun', this.get('latestRun').updateStats(run)).set('running', false)
    } else {
      return this.set('latestRun', this.get('latestRun').updateStats(run))
    }
  }
}

const makeCrawlInfoRecord = crawlInfo => {
  crawlInfo.created = moment(crawlInfo.jobId)
  crawlInfo.latestRun.tsMoment = moment(crawlInfo.latestRun.timestamp)
  crawlInfo.latestRun.jobId = crawlInfo.jobId
  crawlInfo.lastUpdated = moment(crawlInfo.latestRun.timestamp)
  crawlInfo.latestRun = new RunInfoRecord(crawlInfo.latestRun)
  return new CrawlInfoRecord(crawlInfo)
}

export default makeCrawlInfoRecord
