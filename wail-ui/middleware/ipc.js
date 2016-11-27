import createIpc from 'redux-electron-ipc'
import {addedNewCol, addedWarcs, gotAllCollections, crawlToCol} from '../actions/redux/collections'
import {gotAllRuns, madeJobConf, buildDialogueCrawlJob, crawlJobUpdate, handledRequest} from '../actions/redux/heritrix'

export default createIpc({
  /* collectionStore */
  'got-all-collections': gotAllCollections,
  'crawl-to-collection': crawlToCol,
  'created-collection': addedNewCol,
  'added-warcs-to-col': addedWarcs,
  /* crawl store */
  'got-all-runs': gotAllRuns,
  'made-heritrix-jobconf': madeJobConf,
  'crawljob-status-update': crawlJobUpdate,
  'crawljob-configure-dialogue': buildDialogueCrawlJob,
  /* requests */
  'handled-request': handledRequest
})
