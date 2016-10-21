import {Map, List} from 'immutable'
import S from 'string'
import ColCrawlInfo from '../../wail-core/util/colCrawlInfo'
import wailConstants from '../constants/wail-constants'

const { ADD_METADATA_TO_COLLECTION } = wailConstants.EventTypes

export default function collectionReducer (state = Map({}), action) {
  switch (action.type) {
    case 'got-all-collections':
      window.logger.debug('collection store got all collections')
      let { cols } = action
      let collections = {}, colNames = []
      cols.forEach(col => {
        let { crawls } = col
        crawls = crawls.map(r => new ColCrawlInfo(r))
        crawls.sort((r1, r2) => r1.compare(r2))
        col.crawls = crawls
        col.metadata = Map(col.metadata)
        colNames.push(col.colName)
        collections[ col.colName ] = col
      })
      return state.set('collections', Map(collections)).set('colNames', List(colNames))
    case 'created-collection':
      let { col } = action
      return state.mergeDeep({
        'collections': { [col.colName]: col }
      }).set('colNames', state.get('colNames').push(col.colName))
    case 'added-warcs-to-col':
      let {forCol, count} = action
      return state.updateIn(['collections', forCol, 'numArchives'], archiveCount => archiveCount + count)
    case ADD_METADATA_TO_COLLECTION:
      let { mdata, forCol } = action
      return state.updateIn(['collections', forCol, 'metadata'], metadata => {
        let meta = {}
        mdata.forEach(m => {
          let split = m.split('=')
          meta[ split[ 0 ] ] = S(split[ 1 ]).replaceAll('"', '').s
        })
        return metadata.merge(meta)
      })
    default:
      return state
  }
}

