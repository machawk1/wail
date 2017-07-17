import { uiActions } from '../../wail-core/globalStrings'
import { ipcRenderer } from 'electron'

export function wailCrawlUpdate (e, update) {
  return update
}

export function trackWailCrawl (crawl) {
  console.log(crawl)
  return {
    type: uiActions.WAIL_CRAWL_TRACK,
    crawl
  }
}

export function justReIndexCol (col) {
  ipcRenderer.send('reindex-collection', {col})
}