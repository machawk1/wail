import EventEmitter from 'eventemitter3'
import autobind from 'autobind-decorator'
import wailConstants from '../constants/wail-constants'
import GMessageDispatcher from '../dispatchers/globalMessageDispatcher'

const EventTypes = wailConstants.EventTypes

class GlobalMessageStore_ extends EventEmitter {
  constructor () {
    super()
    this.messageQ = []
  }

  @autobind
  handleEvent (event) {
    switch (event.type) {
      case EventTypes.QUEUE_MESSAGE:
        let lenBefore = this.messageQ.length
        this.messageQ.push(event.message)
        if (lenBefore === 0) {
          this.emit('new-message')
        }
        break
    }
  }

  hasQueuedMessages () {
    return this.messageQ.length !== 0
  }

  getMessage () {
    return this.messageQ.shift()
  }
}

const GMessageStore = new GlobalMessageStore_()
// noinspection JSAnnotator
window.GMessageStore = GMessageStore
GMessageDispatcher.register(GMessageStore.handleEvent)
export default GMessageStore
