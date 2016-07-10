import EventEmitter from 'eventemitter3'
import rp from 'request-promise'
import { remote } from 'electron'
import autobind from 'autobind-decorator'
import RequestDispatcher from '../dispatchers/RequestDispatcher'
import wc from '../constants/wail-constants'


const EventTypes = wc.EventTypes

class requestStore extends EventEmitter {
  constructor () {
    super()
    this.requestQ = []
    this.working = false
  }

  @autobind
  handleEvent (event) {
    switch (event.type) {
      case EventTypes.REQUEST:
        if (Array.isArray(event.message)) {
          Array.prototype.push.apply(this.requestQ, event.message)
        } else {
          this.requestQ.push(event.message)
        }
        if(!this.working) {
          this.working = true
          this.handleRequests()
        }
        break
    }
  }
  
  @autobind
  maybeMore() {
    if (this.requestQ.length > 0) {
      this.handleRequests()
    } else {
      this.working = false
    }
  }

  @autobind
  handleRequests(){
    let requestOpts = this.requestQ.shift()
    
    rp(requestOpts.options)
      .then(response => {
        requestOpts.success(response)
        this.maybeMore()
      })
      .catch(error => {
        requestOpts.error(error)
        this.maybeMore()
      })
  }
}

const RequestStore = new requestStore()

//noinspection JSAnnotator
window.RequestStore = RequestStore
RequestDispatcher.register(RequestStore.handleEvent)

export default RequestStore
