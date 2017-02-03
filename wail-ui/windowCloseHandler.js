import { remote } from 'electron'
import { Closing } from './constants/wail-constants'
import { launchWebUI } from './actions/heritrix'

const windowCloseHandler = store => e => {
  const areCrawlsRunning = store.getState().get('runningCrawls') > 0
  if (areCrawlsRunning) {
    const opts = {
      type: 'question',
      title: 'Crawls Are Running',
      message: 'Closing WAIL will terminate the running crawl(s). If you wish to stop please manually stop the running crawls and then exit WAIL. Is this something you wish to do?',
      buttons: ['Yes', 'No']
    }
    const shouldClose = remote.dialog.showMessageBox(remote.getCurrentWindow(), opts)
    if (shouldClose === 0) {
      launchWebUI()
    }
    e.returnValue = false
  }
}

export default windowCloseHandler
