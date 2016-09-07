import 'babel-polyfill'
import {remote, ipcRenderer as ipc} from 'electron'
import {
  ArchiveManager,
  CrawlManager,
  constants
} from '../../wail-core'

const crawlMan = window.cm = new CrawlManager()
const archiveMan = window.am = new ArchiveManager()

ipc.on('makeHeritrixJobConf', (event, confDetails) => {
  console.log('managers makeHeritrixJobConf', confDetails)
  crawlMan.makeCrawlConf(confDetails)
    .then(conf => {
      console.log('makeConfThen')
      let { forCol } = conf
      return archiveMan.addCrawlInfo(forCol, conf)
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
    })
    .catch(error => {
      console.error('managers makeHeritrixJobConf catch error', error)
      ipc.send('made-heritrix-jobconf', {
        wasError: true,
        error
      })
    })
})

ipc.on('crawl-started', (event, jobId) => {
  crawlMan.crawlStarted(jobId)
})

ipc.on('get-all-runs', (event) => {
  console.log('managers got get-all-runs')
  crawlMan.getAllRuns()
    .then(runs => {
      ipc.send('got-all-runs', {
        wasError: false,
        runs
      })
    })
    .catch(error => {
      ipc.send('got-all-runs', {
        wasError: true,
        error
      })
    })
})

ipc.on('get-all-collections', (event) => {
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
