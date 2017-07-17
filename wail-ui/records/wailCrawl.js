import { Record, List } from 'immutable'
import { archiving } from '../../wail-core/globalStrings'
import moment from 'moment'

export class WailCrawlRecord extends Record({
  type: archiving.PAGE_ONLY,
  forCol: 'default',
  uri_r: '',
  queued: 1,
  started: 'queued',
  lastUpdated: 'N/A',
  jobId: ''
}) {
  started (update) {
    return this.merge(update)
  }

  qIncrease (update) {
    return this.withMutations(self => {
      self.set('queued', this.queued + update.by)
        .set('lastUpdated', update.lastUpdated)
    })
  }

  qDecrease (update) {
    return this.withMutations(self => {
      self.set('queued', this.queued - 1)
        .set('lastUpdated', update.lastUpdated)
    })
  }

  willQDecreaseEqZero () {
    return this.queued - 1 === 0
  }

}

export default class WCrawlsRecord extends Record({
  jobIds: List(),
  jobs: {}
}) {
  track (crawl) {
    crawl.type = archiving[crawl.type]
    crawl.lastUpdate = moment().format('MMM DD YYYY h:mm:ss.SSSSa')
    delete crawl.isPartOfV
    delete crawl.description
    delete crawl.saveTo
    this.jobs[crawl.jobId] = new WailCrawlRecord(crawl)
    console.log(this.jobs[crawl.jobId], crawl.jobId)
    return this.withMutations(self => {
      self.set('jobIds', this.jobIds.push(crawl.jobId))
        .set('jobs', this.jobs)
    })
  }

  started (update) {
    console.log(update)
    let rid
    if (update.parent) {
      rid = update.parent
      delete update.parent
    } else {
      rid = update.jobId
    }
    this.jobs[rid] = this.jobs[rid].started(update)
    return this.set('jobs', this.jobs)
  }

  qIncrease (update) {
    let rid
    if (update.parent) {
      rid = update.parent
      delete update.parent
    } else {
      rid = update.jobId
    }
    console.log(update)
    this.jobs[rid] = this.jobs[rid].qIncrease(update)
    return this.set('jobs', this.jobs)
  }

  aCrawlFinished (update) {
    console.log(update)
    let rid
    if (update.parent) {
      rid = update.parent
      delete update.parent
    } else {
      rid = update.jobId
    }
    let wcr = this.jobs[rid]
    if (wcr.willQDecreaseEqZero()) {
      delete this.jobs[rid]
      return this.withMutations(self => {
        self.set('jobIds', this.jobIds.delete(this.jobIds.indexOf(rid)))
          .set('jobs', this.jobs)
      })
    } else {
      this.jobs[rid] = this.jobs[rid].qDecrease(update)
      return this.set('jobs', this.jobs)
    }
  }
}