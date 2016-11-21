import {push} from 'react-router-redux'
import wc from '../constants/wail-constants'
import {notifyError} from '../actions/notification-actions'
import {hashHistory} from 'react-router'
import {grabCaptures} from '../actions/archive-url-actions'
import {inArchive, notInArchive, checkingArchive} from '../actions/redux/archival'
import {CheckUrlEvents, EventTypes, LocationChange} from '../constants/wail-constants'
import heritrixRequestHandler from './heritrixRequestHandler'
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
        .catch(error => {
          return next(notInArchive(`${action.url} is not in ${action.forCol}`))
        })
    case LocationChange.CHECK_TWITTER:
      if (store.getState().get('twitter').get('userSignedIn')) {
        hashHistory.push('/twitter')
      } else {
        hashHistory.push('/twitter-signin')
      }
      break
    default:
      return heritrixRequestHandler(store, next, action)
  }
}

