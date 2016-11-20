import moment from 'moment'
import Immutable from 'immutable'
import {joinStrings} from 'joinable'
import RunInfoRecord from './runInfoRecord'

function compare (a, b) {
  if (a.tsMoment.isBefore(b)) {
    return 1
  }
  if (a.tsMoment.isAfter(b.tsMoment)) {
    return -1
  }
  return 0
}

const CrawlRecord = Immutable.Record({
  lastUpdated: null,
  jobId: 0, created: 0, urls: '',
  forCol: '', depth: 0, path: '',
  confP: null, running: false, latestRun: new RunInfoRecord()
})

export class CrawlInfoRecord extends CrawlRecord {

  displayUrls () {
    if (Array.isArray(this.get('urls'))) {
      return joinStrings(...this.get('urls'), { separator: ' ' })
    } else {
      return this.get('urls')
    }
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
  let crec = new CrawlInfoRecord(crawlInfo)
  console.log(crec.lastUpdated.format('MMM DD YYYY h:mma'))
  console.log(crec.latestRun.tsMoment.format('MMM DD YYYY h:mma'))
  return crec
}

export default makeCrawlInfoRecord

