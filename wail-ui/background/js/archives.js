import 'babel-polyfill'
import { remote, ipcRenderer as ipc } from 'electron'
import ArchiveManager from '../../../wail-core/managers/archiveManager'
import constants from '../../../wail-core/constants'

const archiveMan = window.am = new ArchiveManager()

ipc.on('made-heritrix-jobconf', (event, confDetails) => {
  console.log('archive man makeHeritrixJobConf', confDetails)
  if (!confDetails.wasError) {
    let {
      forCol,
      conf
    } = confDetails
    archiveMan.addCrawlInfo(forCol, conf)
      .then(updated => {
        console.log(`archive man updated`, updated)
        ipc.send('crawl-to-collection', {
          wasError: false,
          forCol,
          conf
        })
      })
      .catch(error => {
        console.log('update archiveMan failed', error)
        ipc.send('crawl-to-collection', {
          wasError: true,
          error
        })
      })
  }
})

ipc.on('get-all-collections', (event) => {
  console.log('archiveman got get-all-collections')
  archiveMan.getAllCollections()
    .then(cols => {
      ipc.send('got-all-collections', {
        wasError: false,
        cols
      })
    })
    .catch(err => {
      ipc.send('got-all-collections', {
        wasError: true,
        err
      })
    })
})

ipc.on('add-metadata-to-col', (event, addMe) => {
  let {
    forCol,
    mdata
  } = addMe
  archiveMan.addMetadata(forCol, mdata)
    .then(numUpdate => {
      ipc.send('added-metadata-to-col', {
        wasError: false,
        numUpdate
      })
    })
    .catch(error => {
      ipc.send('added-metadata-to-col', {
        wasError: true,
        error
      })
    })
})

ipc.on('add-warcs-to-col', (event, addMe) => {
  console.log('archive man got add warcs to col', addMe)
  let {
    forCol,
    warcs
  } = addMe
  archiveMan.addWarcsToCol(forCol, warcs)
    .then(update => {
      ipc.send('added-warcs-to-col', {
        wasError: false,
        count: update.count,
        forCol
      })
    })
    .catch(error => {
      ipc.send('added-warcs-to-col', {
        wasError: true,
        forCol,
        error
      })
    })
})

ipc.on('create-collection', (event, nc) => {
  let {
    mdata
  } = nc
  archiveMan.createCollection(nc)
    .then((newCol) => {
      console.log('archiveman really did create the new collection', newCol)
      ipc.send('created-collection', newCol)
      return archiveMan.addInitialMData(nc.col, mdata)
        .then(() => {
          console.log('mdata was successfully added')
          ipc.send('display-message', {
            title: 'Info',
            level: 'info',
            message: `Added metadata for ${nc.col}`,
            uid: `Added metadata for ${nc.col}`
          })
        })
        .catch(error => {
          ipc.send('display-message', {
            title: 'Error',
            level: 'error',
            autoDismiss: 0,
            message: `Pywb was unable to add metadata for ${nc.col} because ${error}`,
            uid: `Pywb was unable to add metadata for ${nc.col} because ${error}`
          })
        })
    })
    .catch((error) => {
      console.error(error)
      ipc.send('display-message', {
        title: 'Error',
        level: 'error',
        autoDismiss: 0,
        message: `Creating new collection ${nc.col} for ${error}`,
        uid: `Creating new collection ${nc.col} for ${error}`
      })
    })
})

archiveMan.initialLoad()
  .then((loaded) => {
    console.log('archive man inital load')
    ipc.send('archiveMan-initial-load', {
      cols: loaded,
      wasError: false
    })
  })
  .catch(error => {
    ipc.send('archiveMan-initial-load-failed', error)
  })
