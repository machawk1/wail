import createIpc from 'redux-electron-ipc'
import {addedNewCol, addedWarcs, gotAllCollections, crawlToCol} from '../actions/collections'
import {gotAllRuns, madeJobConf, buildDialogueCrawlJob, crawlJobUpdate, handledRequest} from '../actions/heritrix'
import {serviceStarted, serviceKilled, restartedWayback} from '../actions/services'

export default createIpc({
  /* collection store */
  'got-all-collections': gotAllCollections,
  'crawl-to-collection': crawlToCol,
  'created-collection': addedNewCol,
  'added-warcs-to-col': addedWarcs,
  /* crawl store */
  'got-all-runs': gotAllRuns,
  'made-heritrix-jobconf': madeJobConf,
  'crawljob-status-update': crawlJobUpdate,
  'crawljob-configure-dialogue': buildDialogueCrawlJob,
  /* service store */
  'service-started': serviceStarted,
  'service-killed': serviceKilled,
  'restarted-wayback': restartedWayback,
  /* requests */
  'handled-request': handledRequest
})
