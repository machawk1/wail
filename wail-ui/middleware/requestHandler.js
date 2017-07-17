import checkSeed from '../util/checkSeed'
import { checkDone, checkDoneError, checkingUrl } from '../actions/archival'
import { CheckUrlEvents, EventTypes, LocationChange, AddSeedFromFsEvents } from '../constants/wail-constants'
import heritrixRequestHandler from './heritrixRequestHandler'
import { uiActions } from '../../wail-core/globalStrings'
import {justReIndexCol} from '../actions/wailCrawl'

const { CHECK_URL } = CheckUrlEvents

// curried the living daylights out of this
const requestHandler = store => next => action => {
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
    case uiActions.WAIL_CRAWL_FINISHED:
      if (action.update.parent) {
        justReIndexCol(action.update.forCol)
      }
      return next(action)
    default:
      return heritrixRequestHandler(store, next, action)
  }
}

export default requestHandler
