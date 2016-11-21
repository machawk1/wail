import {Twitter} from '../../constants/wail-constants'
import {push} from 'react-router-redux'

// this is a thunk
const signedIntoTwitter = () => dispatch => {
  dispatch({
    type: Twitter.SIGNED_IN
  })
  dispatch(push('/twitter'))
}

export {
  signedIntoTwitter
}