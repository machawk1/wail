import createIpc from 'redux-electron-ipc'
import {addedNewCol,addedWarcs,gotAllCollections} from '../actions/redux/collections'
import {gotAllRuns,madeJobConf,buildDialogueCrawlJob,crawlJobUpdate} from '../actions/redux/heritrix'
import {notify} from '../actions/redux/notifications'

export default createIpc({
  /* collectionStore */
  'got-all-collections': gotAllCollections,
  'created-collection': addedNewCol,
  'added-warcs-to-col': addedWarcs,
  /*crawl store*/
  'got-all-runs': gotAllRuns,
  'made-heritrix-jobconf': madeJobConf,
  'crawljob-status-update': crawlJobUpdate,
  'crawljob-configure-dialogue': buildDialogueCrawlJob,
  /* global message store*/
  'display-message': notify
})