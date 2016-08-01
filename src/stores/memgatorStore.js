import EventEmitter from 'eventemitter3'
import autobind from 'autobind-decorator'
import {joinStrings} from 'joinable'
import {shell, remote} from 'electron'
import MemgatorDispatcher from '../dispatchers/memgatorDispatcher'
import GMessageDispatcher from '../dispatchers/globalMessageDispatcher'
import wailConstants from '../constants/wail-constants'
import MementoTableItem, {getNoMementos} from '../componets/basic/MementoTableItem'
import * as urlActions from '../actions/archive-url-actions'

const settings = remote.getGlobal('settings')
const EventTypes = wailConstants.EventTypes

class MemgatorStore_ extends EventEmitter {
  constructor () {
    super()
    this.mementos = new Map()
  }

  @autobind
  getDataFor (url) {
    return this.mementos.get(url)
  }

  @autobind
  getMementos () {
    var ret = []
    //<ListItem key="no-items" primaryText={"No Urls"}/>
    if (this.mementos.size === 0) {
      ret.push(getNoMementos())
    } else {
      for (let [url, tmCount] of this.mementos.entries()) {
        ret.push(
          <MementoTableItem
            key={`mli-${url}`}
            url={url}
            count={tmCount.count}
            timemap={tmCount.timemap}
            archivalStatus={tmCount.archivalStatus}
            jId={tmCount.jId}
            maybeArray={tmCount.maybeArray}
          />
        )
      }
    }
    return ret
  }

  @autobind
  handleEvent (event) {
    console.log('Got an event url store', event)
    switch (event.type) {
      case EventTypes.GOT_MEMENTO_COUNT: {
        // console.log('Got Memento count in store', event)
        let data = this.mementos.get(event.url)
        data.count = event.count
        data.timemap = event.timemap
        this.mementos.set(event.url, data)
        console.log(this.mementos)
        this.emit(`${event.url}-count-gotten`,data)
        GMessageDispatcher.dispatch({
          type: EventTypes.QUEUE_MESSAGE,
          message: `The memento count for ${event.url} is: ${event.count}`
        })
        break
      }
      case EventTypes.GET_MEMENTO_COUNT: {
        console.log('adding url', event.url)
        this.mementos.set(event.url, {
          count: -1,
          timemap: '',
          maybeArray: false,
          jId: -1,
          archivalStatus: 'Not Started'
        })
        this.emit('added-url')
        urlActions.askMemgator2(event.url)
        GMessageDispatcher.dispatch({
          type: EventTypes.QUEUE_MESSAGE,
          message: `Getting the memento count for ${event.url}`
        })
        break
      }
      case EventTypes.BUILD_CRAWL_JOB: {
        if (!this.mementos.has(event.urls)) {
          this.mementos.set(event.url, {
            count: -2,
            timemap: '',
            maybeArray: event.maybeArray,
            jId: -1,
            archivalStatus: 'Starting'
          })
          this.emit('added-url')
          if (!event.maybeArray) {
            urlActions.askMemgator2(event.url)
          }
        } else {
          let data = this.mementos.get(this.event.urls)
          data.archivalStatus = 'Starting'
          this.mementos.set(event.urls, data)
          this.emit(`${event.urls}-archival-update`,'Starting')
        }
        break
      }
      case EventTypes.LAUNCHED_CRAWL_JOB: {

      }
    }
  }

}

const MemgatorStore = new MemgatorStore_()

MemgatorDispatcher.register(MemgatorStore.handleEvent)
export default MemgatorStore
