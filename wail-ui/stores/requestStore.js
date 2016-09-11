import { ipcRenderer } from 'electron'
import autobind from 'autobind-decorator'
import moment from 'moment'
import RequestDispatcher from '../dispatchers/requestDispatcher'
import GMessageDispatcher from '../dispatchers/globalMessageDispatcher'
import wc from '../constants/wail-constants'
import util from 'util'

const EventTypes = wc.EventTypes
const RequestTypes = wc.RequestTypes

function heritrixKillCase (type, rType, havePending) {
  return (type === EventTypes.REQUEST_HERITRIX) && (rType === RequestTypes.KILL_HERITRIX && !havePending)
}

class RequestStore_ {
  constructor () {
    this.pendingRequests = new Map()
    this.duplicateRequests = new Map()
    this.working = false
    ipcRenderer.on('handled-request', this.requestHandled)
    // remote.getGlobal('')
  }

  @autobind
  accessibility (request, havePending) {
    // // console.log('Request store accessibility')
    // I do not want to have multiple pending accessibility requests
    if (havePending) {
      let stillPending = this.pendingRequests.get(request.from)
      // console.log('RequestStore accessibility have pending', this.pendingRequests)
      // console.log(util.inspect(this.pendingRequests,{depth: null, colors:true}))
      if (!stillPending.startOnDown && request.startOnDown) {
        // // console.log('before swapping error callback for accessibility', stillPending)
        // swap error callbacks on the first one
        // stillPending[ 'error' ] = request.request.error
        stillPending.error = request.error
        // // console.log('after swapping error callback for accessibility', stillPending)
        this.pendingRequests.set(request.from, stillPending)
        // console.log('RequestStore accessibility have pending adding', this.pendingRequests)
      }
    } else {
      // we have never seen this one before add it and send to requestDaemon
      // // console.log('Request store accessibility new accessibility request')
      this.pendingRequests.set(request.from, request)
      // console.log('RequestStore accessibility no have pending adding', this.pendingRequests)
      ipcRenderer.send('send-to-requestDaemon', {
        from: request.from,
        response: null,
        wasError: false,
        id: request.timeReceived.format(),
        opts: request.opts
      })
    }
  }

  @autobind
  addDuplicateOrSend (request, havePending) {
    // console.log(util.inspect(this.pendingRequests,{depth: null, colors:true}))
    if (havePending) {
      // console.log('RequestStore addDuplicateOrSend have pending', this.pendingRequests)
      let duplicates
      // // console.log('Request store addDuplicateOrSend we have pending')
      if (this.duplicateRequests.has(request.from)) {
        // // console.log('Request store addDuplicateOrSend we have duplicates')
        duplicates = this.duplicateRequests.get(request.from)
        // console.log('RequestStore addDuplicateOrSend have duplicate', this.duplicateRequests)
      } else {
        // // console.log('Request store addDuplicateOrSend we do not have duplicates making it so')
        duplicates = []
      }
      duplicates.push(request)
      this.duplicateRequests.set(request.from, duplicates)
      // console.log('RequestStore addDuplicateOrSend adding duplicate', this.duplicateRequests)
    } else {
      // // console.log('Request store addDuplicateOrSend we do not have duplicates adding pending and sending', request)
      // console.log('RequestStore addDuplicateOrSend no duplicate before adding pending', this.pendingRequests)
      this.pendingRequests.set(request.from, request)
      // console.log('RequestStore addDuplicateOrSend no duplicate after adding pending', this.pendingRequests)
      let toSend = {
        from: request.from,
        response: null,
        wasError: false,
        id: request.timeReceived.format(),
        opts: request.opts
      }
      // // console.log(toSend)
      ipcRenderer.send('send-to-requestDaemon', toSend)
    }
  }

  @autobind
  pendingRequest (request) {
    // // console.log('RequestStore got an incoming request', request)
    request.timeReceived = moment()
    let havePending = this.pendingRequests.has(request.from)
    if (request.rType === RequestTypes.ACCESSIBILITY) {
      // // console.log('Request store pendingRequest rType is accessibility')
      this.accessibility(request, havePending)
    } else {
      if (heritrixKillCase(request.type, request.rType, havePending)) {
        // // console.log('Request store pendingRequest is heritrix kill')
        // console.log('RequestStore pendingRequest hKill before add', this.pendingRequests)
        this.pendingRequests.set(request.from, request)
        // console.log('RequestStore pendingRequest hKill after add', this.pendingRequests)
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
        // // console.log('Request store pendingRequest doing addDuplicateOrSend')
        this.addDuplicateOrSend(request, havePending)
      }
    }
  }

  @autobind
  requestHandled (event, handledRequest) {
    // console.log('Request store we have a handledRequest', handledRequest)
    // console.log('Request handled showing pending and duplicates', this.pendingRequests, this.duplicateRequests)
    let areDuplicates = this.duplicateRequests.has(handledRequest.from)
    var pendingCompleted = this.pendingRequests.get(handledRequest.from)
    // console.log(pendingCompleted)
    if (areDuplicates) {
      let duplicates = this.duplicateRequests.get(handledRequest.from)
      let request = duplicates.shift()
      // // console.log('Request store we have a handledRequest and there are duplicates the new pendingOne', request)
      this.pendingRequests.set(request.from, request)
      ipcRenderer.send('send-to-requestDaemon', {
        from: request.from,
        id: request.timeReceived.format(),
        response: null,
        wasError: false,
        opts: request.opts
      })
      if (duplicates.length > 0) {
        // console.log('Request store we have a handledRequest and areDuplicates and there are more duplicates before add', this.duplicateRequests)
        this.duplicateRequests.set(handledRequest.from, duplicates)
        // console.log('Request store we have a handledRequest and areDuplicates and there are more duplicates after add', this.duplicateRequests)
      } else {
        // console.log('Request store we have a handledRequest and areDuplicates deleting duplicates before', this.duplicateRequests)
        this.duplicateRequests.delete(handledRequest.from)
        // console.log('Request store we have a handledRequest and areDuplicates deleting duplicates after', this.duplicateRequests)
        // // console.log('Request store we have a handledRequest and areDuplicates and there are no more duplicates')
      }
    } else {
      // console.log('Request store we have a handledRequest and there are no duplicates')
    }
    // // console.log(pendingCompleted)
    if (handledRequest.wasError) {
      // console.log('Request store handledRequest wasError pending', this.pendingRequests)
      // // console.log('Request store we have a handledRequest with error')
      if (handledRequest.timeOutTwice) {
        GMessageDispatcher.dispatch({
          type: EventTypes.QUEUE_MESSAGE,
          message: {
            title: 'Error',
            level: 'error',
            message: `Technical reasons did not allow us to complete ${handledRequest.from}.\nAre the services up?`,
            uid: `Technical reasons did not allow us to complete ${handledRequest.from}.\nAre the services up?`
          }
        })
        // // console.log('we timed out twice and are not trying again')
      } else {
        pendingCompleted.error(handledRequest.response)
      }
      // this.pendingRequests.delete(handledRequest.from)
    } else {
      // // console.log('Request store we have a handledRequest with success')
      // console.log('Request store handledRequest no Error pending', this.pendingRequests)
      // console.log('Showing pendingCompleted', pendingCompleted)
      pendingCompleted.success(handledRequest.response)
    }
    // console.log('Request store handledRequest before removing pending', this.pendingRequests)
    this.pendingRequests.delete(handledRequest.from)
    // console.log('Request store handledRequest after removing pending', this.pendingRequests)
  }
}

const RequestStore = new RequestStore_()
// noinspection JSAnnotator
window.RequestStore = RequestStore

RequestDispatcher.register(RequestStore.pendingRequest)

export default RequestStore
