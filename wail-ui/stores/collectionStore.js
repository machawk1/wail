import autobind from 'autobind-decorator'
import EventEmitter from 'eventemitter3'
import { ipcRenderer as ipc, remote } from 'electron'
import S from 'string'
import CollectionDispatcher from '../dispatchers/collectionDispatcher'
import wailConstants from '../constants/wail-constants'
import ColCrawlInfo  from '../../wail-core/util/colCrawlInfo'
import GMessageDispatcher from '../dispatchers/globalMessageDispatcher'

const settings = remote.getGlobal('settings')
const {
  GET_COLLECTIONS,
  CREATE_NEW_COLLECTION,
  ADD_METADATA_TO_COLLECTION,
  GET_COLLECTION_NAMES,
  QUEUE_MESSAGE
} = wailConstants.EventTypes
const From = wailConstants.From



class _CollectionStore extends EventEmitter {
  constructor () {
    super()
    this.collections = new Map()
    ipc.on('got-all-collections', ::this.loadCollections)
    ipc.on('created-collection', ::this.addNewCol)
  }


  loadCollections(event,ac) {
    console.log('collection store got all collections',ac)
    let collections = []
    let {
      cols: {
        docs
      },
      wasError
    } = ac
    if (wasError) {
      console.error(wasError)
    } else {
      docs.forEach(col => {
        console.log(col)
        let {crawls} = col
        crawls = crawls.map(r => new ColCrawlInfo(col))
        crawls.sort((r1,r2) => r1.compare(r2))
        col.crawls = crawls
        collections.push(col)
        this.collections.set(col.colName, col)
      })
      this.emit('got-all-collections', collections)
    }
  }

  addNewCol(event,col) {
    this.collections.set(col.colName, new ColCrawlInfo(col))
    this.emit('added-new-collection',Array.from(this.collections.values()))
    GMessageDispatcher.dispatch({
      type: QUEUE_MESSAGE,
      message: {
        title: 'Success',
        level: 'success',
        autoDismiss: 0,
        message: `Created new collection ${col.colName}`,
        uid:    `Created new collection ${col.colName}`,
      }
    })
  }

  getColNames () {
    return Array.from(this.collections.keys())
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
        ipc.send('add-metadata-to-col',{ mdata,forCol})
        let collection = this.collections.get(forCol)
        let metadata = collection.metadata
        mdata.forEach(m => {
          let split = m.split('=')
          metadata[ split[ 0 ] ] = S(split[ 1 ]).replaceAll('"', '').s
        })
        collection.metadata = metadata
        this.collections.set(forCol,metadata)
        break
      case CREATE_NEW_COLLECTION:
        break
      case GET_COLLECTIONS:
        this.emit('have-collections',this.collections.values())
        break
      case GET_COLLECTION_NAMES:
        this.emit('collection-names',this.collections.keys())
        break
    }
  }
}

const CollectionStore  = new _CollectionStore()
window.colStore = CollectionStore

CollectionDispatcher.register(CollectionStore.handleEvent)

export default CollectionStore
