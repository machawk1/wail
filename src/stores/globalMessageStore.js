import EventEmitter from 'eventemitter3'
import autobind from 'autobind-decorator'
import wailConstants from '../constants/wail-constants'
import GMessageDispatcher from '../dispatchers/globalMessageDispatcher'

const EventTypes = wailConstants.EventTypes

class globalMessageStore extends EventEmitter {
  constructor () {
    super()
    this.messageQ = []
  }

  @autobind
  handleEvent (event) {
    switch (event.type) {
      case EventTypes.QUEUE_MESSAGE:
        this.messageQ.push(event.message)
        break
    }
  }

  hasQueuedMessages () {
    return this.messageQ.length != 0
  }

  getMessage () {
    return this.messageQ.shift()
  }
}

const GMessageStore = new globalMessageStore()
//noinspection JSAnnotator
window.GMessageStore = GMessageStore
GMessageDispatcher.register(GMessageStore.handleEvent)
export default GMessageStore
