import EventEmitter from 'eventemitter3'
import autobind from 'autobind-decorator'
import { shell, remote } from 'electron'
import UrlDispatcher from '../dispatchers/url-dispatcher'
import GMessageDispatcher from '../dispatchers/globalMessageDispatcher'
import MemgatorDispatcher from '../dispatchers/memgatorDispatcher'
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
    console.log('Got an event url store', event)
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
        console.log('hasValidUrl')
        if (this.urlMemento.url.s !== event.url) {
          this.urlMemento.url.setValue(event.url)
          console.log('adding url in urlStore', event.url)
          // console.log(`url updated ${event.url}`)
          MemgatorDispatcher.dispatch({
            type: EventTypes.GET_MEMENTO_COUNT,
            url: event.url
          })
          this.emit('url-updated')
        } else {
          console.log(`crawlStore has valid url url.s === event.url ${this.urlMemento.url} === ${event.url} `)
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
        // urlActions.askMemgator(this.urlMemento.url.s)
        // this.emit('memento-count-fetch')
        // GMessageDispatcher.dispatch({
        //   type: EventTypes.QUEUE_MESSAGE,
        //   message: `Getting the memento count for ${this.urlMemento.url.s}`
        // })
        break
      }

      case EventTypes.CHECK_URI_IN_ARCHIVE: {
        if (!this.urlMemento.url.isEmpty()) {
          urlActions.checkUriIsInArchive(this.urlMemento.url.s)
        } else {
          GMessageDispatcher.dispatch({
            type: EventTypes.QUEUE_MESSAGE,
            message: 'You must enter a url first to check if it is in the archive'
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
          shell.openExternal(`${settings.get('pywb.url')}/Wail/*/${this.urlMemento.url.s}`)
        } else {
          GMessageDispatcher.dispatch({
            type: EventTypes.QUEUE_MESSAGE,
            message: 'You must enter a url first and it be in the archive for you to view it'
          })
        }
        break
      }
    }
  }

  @autobind
  getUrl () {
    return S(this.urlMemento.url.s)
  }

  @autobind
  getMementoCount () {
    return this.urlMemento.mementos
  }

}

const UrlStore = new UrlStore_()

UrlDispatcher.register(UrlStore.handleEvent)
export default UrlStore
