const uiActions = {
  WAIL_CRAWL_START: 'wail-crawl-started',
  WAIL_CRAWL_FINISHED: 'wail-crawl-finished',
  WAIL_CRAWL_TRACK: 'wail-crawl-track',
  WAIL_CRAWL_Q_INCREASE: 'wail-crawlq-increase',
  WAIL_CRAWL_Q_DECREASE: 'wail-crawlq-decrease'
}
uiActions.wailCrawlReducerFilter = [uiActions.WAIL_CRAWL_START, uiActions.WAIL_CRAWL_TRACK, uiActions.WAIL_CRAWL_FINISHED, uiActions.WAIL_CRAWL_Q_INCREASE, uiActions.WAIL_CRAWL_Q_DECREASE]

export default uiActions
