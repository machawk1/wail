import { startLoginProcess } from '../actions'
import constz from '../constants'

export default function gotWebviewEpic (action$) {
  return action$.ofType(constz.GOT_CONTAINER_REF)
    .mergeMap(startLoginProcess)
}
