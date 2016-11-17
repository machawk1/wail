import {notify} from '../actions/redux/notifications'
import wc from '../constants/wail-constants'
import {grabCaptures} from '../actions/archive-url-actions'
import {inArchive, notInArchive, checkingArchive} from  '../actions/redux/archival'
import {CheckUrlEvents, EventTypes} from '../constants/wail-constants'
const {
  CHECKING_ARCHIVE,
  NOT_IN_ARCHIVE,
  IN_ARCHIVE,
  RESET_CHECK_MESSAGE,
  CHECK_URL
} = CheckUrlEvents

// curried the living daylights out of this
export default store => next => action => {
  switch (action.type) {
    case CHECK_URL:
      console.log(action)
      next(checkingArchive(`Checking if ${action.url} is in ${action.forCol}`))
      return grabCaptures(action.url, action.forCol)
        .then(captures => {
          console.log(captures)
          return next(inArchive(captures))
        })
        .catch(error => next(notInArchive(`${action.url} is not in ${action.forCol}`)))
    default:
      return next(action)
  }
}

