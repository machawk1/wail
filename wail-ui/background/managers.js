import 'babel-polyfill'
import { remote, ipcRenderer as ipc } from 'electron'
import {
  ArchiveManager,
  CrawlManager,
  constants
} from '../../wail-core'

const crawlMan = new CrawlManager()
const archiveMan = new ArchiveManager()

ipc.on('makeHeritrixJobConf', (event, confDetails) => {
  console.log('managers makeHeritrixJobConf',confDetails)
  crawlMan.makeCrawlConf(confDetails)
    .then(conf => {
      let {
        forCol,
        ...crawlInfo
      } = conf
      archiveMan.addCrawlInfo(forCol, crawlInfo)
        .then(updated => {
          console.log(`archive man updated`, updated)
        })
        .catch(error => {
          console.log('update archiveMan failed', error)
        })
    })
    .catch(error => {
      console.error('managers makeHeritrixJobConf catch error',error)
    })
})

ipc.on('crawl-started', (event, jobId) => {
  crawlMan.crawlStarted(jobId)
})

ipc.on('get-all-runs', (event) => {
  crawlMan.getAllRuns()
    .then(runs => {

    })
    .catch(error => {

    })
})
