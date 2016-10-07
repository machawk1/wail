import autobind from 'autobind-decorator'
import EventEmitter from 'eventemitter3'
import { ipcRenderer as ipc, remote } from 'electron'
import S from 'string'
import ServiceDispatcher from '../dispatchers/service-dispatcher'
import FlatButton from 'material-ui/FlatButton'
import CrawlStore from './crawlStore'
import CollectionDispatcher from '../dispatchers/collectionDispatcher'
import wailConstants from '../constants/wail-constants'
import ColCrawlInfo from '../../wail-core/util/colCrawlInfo'
import GMessageDispatcher from '../dispatchers/globalMessageDispatcher'
import * as notify from '../actions/notification-actions'

const settings = remote.getGlobal('settings')
const {
  GET_COLLECTIONS,
  CREATE_NEW_COLLECTION,
  ADD_METADATA_TO_COLLECTION,
  GET_COLLECTION_NAMES,
  QUEUE_MESSAGE,
  WAYBACK_RESTART
} = wailConstants.EventTypes

const metadataTransform = (mdata) => {
  if (mdata) {
    let tmdata = {}
    mdata.forEach(md => {
      tmdata[ md.k ] = md.v
    })
    return tmdata
  } else {
    return mdata
  }
}

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
    ipc.on('updated-metadata', ::this.updatedMetadata)
  }

  updatedMetadata (e, update) {
    if (update.wasError) {
      let message = `Unable to update Metadata for ${update.forCol}`
      notify.notify({
        title: 'Error',
        level: 'Error',
        autoDismiss: 0,
        message,
        uid: message,
      })
      window.logger.error({ message, err: update.error })
    } else {
      let col = this.collections.get(update.forCol)
      col.metadata = metadataTransform(update.mdata)
      let message = `Updated ${update.forCol} Metadata`
      notify.notify({
        title: 'Success',
        level: 'success',
        autoDismiss: 0,
        message,
        uid: message,
      })
      window.logger.info(`updated-${update.forCol}-metadata`)
      this.emit(`updated-${update.forCol}-metadata`, col.metadata)
    }

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
      window.logger.error({ err: ac.err, msg: 'got all collections error' })
      notify.notifyError('Error loading all collections this is fatal')
    } else {
      window.logger.debug('collection store got all collections')
      cols.forEach(col => {
        console.log(col)
        let { crawls } = col
        crawls = crawls.map(r => new ColCrawlInfo(r))
        crawls.sort((r1, r2) => r1.compare(r2))
        col.crawls = crawls
        col.metadata = metadataTransform(col.metadata)
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
      window.logger.error({ err: update.error, msg: `Error updating warc count for collection ${update.forCol}` })
    } else {
      let {
        forCol,
        count
      } = update
      let upDateMe = this.collections.get(forCol)
      window.logger.debug(`added warcs to ${forCol} with count ${count} `)
      let message = `Added ${count} Warc/Arc Files To Collection ${forCol}`
      notify.notify({
        autoDismiss: 0,
        title: 'Success',
        level: 'success',
        message,
        uid: message,
        children: (
         <div>
           <p>To view this capture please restart wayback</p>
           <FlatButton label='Restart?' onTouchTap={() => ServiceDispatcher.dispatch({ type: WAYBACK_RESTART })}/>
         </div>
        )
      })
      notify.notifySuccess()
      upDateMe.numArchives += count
      this.collections.set(forCol, upDateMe)
      this.emit(`updated-${forCol}-warcs`, upDateMe.numArchives)
    }
  }

  addNewCol (event, col) {
    console.log('added new collection')
    col.metadata = metadataTransform(col.metadata)
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

  getCollection (name) {
    return this.collections.get(name)
  }

  getUniqueSeeds (name) {
    console.log('colstore get unique seeds', name)
    let colCrawls = CrawlStore.getCrawlsForCol(name)
    let uniqueSeeds = new Set()
    let len = colCrawls.length
    for (let i = 0; i < len; ++i) {
      if (Array.isArray(colCrawls [ i ].urls)) {
        colCrawls [ i ].urls.forEach(url => {
          if (!uniqueSeeds.has(url)) {
            uniqueSeeds.add(url)
          }
        })
      } else {
        if (!uniqueSeeds.has(colCrawls [ i ].urls)) {
          uniqueSeeds.add(colCrawls [ i ].urls)
        }
      }
    }
    return Array.from(uniqueSeeds)
  }

  getCrawlInfoForCol (name) {
    let runMap = new Map()
    let colRuns = CrawlStore.getCrawlsForCol(name)
    let rLen = colRuns.length
    for (let i = 0; i < rLen; ++i) {
      if (Array.isArray(colRuns[ i ].urls)) {
        colRuns[ i ].urls.forEach(url => {
          runMap.set(url, colRuns[ i ])
        })
      } else {
        runMap.set(colRuns[ i ].urls, colRuns[ i ])
      }

    }
    console.log('getCrawlInfoForCol', name)
    return runMap
  }

  getNumberOfArchives (name) {
    return this.getCollection(name).numArchives
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
