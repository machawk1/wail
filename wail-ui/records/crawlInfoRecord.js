import moment from 'moment'
import Immutable from 'immutable'
import _ from 'lodash'
import  {makeRunInfoRecord, RunInfoRecord} from './runInfoRecord'

const log = console.log.bind(console)
function compare (a, b) {
  if (a.tsMoment.isBefore(b)) {
    return 1
  }
  if (a.tsMoment.isAfter(b.tsMoment)) {
    return -1
  }
  return 0
}

class CrawlInfoRecord extends Immutable.Record({
  jobId: 0, created: '', urls: '',
  forCol: '', depth: 0, path: '',
  confP: null, runs: Immutable.List(),
  running: false, latestRun: new RunInfoRecord(),
  lastUpdated: null
}) {

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
  let runs = (crawlInfo.runs || [])
  runs.forEach(r => {
    r.tsMoment = moment(r.timestamp)
  })
  runs.sort(compare)
  if (runs.length > 0) {
    crawlInfo.latestRun = makeRunInfoRecord(runs[ 0 ], crawlInfo.jobId)
    crawlInfo.lastUpdated = crawlInfo.latestRun.tsMoment
  } else {
    crawlInfo.latestRun = new RunInfoRecord({ jobId: crawlInfo.jobId })
  }
  crawlInfo.runs = Immutable.List(runs)
  return new CrawlInfoRecord(crawlInfo)
}

export default makeCrawlInfoRecord

