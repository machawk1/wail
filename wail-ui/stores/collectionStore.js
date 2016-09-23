import autobind from 'autobind-decorator'
import EventEmitter from 'eventemitter3'
import { ipcRenderer as ipc, remote } from 'electron'
import S from 'string'
import CollectionDispatcher from '../dispatchers/collectionDispatcher'
import wailConstants from '../constants/wail-constants'
import ColCrawlInfo from '../../wail-core/util/colCrawlInfo'
import GMessageDispatcher from '../dispatchers/globalMessageDispatcher'
import * as notify from '../actions/notification-actions'
import { Schema, arrayOf, normalize } from 'normalizr'

const settings = remote.getGlobal('settings')
const {
  GET_COLLECTIONS,
  CREATE_NEW_COLLECTION,
  ADD_METADATA_TO_COLLECTION,
  GET_COLLECTION_NAMES,
  QUEUE_MESSAGE
} = wailConstants.EventTypes


let defForCol = 'default'
if (process.env.NODE_ENV === 'development') {
  defForCol = 'Wail'
}

class _CollectionStore extends EventEmitter {
  constructor () {
    super()
    this.collections = new Map()
    this.colNames = []
    ipc.on('got-all-collections', ::this.loadCollections)
    ipc.on('created-collection', ::this.addNewCol)
    ipc.on('added-warcs-to-col', ::this.addedWarcs)
  }

  loadCollections (event, ac) {
    console.log('collection store got all collections', ac)
    let collections = []
    let {
      cols,
      wasError
    } = ac
    if (wasError) {
      console.error(wasError)
      window.logger.error({err: ac.err, msg: 'got all collections error'})
      notify.notifyError('Error loading all collections this is fatal')
    } else {
      window.logger.debug('collection store got all collections')
      cols.forEach(col => {
        console.log(col)
        let { crawls } = col
        crawls = crawls.map(r => new ColCrawlInfo(col))
        crawls.sort((r1, r2) => r1.compare(r2))
        col.crawls = crawls
        collections.push(col)
        this.colNames.push(col.colName)
        this.collections.set(col.colName, col)
      })
      this.emit('got-all-collections', collections)
    }
  }

  addedWarcs (event, update) {
    if (update.wasError) {
      notify.notifyError(`Error updating warc count for collection ${update.forCol}`)
      window.logger.error({err: update.error, msg: `Error updating warc count for collection ${update.forCol}`})
    } else {
      let {
        forCol,
        count
      } = update
      let upDateMe = this.collections.get(forCol)
      window.logger.debug(`added warcs to ${forCol} with count ${count} `)
      notify.notifySuccess(`Added ${count} Warc/Arc Files To Collection ${forCol}`)
      upDateMe.numArchives += count
      this.collections.set(forCol, upDateMe)
      this.emit('updated-col', upDateMe)
    }
  }

  addNewCol (event, col) {
    console.log('added new collection',)
    this.collections.set(col.colName, col)
    this.colNames.push(col.colName)
    this.emit('added-new-collection', Array.from(this.collections.values()))
    GMessageDispatcher.dispatch({
      type: QUEUE_MESSAGE,
      message: {
        title: 'Success',
        level: 'success',
        autoDismiss: 0,
        message: `Created new collection ${col.colName}`,
        uid: `Created new collection ${col.colName}`
      }
    })
  }

  getColNames () {
    return this.colNames
  }

  getCollection(name) {
    return this.collections.get(name)
  }

  @autobind
  handleEvent (event) {
    let {
      type
    } = event
    switch (type) {
      case ADD_METADATA_TO_COLLECTION:
        let {
          mdata,
          forCol
        } = event
        ipc.send('add-metadata-to-col', { mdata, forCol })
        let collection = this.collections.get(forCol)
        let metadata = collection.metadata
        mdata.forEach(m => {
          let split = m.split('=')
          metadata[ split[ 0 ] ] = S(split[ 1 ]).replaceAll('"', '').s
        })
        collection.metadata = metadata
        this.collections.set(forCol, metadata)
        break
      case CREATE_NEW_COLLECTION:
        break
      case GET_COLLECTIONS:
        this.emit('have-collections', this.collections.values())
        break
      case GET_COLLECTION_NAMES:
        this.emit('collection-names', this.colNames)
        break
    }
  }
}

const CollectionStore = new _CollectionStore()
window.colStore = CollectionStore

CollectionDispatcher.register(CollectionStore.handleEvent)

export default CollectionStore
