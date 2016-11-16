import childProcess from 'child_process'
import rp from 'request-promise'
import {remote, shell} from 'electron'
import util from 'util'
import UrlDispatcher from '../dispatchers/url-dispatcher'
import MemgatorDispatcher from '../dispatchers/memgatorDispatcher'
import wailConstants from '../constants/wail-constants'
import * as notify from './notification-actions'
import cheerio from 'cheerio'
import S from 'string'
import moment from 'moment'

const settings = remote.getGlobal('settings')
const EventTypes = wailConstants.EventTypes
const logString = 'archive-url-actions %s'
const logStringError = 'archive-url-actions error where[ %s ], stack[ %s ]'

export function grabCaptures (uri, forCol) {
  // notify.notifyInfo(`Checking if ${uri} is in the archive ${forCol}`)
  // window.logger.debug(`Checking if ${uri} is in the archive ${forCol}`)
  return rp({
    method: 'GET',
    uri: `${settings.get('pywb.url')}${forCol}-cdx?url=${uri}`,
    resolveWithFullResponse: true
  }).then(response => {
    if (response.statusCode === 200) {
      let captures = []
      S(response.body).trim().lines()
        .forEach(line => {
          let [_,time,j] = line.split(' ')
          let { url } = JSON.parse(j)
          captures.push({
            url,
            time: moment(time, 'YYYYMMDDHHmmss').format('dddd, MMMM Do YYYY, h:mm:ss a'),
            wburl: `${settings.get('pywb.url')}${forCol}/${time}/${uri}`
          })
        })
      return captures
    } else {
      console.log('wtf why no 200', response)
    }
    return captures
  })
}

export function checkUriIsInArchive (uri, forCol) {
  console.log('checking if uri is in archive', uri, forCol)
  notify.notifyInfo(`Checking if ${uri} is in the archive ${forCol}`)
  window.logger.debug(`Checking if ${uri} is in the archive ${forCol}`)

  rp({
    method: 'HEAD',
    uri: `${settings.get('pywb.url')}${forCol}-cdx?url=${uri}/*`,
    resolveWithFullResponse: true
  })
    .then(response => {
      console.log(response)
      // POST succeeded...
      if (response.statusCode === 200) {
        window.logger.debug(`${uri} is in the archive ${forCol}`)
        notify.notify({
          title: 'Success',
          level: 'success',
          message: `${uri} is in the archive ${forCol}`,
          uid: `${uri} is in the archive ${forCol}`,
          autoDismiss: 0,
          action: {
            label: `View in ${forCol}?`,
            callback () {
              shell.openExternal(`${settings.get('pywb.url')}${forCol}/*/${uri}`)
            }
          }
        })
      } else {
        notify.notifyWarning(`${uri} is not in the archive ${forCol}`)
      }
    })
    .catch(err => {
      if (err.statusCode) {
        if (err.statusCode === 404) {
          notify.notifyWarning(`${uri} is not in the archive ${forCol}`)
        }
      } else {
        console.log('error in querying wayback', err)
        window.logger.error({ err: err, msg: 'error in querying wayback' })
        notify.notifyError(`An internal error occurred while seeing if ${uri} is in the archive ${forCol}`, true)
      }
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

