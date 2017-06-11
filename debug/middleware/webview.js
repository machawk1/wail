import constz from '../constants'

const webviewMiddleware = store => next => action => {
  if (action.type === constz.GOT_CLIENT_TOKENS) {
    console.log('got the client token', action)
  } else {
    console.log(action)
    return next(action)
  }
}

export default webviewMiddleware
