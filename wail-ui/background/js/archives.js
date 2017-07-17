import 'babel-polyfill'
import { remote, ipcRenderer as ipc } from 'electron'
import Settings from '../../../wail-core/remoteSettings'
import ArchiveManager from '../../../wail-core/managers/archiveManager'
import { ipcMessages } from '../../constants/uiStrings'

const settings = new Settings()
settings.configure()

const archiveMan = window.am = new ArchiveManager(settings)
const notifSub = archiveMan.subscribeToNotifications((notif) => {
  console.log(notif)
  ipc.send('display-message', notif)
})

ipc.on('made-heritrix-jobconf', (event, confDetails) => {
  console.log('archive man makeHeritrixJobConf', confDetails)
  if (!confDetails.wasError) {
    archiveMan.addCrawlInfo(confDetails)
      .then(updated => {
        console.log(`archive man updated`, updated)
        ipc.send('crawl-to-collection', updated)
      })
      .catch(error => {
        console.log('update archiveMan failed', error)
        ipc.send('display-message', error.m)
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

ipc.on('addfs-warcs-to-col', (event, fsAdd) => {
  console.log('archives got addfs warcs', fsAdd)
  archiveMan.addWarcsFromFSToCol(fsAdd)
    .then(update => {
      let message = ipcMessages.addedToCollectionX(fsAdd.col)
      ipc.send('added-warcs-to-col', update)
      ipc.send('display-message', {
        title: ipcMessages.addedWarcOrArcFromFs,
        level: 'success',
        autoDismiss: 10,
        message,
        uid: message
      })
    })
    .catch(error => {
      ipc.send('display-message', error.m)
    })
})

ipc.on('add-warcs-to-col', (event, addMe) => {
  console.log('archive man got add warcs to col', addMe)
  archiveMan.addWarcsToCol(addMe)
    .then(update => {
      ipc.send('added-warcs-to-col', update)
    })
    .catch(error => {
      ipc.send('display-message', error.m)
    })
})

ipc.on('add-warcs-to-col-wcreate', (event, addMe) => {
  console.log('archive man got add warcs to col', addMe)
  archiveMan.addWarcsFromWCreate(addMe)
    .then(update => {
      let message
      let title
      let autoDismiss = 10
      if (addMe.type && addMe.type === 'twitter') {
        message = ipcMessages.archivedTweetToCollectionX(addMe.col)
        title = ipcMessages.wailCrawlFinished('po')
      } else {
        message = ipcMessages.addedWarcToCollectionX(addMe.col)
        if (addMe.type && addMe.type !== 'po') {
          message += `
          The initial seed has been added to your collection and 
          is ready to be replayed. WAIL will continue 
          to add additional pages as ${addMe.type} progresses. 
          `
          autoDismiss = 0
        }
        title = ipcMessages.wailCrawlFinished(addMe.type)
      }
      ipc.send('display-message', {
        title,
        level: 'success',
        autoDismiss,
        message,
        uid: message
      })
      ipc.send('added-warcs-to-col', update)
    })
    .catch(error => {
      ipc.send('display-message', error.m)
    })
})

ipc.on('create-collection', (event, nc) => {
  let {mdata} = nc
  archiveMan.createCollection(nc)
    .then((newCol) => {
      console.log('archiveman really did create the new collection', newCol)
      ipc.send('created-collection', newCol)
      return archiveMan.addInitialMData(nc.col, mdata)
        .then(() => {
          console.log('mdata was successfully added')
          let message = ipcMessages.addedMetadataToCollectionX(nc.col)
          ipc.send('display-message', {
            title: 'Info',
            level: 'info',
            message,
            uid: message
          })
        })
        .catch(error => {
          let message = ipcMessages.unableToAddMetadataToCollectionX(nc.col, error)
          ipc.send('display-message', {
            title: 'Error',
            level: 'error',
            autoDismiss: 0,
            message,
            uid: message
          })
        })
    })
    .catch((error) => {
      console.error(error)
      let message = ipcMessages.unableToCreateCollection(nc.col, error)
      ipc.send('display-message', {
        title: 'Error',
        level: 'error',
        autoDismiss: 0,
        message,
        uid: message
      })
    })
})

ipc.on('reindex-collection',(e,whichOne) => {
  archiveMan.justReindexCol(whichOne)
    .then(() => {
      ipc.send('restart-wayback')
    })
    .catch(error => {

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
