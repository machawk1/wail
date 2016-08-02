import EventEmitter from 'eventemitter3'
import autobind from 'autobind-decorator'
import { shell, remote } from 'electron'
import MemgatorDispatcher from '../dispatchers/memgatorDispatcher'
import GMessageDispatcher from '../dispatchers/globalMessageDispatcher'
import wailConstants from '../constants/wail-constants'
import MementoTableItem, { getNoMementos } from '../componets/basic/MementoTableItem'
import * as urlActions from '../actions/archive-url-actions'

const settings = remote.getGlobal('settings')
const EventTypes = wailConstants.EventTypes

class MemgatorStore_ extends EventEmitter {
  constructor () {
    super()
    this.mementos = new Map()
    this.countLast  = -2
  }

  @autobind
  lastCount() {
    return this.countLast
  }

  @autobind
  resetCountLast() {
    this.countLast = -2
  }

  @autobind
  getDataFor (url) {
    return this.mementos.get(url)
  }

  @autobind
  getCountFor (url) {
    if (!this.mementos.has(url)) {
      return -2
    } else {
      return this.mementos.get(url).count
    }
  }

  @autobind
  getMementos () {
    var ret = []
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
        this.emit('count-update',{
          count: event.count
        })
        this.countLast = event.count
        console.log(this.mementos)
        // this.emit(`${event.url}-count-gotten`, data)
        GMessageDispatcher.dispatch({
          type: EventTypes.QUEUE_MESSAGE,
          message: `The memento count for ${event.url} is: ${event.count}`
        })
        break
      }
      case EventTypes.GET_MEMENTO_COUNT: {

        if(!this.mementos.has(event.url)) {
          console.log('adding url', event.url)
          let data ={
            count: -1,
            timemap: '',
            maybeArray: false,
            jId: -1,
            archivalStatus: 'Not Started'
          }
          this.mementos.set(event.url, data)
          this.emit('count-update',{
            count: -1
          })
          this.countLast = -1

          urlActions.askMemgator2(event.url)
          GMessageDispatcher.dispatch({
            type: EventTypes.QUEUE_MESSAGE,
            message: `Getting the memento count for ${event.url}`
          })
        } else {
          let data = this.mementos.get(event.url)
          this.emit('count-update',{
            count: data.count
          })
          this.countLast = data.count
          console.log(this.mementos)
          // this.emit(`${event.url}-count-gotten`, data)
          GMessageDispatcher.dispatch({
            type: EventTypes.QUEUE_MESSAGE,
            message: `The memento count for ${event.url} is: ${data.count}`
          })
        }

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
          this.emit(`${event.urls}-archival-update`, 'Starting')
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
