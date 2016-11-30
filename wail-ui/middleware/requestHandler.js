import {hashHistory} from 'react-router'
import checkSeed from '../util/checkSeed'
import {checkDone, checkDoneError, checkingUrl} from '../actions/redux/archival'
import {checkingFSSeed, doSeedExtraction} from '../actions/redux/addSeedFromFs'
import {CheckUrlEvents, EventTypes, LocationChange, AddSeedFromFsEvents} from '../constants/wail-constants'
import heritrixRequestHandler from './heritrixRequestHandler'

const {
  ADD_SEED, ADDING_SEED, ADDING_SEED_DONE,
  ADDING_SEED_DONE_ERROR, RESET_ADD_SEED_MESSAGE
} = AddSeedFromFsEvents
const { CHECK_URL } = CheckUrlEvents

// curried the living daylights out of this
export default store => next => action => {
  switch (action.type) {
    case CHECK_URL:
      next(checkingUrl('Checking...'))
      return checkSeed(action.url)
        .then(results => {
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

