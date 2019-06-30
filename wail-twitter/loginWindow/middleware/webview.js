import { send } from 'redux-electron-ipc'
import { closeWindow, gotSigninKeys } from '../actions'
import constz from '../constants'

const webviewMiddleware = store => next => action => {
  console.log(action, action.type === constz.GOT_CLIENT_TOKENS)
  if (action.type === constz.GOT_CLIENT_TOKENS) {
    gotSigninKeys(action.tokens)
  } else if (action.type === constz.CANCELLED_LOGIN) {
    closeWindow()
  } else {
    return next(action)
  }
}

export default webviewMiddleware
