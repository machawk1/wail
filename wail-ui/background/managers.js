import 'babel-polyfill'
import {remote, ipcRenderer as ipc} from 'electron'
import {
  CrawlManager,
  constants
} from '../../wail-core'

const crawlMan = new CrawlManager()

ipc.on('makeHeritrixJobConf', (event, confDetails) => {
  crawlMan.makeCrawlConf(confDetails)
    .then(conf => {

    })
    .catch(error => {

    })
})

ipc.on('get-all-runs', (event) => {
  crawlMan.getAllRuns()
    .then(runs => {

    })
    .catch(error => {

    })
})
