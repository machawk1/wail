import createIpc from 'redux-electron-ipc'
import { addedNewCol, addedWarcs, gotAllCollections, crawlToCol } from '../actions/collections'
import { gotAllRuns, madeJobConf, buildDialogueCrawlJob, crawlJobUpdate, handledRequest } from '../actions/heritrix'
import { serviceStarted, serviceKilled, restartedWayback } from '../actions/services'
import { wailCrawlUpdate } from '../actions/wailCrawl'
import { ipcChannels } from '../../wail-core/globalStrings'

export default createIpc({
  /* collection store */
  [ipcChannels.GOT_ALL_COLLECTIONS]: gotAllCollections,
  [ipcChannels.CRAWL_TO_COLLECTION]: crawlToCol,
  [ipcChannels.CREATED_COLLECTION]: addedNewCol,
  [ipcChannels.ADDED_WARCS_TO_COL]: addedWarcs,
  /* crawl store */
  [ipcChannels.GOT_ALL_RUNS]: gotAllRuns,
  [ipcChannels.MADE_HERITRIX_JOBCONF]: madeJobConf,
  [ipcChannels.CRAWLJOB_STATUS_UPDATE]: crawlJobUpdate,
  [ipcChannels.CRAWLJOB_CONFIGURE_DIALOGUE]: buildDialogueCrawlJob,
  /* service store */
  [ipcChannels.SERVICE_STARTED]: serviceStarted,
  [ipcChannels.SERVICE_KILLED]: serviceKilled,
  [ipcChannels.RESTARTED_WAYBACK]: restartedWayback,
  /* requests */
  [ipcChannels.HANDLED_REQUEST]: handledRequest,
  /* wail crawl update */
  [ipcChannels.WAIL_CRAWL_UPDATE]: wailCrawlUpdate
})
