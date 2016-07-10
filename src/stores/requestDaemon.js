import rp from 'request-promise'
import { remote } from 'electron'
import autobind from 'autobind-decorator'
import RequestDispatcher from '../dispatchers/requestDispatcher'
import wc from '../constants/wail-constants'


const EventTypes = wc.EventTypes

class requestDaemon {
  constructor () {
    this.requestQ = []
    this.working = false
  }

  @autobind
  handleEvent (event) {
    console.log("RequestStore got an incoming request",event)
    switch (event.type) {
      case EventTypes.REQUEST:
        if (Array.isArray(event.request)) {
          Array.prototype.push.apply(this.requestQ, event.request)
        } else {
          this.requestQ.push(event.request)
        }
        if(!this.working) {
          console.log("RequestStore we are not working but we are now")
          this.working = true
          this.handleRequests()
        } else {
          console.log("RequestStore we are currently working and will continue to do so")
        }
        break
    }
  }
  
  @autobind
  maybeMore() {
    console.log("Do we have more requests to process?")
    if (this.requestQ.length > 0) {
      console.log("Yes we do handling them")
      this.handleRequests()
    } else {
      console.log("No we do not. Waiting for more")
      this.working = false
    }
  }

  @autobind
  handleRequests(){
    let request = this.requestQ.shift()
    console.log("Handling a request",request)
    rp(request.opts)
      .then(response => {
        console.log("The request got a response")
        request.success(response)
        this.maybeMore()
      })
      .catch(error => {
        console.log("The request got an error but its error callback will handle")
        request.error(error)
        this.maybeMore()
      })
  }
}

const RequestDaemon = new requestDaemon()


RequestDispatcher.register(RequestDaemon.handleEvent)

export default RequestDaemon
