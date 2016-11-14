import {Record, Map, List} from 'immutable'

const CRecord = Record({
  indexes: '',
  archive: '',
  hasRunningCrawl: false,
  colpath: '',
  colName: '',
  numArchives: 0,
  metadata: Map(),
  crawls: List()
})

export default class Collection extends CRecord {
  static fromJS (col) {
    let { crawls } = col
    crawls = crawls.map(r => new ColCrawlInfo(r))
    crawls.sort((r1, r2) => r1.compare(r2))
    col.crawls = List(crawls)
    col.metadata = Immutable.fromJS(col.metadata)
  }
}