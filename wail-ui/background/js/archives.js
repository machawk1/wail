import 'babel-polyfill'
import {remote, ipcRenderer as ipc} from 'electron'
import {
  ArchiveManager,
  constants
} from '../../../wail-core'

const archiveMan = window.am = new ArchiveManager()


ipc.on('made-heritrix-jobconf', (event, confDetails) => {
  console.log('archive man makeHeritrixJobConf', confDetails)
  if(!confDetails.wasError) {
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
