import { uiActions } from '../../wail-core/globalStrings'
import WCrawlsRecord from '../records/wailCrawl'

export default function wailCrawlsReducer (state = new WCrawlsRecord(), action) {
  switch (action.type) {
    case uiActions.WAIL_CRAWL_TRACK:
      return state.track(action.crawl)
    case uiActions.WAIL_CRAWL_START:
      return state.started(action.update)
    case uiActions.WAIL_CRAWL_Q_INCREASE:
      return state.qIncrease(action.update)
    case uiActions.WAIL_CRAWL_FINISHED:
      return state.aCrawlFinished(action.update)
    default:
      return state
  }
}