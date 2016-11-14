import Immutable, {Map, List} from 'immutable'
import S from 'string'
import ColCrawlInfo from '../../wail-core/util/colCrawlInfo'
import wailConstants from '../constants/wail-constants'
import moment from 'moment'
const { ADD_METADATA_TO_COLLECTION } = wailConstants.EventTypes

export default  (state = Map(), action) => {
  console.log('in collections reducer', action)
  switch (action.type) {
    case 'got-all-collections':
      window.logger.debug('collection store got all collections')
      let { cols } = action
      let collections = {}
      cols.forEach(col => {
        col.lastUpdated = moment(col.lastUpdated)
        col.created = moment(col.created)
        collections[ col.colName ] = col
      })
      return state.merge(collections)
    case 'created-collection':
      let { col } = action
      col.lastUpdated = moment(col.lastUpdated)
      col.created = moment(col.created)
      return state.merge({
        [col.colName]: col
      })
    case 'added-warcs-to-col': {
      let { forCol, count } = action
      return state.updateIn([ forCol, 'numArchives' ], archiveCount => archiveCount + count)
    }
    case ADD_METADATA_TO_COLLECTION:
      let { mdata, forCol } = action
      return state.updateIn([ forCol, 'metadata' ], metadata => {
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

