import EventEmitter from 'eventemitter3'
import autobind from 'autobind-decorator'
import { shell, remote } from 'electron'
import UrlDispatcher from '../dispatchers/url-dispatcher'
import GMessageDispatcher from '../dispatchers/globalMessageDispatcher'
import wailConstants from '../constants/wail-constants'
import S from 'string'
import * as urlActions from '../actions/archive-url-actions'

const settings = remote.getGlobal('settings')
const EventTypes = wailConstants.EventTypes

class UrlStore_ extends EventEmitter {
  constructor () {
    super()
    this.urlMemento = { url: S(''), mementos: -1, inArchive: false }
  }

  /*
   CHECK_URI_IN_ARCHIVE: null,
   VIEW_ARCHIVED_URI: null,
   */

  @autobind
  handleEvent (event) {
    // console.log('Got an event url store', event)
    switch (event.type) {
      case EventTypes.EMPTY_URL: {
        // let makeEmpty = this.urlMemento.url
        // makeEmpty.setValue('')
        // this.urlMemento = { url: makeEmpty, mementos: -1, inArchive: false }
        this.urlMemento.url.setValue('')
        this.urlMemento.mementos = -1
        this.urlMemento.inArchive = false
        this.emit('emptyURL')
        break
      }
      case EventTypes.HAS_VAILD_URI: {
        if (this.urlMemento.url.s !== event.url) {
          this.urlMemento.url.setValue(event.url)
          // console.log(`url updated ${event.url}`)
          this.emit('url-updated')
        }
        break
      }
      case EventTypes.GOT_MEMENTO_COUNT: {
        // console.log('Got Memento count in store', event)
        this.urlMemento.mementos = event.mementos
        this.emit('memento-count-updated')
        GMessageDispatcher.dispatch({
          type: EventTypes.QUEUE_MESSAGE,
          message: `The memento count for ${event.url} is: ${this.urlMemento.mementos}`
        })
        break
      }
      case EventTypes.GET_MEMENTO_COUNT: {
        urlActions.askMemgator(this.urlMemento.url.s)
        this.emit('memento-count-fetch')
        GMessageDispatcher.dispatch({
          type: EventTypes.QUEUE_MESSAGE,
          message: `Getting the memento count for ${this.urlMemento.url.s}`
        })
        break
      }

      case EventTypes.CHECK_URI_IN_ARCHIVE: {
        if (!this.urlMemento.url.isEmpty()) {
          GMessageDispatcher.dispatch({
            type: EventTypes.QUEUE_MESSAGE,
            message: `Checking if ${this.urlMemento.url.s} is in the archive`
          })
          urlActions.checkUriIsInArchive(this.urlMemento.url.s)
            .then(wasIn => {
              let message
              if (wasIn.inArchive) {
                message = `The URL ${wasIn.url} is in the archive`
              } else {
                message = `The URL ${wasIn.url} is not in the archive`
              }
              GMessageDispatcher.dispatch({
                type: EventTypes.QUEUE_MESSAGE,
                message
              })
            })
            .catch(err => {
              console.log('There was an error when checking if the url is in archive', err)
            })
        }
        break
      }
      case EventTypes.VIEW_ARCHIVED_URI: {
        if (!this.urlMemento.url.isEmpty()) {
          GMessageDispatcher.dispatch({
            type: EventTypes.QUEUE_MESSAGE,
            message: `Viewing archived version of: ${this.urlMemento.url.s}`
          })
          shell.openExternal(`${settings.get('wayback.uri_wayback')}*/${this.urlMemento.url.s}`)
        }
        break
      }
    }
  }

  @autobind
  getUrl () {
    return this.urlMemento.url
  }

  @autobind
  getMementoCount () {
    return this.urlMemento.mementos
  }

}

const UrlStore = new UrlStore_()

UrlDispatcher.register(UrlStore.handleEvent)
export default UrlStore
