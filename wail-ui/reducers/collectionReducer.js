import Immutable from 'immutable'
import S from 'string'
import { CollectionEvents } from '../constants/wail-constants'
import moment from 'moment'
import isPlainObject from 'lodash/isPlainObject'
import * as notify from '../actions/notification-actions'
const {
  GOT_ALL_COLLECTIONS,
  CREATED_COLLECTION,
  ADD_METADATA_TO_COLLECTION,
  ADDED_WARCS_TO_COLL,
  CRAWL_TO_COLLECTION
} = CollectionEvents

const collectionReducer = (state = Immutable.Map(), action) => {
  console.log('in collections reducer', action)
  switch (action.type) {
    case GOT_ALL_COLLECTIONS:
      window.logger.debug('collection store got all collections')
      let {cols} = action
      let collections = {}
      if (Array.isArray(cols)) {
        cols.forEach(col => {
          col.lastUpdated = moment(col.lastUpdated)
          col.created = moment(col.created)
          col.seeds = col.seeds.map(s => {
            s.added = moment(s.added)
            s.lastUpdated = moment(s.lastUpdated)
            return s
          })
          collections[col.colName] = col
        })
      } else if (isPlainObject(cols)) {
        cols.lastUpdated = moment(cols.lastUpdated)
        cols.created = moment(cols.created)
        cols.seeds = cols.seeds.map(s => {
          s.added = moment(s.added)
          s.lastUpdated = moment(s.lastUpdated)
          return s
        })
        collections[cols.colName] = cols
      } else {
        notify.notifyError(`WAIL-UI received collections it was not expecting, received ${typeof cols}. Please file a bug report through the help menu of WAIL.`)
      }
      return state.merge(collections)
    case CREATED_COLLECTION:
      window.logger.debug('collection store got a new collection')
      let {col} = action
      col.lastUpdated = moment(col.lastUpdated)
      col.created = moment(col.created)
      return state.merge({
        [col.colName]: col
      })
    case ADDED_WARCS_TO_COLL: {
      console.log(action)
      let {col} = action
      col.lastUpdated = moment(col.lastUpdated)
      col.seeds = col.seeds.map(s => {
        s.added = moment(s.added)
        s.lastUpdated = moment(s.lastUpdated)
        return s
      })
      return state.mergeDeepIn([col.colName], col)
    }
    case CRAWL_TO_COLLECTION: {
      console.log(action)
      let {col} = action
      col.lastUpdated = moment(col.lastUpdated)
      col.seeds = col.seeds.map(s => {
        s.added = moment(s.added)
        s.lastUpdated = moment(s.lastUpdated)
        return s
      })
      return state.mergeDeepIn([col.colName], col)
    }
    case ADD_METADATA_TO_COLLECTION: {
      let {mdata, forCol} = action
      return state.updateIn([forCol, 'metadata'], metadata => {
        let meta = {}
        mdata.forEach(m => {
          let split = m.split('=')
          meta[split[0]] = S(split[1]).replaceAll('"', '').s
        })
        return metadata.merge(meta)
      })
    }
    default:
      return state
  }
}

export default collectionReducer
