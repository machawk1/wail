import {ipcRenderer as ipc, remote} from 'electron'
import {CollectionEvents} from '../constants/wail-constants'
import * as notify from './notification-actions'
const {
  GOT_ALL_COLLECTIONS,
  CREATED_COLLECTION,
  ADD_METADATA_TO_COLLECTION,
  ADDED_WARCS_TO_COLL,
  CRAWL_TO_COLLECTION
} = CollectionEvents

const settings = remote.getGlobal('settings')
let defForCol = 'default'
if (process.env.NODE_ENV === 'development') {
  defForCol = 'Wail'
}

export function gotAllCollections (event, ac) {
  let {
    cols,
    wasError
  } = ac

  if (wasError) {
    console.error(wasError)
    window.logger.error({ err: ac.err, msg: 'got all collections error' })
    // notify.notifyError('Error loading all collections this is fatal')
    return {
      type: GOT_ALL_COLLECTIONS,
      cols: []
    }
  } else {
    window.logger.debug('collection store got all collections')
    return {
      type: GOT_ALL_COLLECTIONS,
      cols
    }
  }
}

export function addedWarcs (event, col) {
  window.logger.debug('collection store got all collections')
  return {
    type: ADDED_WARCS_TO_COLL,
    col
  }
}

export function addedNewCol (event, col) {
  return {
    type: CREATED_COLLECTION,
    col
  }
}

export function addMetadata (mdata, forCol) {
  ipc.send('add-metadata-to-col', { mdata, forCol })
  return {
    type: ADD_METADATA_TO_COLLECTION,
    mdata,
    forCol
  }
}

export function crawlToCol (e, col) {
  return {
    type: CRAWL_TO_COLLECTION,
    col
  }
}

