import childProcess from 'child_process'
import rp from 'request-promise'
import { remote, shell } from 'electron'
import util from 'util'
import UrlDispatcher from '../dispatchers/url-dispatcher'
import MemgatorDispatcher from '../dispatchers/memgatorDispatcher'
import GMessageDispatcher from '../dispatchers/globalMessageDispatcher'
import wailConstants from '../constants/wail-constants'

const settings = remote.getGlobal('settings')
const EventTypes = wailConstants.EventTypes
const logger = remote.getGlobal('logger')
const logString = 'archive-url-actions %s'
const logStringError = 'archive-url-actions error where[ %s ], stack[ %s ]'

export function checkUriIsInArchive (uri,forCol) {
  console.log('checking if uri is in archive', uri, forCol)

  GMessageDispatcher.dispatch({
    type: EventTypes.QUEUE_MESSAGE,
    message: {
      title: 'Info',
      level: 'info',
      message: `Checking if ${uri} is in the archive ${forCol}`,
      uid: `Checking if ${uri} is in the archive ${forCol}`,
    }
  })

  rp({
    uri: `${settings.get('pywb.url')}${forCol}-cdx?url=${uri}/*`,
    resolveWithFullResponse: true
  })
    .then(response => {
      // POST succeeded...
      if (response.statusCode === 200) {
        GMessageDispatcher.dispatch({
          type: EventTypes.QUEUE_MESSAGE,
          message: {
            title: 'Success',
            level: 'success',
            message: `${uri} is in the archive ${forCol}`,
            uid:  `${uri} is in the archive ${forCol}`,
            autoDismiss: 0,
            action: {
              label: `View in ${forCol}?`,
              callback() {
                shell.openExternal(`${settings.get('pywb.url')}${forCol}/*/${uri}`)
              }
            }
          }
        })
      } else {
        GMessageDispatcher.dispatch({
          type: EventTypes.QUEUE_MESSAGE,
          message: {
            title: 'Warning',
            level: 'warning',
            message: `${uri} is in the archive ${forCol}`,
            uid: `${uri} is in the archive ${forCol}`
          }
        })
      }

    })
    .catch(err => {
      console.log('error in querying wayback', err)
      logger.error(util.format(logStringError, 'checkUriIsInArchive', err.stack))
      GMessageDispatcher.dispatch({
        type: EventTypes.QUEUE_MESSAGE,
        message: {
          title: 'Error',
          level: 'error',
          message: `An internal error occurred while seeing if ${uri} is in the archive ${forCol}`,
          uid: `An internal error occurred while seeing if ${uri} is in the archive ${forCol}`
        }
      })
    })
}

export function getMementos (url) {
  UrlDispatcher.dispatch({
    type: EventTypes.GET_MEMENTO_COUNT,
    url: url
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

export async function askMemgator2 (url) {
  childProcess.exec(`${settings.get('memgatorQuery')} ${url}`, (err, stdout, stderr) => {
    if (err) {
      console.error(err)
      let stack
      if (Reflect.has(err, 'stack')) {
        stack = `${stderr} ${err.stack}`
      } else {
        stack = `${stderr}`
      }
      logger.error(util.format(logStringError, `askMemgator ${stderr}`, stack))
    } else {
      let mementoCount = (stdout.match(/memento/g) || []).length
      MemgatorDispatcher.dispatch({
        type: EventTypes.GOT_MEMENTO_COUNT,
        url,
        timemap: '',
        count: mementoCount
      })
    }
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

