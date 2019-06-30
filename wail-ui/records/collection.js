import Immutable from 'immutable'
import ColCrawlInfo from '../../wail-core/util/colCrawlInfo'

const CRecord = Immutable.Record({
  indexes: '',
  archive: '',
  hasRunningCrawl: false,
  colpath: '',
  colName: '',
  numArchives: 0,
  metadata: Immutable.Map(),
  seeds: Immutable.List()
})

const makeCollectionRecord = col => {
  let { crawls } = col
  col.metadata = Immutable.fromJS(col.metadata)
}

export default class Collection extends CRecord {
  static fromJS (col) {
    let { crawls } = col
    crawls = crawls.map(r => new ColCrawlInfo(r))
    crawls.sort((r1, r2) => r1.compare(r2))
    col.crawls = Immutable.List(crawls)
    col.metadata = Immutable.fromJS(col.metadata)
  }
}
