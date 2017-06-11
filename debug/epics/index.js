import { combineEpics } from 'redux-observable'
import { startLoginProcess } from '../actions'

function loginEpic (action$) {
  return action$.ofType('got-container-ref').mergeMap(startLoginProcess)
}

export default loginEpic
