import 'babel-polyfill'
import { remote, ipcRenderer as ipc } from 'electron'
import CrawlManager from '../../../wail-core/managers/crawlManager'

const crawlMan = window.cm = new CrawlManager()

ipc.on('makeHeritrixJobConf', (event, confDetails) => {
  console.log('managers makeHeritrixJobConf', confDetails)
  crawlMan.makeCrawlConf(confDetails)
    .then(conf => {
      console.log('makeConfThen')
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
  console.log('crawl man got get-all-runs')
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

ipc.on('are-crawls-running', (event) => {
  crawlMan.areCrawlsRunning()
    .then((areRunning) => {
      if (areRunning) {
        ipc.send('yes-crawls-running')
      } else {
        ipc.send('no-crawls-running')
      }
    })
})

crawlMan.initialLoad()
  .then(crawls => {
    ipc.send('crawlMan-initial-load', crawls)
  })
  .catch(error => {

  })

