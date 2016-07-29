import childProcess from 'child_process'
import rp from 'request-promise'
import { remote } from 'electron'
import util from 'util'
import UrlDispatcher from '../dispatchers/url-dispatcher'
import wailConstants from '../constants/wail-constants'

const settings = remote.getGlobal('settings')
const EventTypes = wailConstants.EventTypes
const logger = remote.getGlobal('logger')
const logString = 'archive-url-actions %s'
const logStringError = 'archive-url-actions error where[ %s ], stack[ %s ]'

export function checkUriIsInArchive (uri) {
  console.log('checking if uri is in archive',uri)
  return new Promise((resolve, reject) => {
    rp({ uri: `${settings.get('wayback.uri_wayback')}*/${uri}` })
      .then(response => {
        // POST succeeded...
        resolve({ inArchive: true, uri: uri })
      })
      .catch(err => {
        console.log('error in querying wayback', err)
        logger.error(util.format(logStringError, 'checkUriIsInArchive', err.stack))
        resolve({ inArchive: false, uri: uri })
      })
  })
}

export function getMementos (url) {
  UrlDispatcher.dispatch({
    type: EventTypes.GET_MEMENTO_COUNT,
    url: url,
  })
}

export function emptyURL () {
  UrlDispatcher.dispatch({
    type: EventTypes.EMPTY_URL
  })
}

export function urlUpdated (url) {
  UrlDispatcher.dispatch({
    type: EventTypes.HAS_VAILD_URI,
    url: url
  })
}

export async function askMemgator (url) {
  console.log('askingMemegator')
  childProcess.exec(`${settings.get('memgatorQuery')} ${url}`, (err, stdout, stderr) => {
    if (err) {
      let stack
      if (Reflect.has(err, 'stack')) {
        stack = `${stderr} ${err.stack}`
      } else {
        stack = `${stderr}`
      }
      logger.error(util.format(logStringError, `askMemgator ${stdout}`, stack))
    }
    let mementoCount = (stdout.match(/memento/g) || []).length
    UrlDispatcher.dispatch({
      type: EventTypes.GOT_MEMENTO_COUNT,
      url,
      mementos: mementoCount
    })
  })
}

