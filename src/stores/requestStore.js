import {ipcRenderer} from 'electron'
import autobind from 'autobind-decorator'
import moment from 'moment'
import RequestDispatcher from '../dispatchers/requestDispatcher'
import GMessageDispatcher from '../dispatchers/globalMessageDispatcher'
import wc from '../constants/wail-constants'

const EventTypes = wc.EventTypes
const RequestTypes = wc.RequestTypes

function heritrixKillCase (type, rType, havePending) {
  return (type === EventTypes.REQUEST_HERITRIX) && (rType === RequestTypes.KILL_HERITRIX && !havePending)
}

class RequestStore {
  constructor () {
    this.pendingRequests = new Map()
    this.duplicateRequests = new Map()
    this.working = false
    ipcRenderer.on('handled-request', this.requestHandled)
    // remote.getGlobal('')
  }

  accessibility (request, havePending) {
    console.log('Request store accessibility')
    // I do not want to have multiple pending accessibility requests
    if (havePending) {
      let stillPending = this.pendingRequests.get(request.from)
      if (!stillPending.startOnDown && request.startOnDown) {
        console.log('before swapping error callback for accessibility', stillPending)
        // swap error callbacks on the first one
        // stillPending[ 'error' ] = request.request.error
        stillPending.error = request.error
        console.log('after swapping error callback for accessibility', stillPending)
        this.pendingRequests.set(request.from, stillPending)
      }
    } else {
      // we have never seen this one before add it and send to requestDaemon
      console.log('Request store accessibility new accessibility request')
      this.pendingRequests.set(request.from, request)
      ipcRenderer.send('send-to-requestDaemon', {
        from: request.from,
        response: null,
        wasError: false,
        id: request.timeReceived.format(),
        opts: request.opts
      })
    }
  }

  addDuplicateOrSend (request, havePending) {
    console.log('Request store addDuplicateOrSend')
    if (havePending) {
      let duplicates
      console.log('Request store addDuplicateOrSend we have pending')
      if (this.duplicateRequests.has(request.from)) {
        console.log('Request store addDuplicateOrSend we have duplicates')
        duplicates = this.duplicateRequests.get(request.from)
      } else {
        console.log('Request store addDuplicateOrSend we do not have duplicates making it so')
        duplicates = []
      }
      duplicates.push(request)
      this.duplicateRequests.put(request.from, duplicates)
    } else {
      console.log('Request store addDuplicateOrSend we do not have duplicates adding pending and sending', request)
      this.pendingRequests.set(request.from, request)
      let toSend = {
        from: request.from,
        response: null,
        wasError: false,
        id: request.timeReceived.format(),
        opts: request.opts
      }
      console.log(toSend)
      ipcRenderer.send('send-to-requestDaemon', toSend)
    }
  }

  @autobind
  pendingRequest (request) {
    console.log('RequestStore got an incoming request', request)
    request.timeReceived = moment()
    let havePending = this.pendingRequests.has(request.from)
    if (request.rType === RequestTypes.ACCESSIBILITY) {
      console.log('Request store pendingRequest rType is accessibility')
      this.accessibility(request, havePending)
    } else {
      if (heritrixKillCase(request.type, request.rType, havePending)) {
        console.log('Request store pendingRequest is heritrix kill')
        this.pendingRequests.set(request.from, request)
        ipcRenderer.send('send-to-requestDaemon', {
          from: request.from,
          id: request.timeReceived.format(),
          hadToRetry: false,
          timeOutTwice: false,
          response: null,
          wasError: false,
          opts: request.opts
        })
      } else {
        console.log('Request store pendingRequest doing addDuplicateOrSend')
        this.addDuplicateOrSend(request, havePending)
      }
    }
  }

  @autobind
  requestHandled (event, handledRequest) {
    console.log('Request store we have a handledRequest', handledRequest)
    let areDuplicates = this.duplicateRequests.has(handledRequest.from)
    let pendingCompleted = this.pendingRequests.get(handledRequest.from)
    if (areDuplicates) {
      let duplicates = this.duplicateRequests.get(handledRequest.from)
      let request = duplicates.shift()
      console.log('Request store we have a handledRequest and there are duplicates the new pendingOne', request)
      this.pendingRequests.set(request.from, request)
      ipcRenderer.send('send-to-requestDaemon', {
        from: request.from,
        id: request.timeReceived.format(),
        response: null,
        wasError: false,
        opts: request.opts
      })
      if (duplicates.length > 0) {
        console.log('Request store we have a handledRequest and areDuplicates and there are more duplicates')
        this.duplicateRequests.set(handledRequest.from, duplicates)
      } else {
        this.duplicateRequests.delete(handledRequest.from)
        console.log('Request store we have a handledRequest and areDuplicates and there are no more duplicates')
      }
    } else {
      console.log('Request store we have a handledRequest and there are no duplicates')
      this.pendingRequests.delete(handledRequest.from)
    }

    if (handledRequest.wasError) {
      console.log('Request store we have a handledRequest with error')
      if (handledRequest.timeOutTwice) {
        GMessageDispatcher.dispatch({
          type: EventTypes.QUEUE_MESSAGE,
          message: `Technical reasons did not allow us to complete ${handledRequest.from}.\nAre the services up?`
        })
        console.log('we timed out twice and are not trying again')
      } else {
        pendingCompleted.error(handledRequest.response)
      }
    } else {
      console.log('Request store we have a handledRequest with success')
      pendingCompleted.success(handledRequest.response)
    }
  }
}

const requestStore = new RequestStore()

RequestDispatcher.register(requestStore.pendingRequest)

export default requestStore

/*
 class requestStore {
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
 */

