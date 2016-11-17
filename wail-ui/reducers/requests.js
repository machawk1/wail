import {RequestActions} from '../constants/wail-constants'
import {ipcRenderer as ipc} from 'electron'
import moment from 'moment'

const {
  MAKE_REQUEST,
  HANDLED_REQUEST,
} = RequestActions

const defState = {
  pendingRequests: new Map(),
  duplicateRequests: new Map()
}

const requests = (state = defState, action) => {
  switch (action.type) {
    case MAKE_REQUEST: {
      action.request.timeReceived = moment()
      let havePending = state.pendingRequests.has(action.from)
      if (havePending) {
        let duplicates
        if (state.duplicateRequests.has(action.from)) {
          duplicates = state.duplicateRequests.get(action.from)
        } else {
          duplicates = []
        }
        duplicates.push(action.from)
        state.duplicateRequests.set(action.from, duplicates)
        return state
      }
      state.pendingRequests.set(action.from, action.request)
      let toSend = {
        from: action.request.from,
        response: null,
        wasError: false,
        id: action.request.timeReceived.format(),
        opts: action.request.opts
      }
      ipc.send('send-to-requestDaemon', toSend)
      return state
    }
    case HANDLED_REQUEST: {
      let areDuplicates = state.duplicateRequests.has(action.handledRequest.from)
      if (areDuplicates) {
        let duplicates = state.duplicateRequests.get(action.handledRequest.from)
        let request = duplicates.shift()
        state.pendingRequests.set(request.from, request)
        ipc.send('send-to-requestDaemon', {
          from: request.from,
          id: request.timeReceived.format(),
          response: null,
          wasError: false,
          opts: request.opts
        })
        if (duplicates.length > 0) {
          state.duplicateRequests.set(action.handledRequest.from, duplicates)
        } else {
          state.duplicateRequests.delete(action.handledRequest.from)
        }
      } else {

        // console.log('Request store handledRequest before removing pending', statependingRequests)
        state.pendingRequests.delete(action.handledRequest.from)
      }
      return state
    }
    default:
      return state
  }

}
export default requests