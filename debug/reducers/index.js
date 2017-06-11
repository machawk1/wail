import { combineReducers } from 'redux-immutable'
import { Map } from 'immutable'
import contz, { buttons } from '../constants'

const {WBV_READY, WENT_BACK_TO_LOGIN, LOGIN_BAD_UNPW, NO_OTHER_NAV, LOGED_IN} = contz

const bup = {message: 'Bad Username Or Password', buttonState: buttons.BACK_BUTTON}
const navDefault = {message: 'Logging In', buttonState: buttons.JUST_MESSAGE}
const noOtherNav = {
  message: 'You Have Navigated Away From Sign In Is Disabled. Please Return To Sign In',
  buttonState: buttons.RETURN_SIGNIN
}

const logedIn = {
  message: 'You Have Sucesfully Logged Into Twitter Through WAIL!. One Moment While WAIL Does Some Internal Work',
  buttonState: buttons.JUST_MESSAGE
}

const rootReducer = combineReducers({
  webview (state = Map({wbv: null, ready: false}), action) {
    switch (action.type) {
      case WBV_READY:
        return state.merge({
          wbv: action.wbv,
          ready: true
        })
      default:
        return state
    }
  },
  nav (state = Map(navDefault), action) {
    switch (action.type) {
      case LOGIN_BAD_UNPW:
        return state.merge(bup)
      case WENT_BACK_TO_LOGIN:
        return state.merge(navDefault)
      case NO_OTHER_NAV:
        return state.merge(noOtherNav)
      case LOGED_IN:
        return state.merge(logedIn)
      default:
        return state
    }
  }
})

export default rootReducer
