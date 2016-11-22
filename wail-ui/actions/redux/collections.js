import {ipcRenderer as ipc, remote} from 'electron'
import wailConstants from '../../constants/wail-constants'
import {CollectionEvents} from '../../constants/wail-constants'
import * as notify from '../notification-actions'
const {
  GET_COLLECTIONS,
  CREATE_NEW_COLLECTION,
  GET_COLLECTION_NAMES,
  QUEUE_MESSAGE
} = wailConstants.EventTypes
const {
  GOT_ALL_COLLECTIONS,
  CREATED_COLLECTION,
  ADD_METADATA_TO_COLLECTION,
  ADDED_WARCS_TO_COLL
} = CollectionEvents

const settings = remote.getGlobal('settings')
let defForCol = 'default'
if (process.env.NODE_ENV === 'development') {
  defForCol = 'Wail'
}

// ipc.on('got-all-collections', (event, ac) => {
//   console.log('got all collections', ac)
//   let {
//     cols,
//     wasError
//   } = ac
//
//   if (wasError) {
//     console.error(wasError)
//     window.logger.error({ err: ac.err, msg: 'got all collections error' })
//     // notify.notifyError('Error loading all collections this is fatal')
//     dispatch(notify.notifyError('Error loading all collections this is fatal'))
//   } else {
//     window.logger.debug('collection store got all collections')
//     dispatch({
//       type: 'got-all-collections',
//       cols
//     })
//   }
// })

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

export function addedWarcs (event, update) {
  window.logger.debug('collection store got all collections')
  return {
    type: ADDED_WARCS_TO_COLL,
    ...update
  }
}

export function addedNewCol (event, col) {
  return {
    type: 'added-new-collection',
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

