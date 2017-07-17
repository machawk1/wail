import { Record, List, Map } from 'immutable'
import { archiving } from '../../wail-core/globalStrings'
import moment from 'moment'

export class WailCrawlRecord extends Record({
  type: archiving.PAGE_ONLY,
  forCol: 'default',
  uri_r: '',
  queued: 1,
  started: 'Queued',
  lastUpdated: 'N/A',
  jobId: ''
}) {
  didStart (update) {
    return this.merge(update)
  }

  qIncrease (update) {
    return this.merge({
      'queued': this.queued + update.by,
      'lastUpdated': update.lastUpdated
    })
  }

  qDecrease (update) {
    return this.merge({
      'queued': this.queued - 1,
      'lastUpdated': update.lastUpdated
    })
  }

  willQDecreaseEqZero () {
    return this.queued - 1 === 0
  }

  status () {
    if (this.started !== 'Queued') {
      return `Started ${this.started}`
    }
    return this.started
  }

}

export default class WCrawlsRecord extends Record({
  jobIds: List(),
  jobs: Map()
}) {
  track (crawl) {
    crawl.type = archiving[crawl.type]
    crawl.lastUpdate = moment().format('MMM DD YYYY h:mm:ss.SSSSa')
    delete crawl.isPartOfV
    delete crawl.description
    delete crawl.saveTo
    return this.merge({
      'jobIds': this.jobIds.push(crawl.jobId),
      'jobs': this.jobs.set(crawl.jobId, new WailCrawlRecord(crawl))
    })
  }

  started (update) {
    let rid
    if (update.parent) {
      rid = update.parent
      delete update.parent
    } else {
      rid = update.jobId
    }
    let jb = this.getJob(rid)
    let jrbs = this.get('jobs')
    return this.set('jobs', jrbs.set(rid, jb.didStart(update)))
  }

  qIncrease (update) {
    let rid
    if (update.parent) {
      rid = update.parent
      delete update.parent
    } else {
      rid = update.jobId
    }
    let jb = this.getJob(rid)
    let jrbs = this.get('jobs')
    return this.set('jobs', jrbs.set(rid, jb.qIncrease(update)))
  }

  aCrawlFinished (update) {
    let rid
    if (update.parent) {
      rid = update.parent
      delete update.parent
    } else {
      rid = update.jobId
    }
    let wcr = this.getJob(rid)
    if (wcr.willQDecreaseEqZero()) {
      return this.merge({
        'jobIds': this.jobIds.delete(this.jobIds.indexOf(rid)),
        'jobs': this.jobs.delete(rid)
      })
    } else {
      let jrb = this.getJob(rid)
      return this.set('jobs', this.jobs.set(rid, jrb.qDecrease(update)))
    }
  }

  getJob (rid) {
    return this.jobs.get(rid)
  }
}