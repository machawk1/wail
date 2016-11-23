import {hashHistory} from 'react-router'
import checkSeed from '../util/checkSeed'
import {checkDone, checkDoneError, checkingUrl} from '../actions/redux/archival'
import {CheckUrlEvents, EventTypes, LocationChange} from '../constants/wail-constants'
import heritrixRequestHandler from './heritrixRequestHandler'

const { CHECK_URL } = CheckUrlEvents

// curried the living daylights out of this
export default store => next => action => {
  switch (action.type) {
    case CHECK_URL:
      console.log(action)
      next(checkingUrl(`Checking ${action.url}`))
      return checkSeed(action.url)
        .then(results => {
          console.log(results)
          return next(checkDone(results))
        })
        .catch(errorReport => {
          return next(checkDone(errorReport))
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

