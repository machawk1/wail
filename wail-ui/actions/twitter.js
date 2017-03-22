import {Twitter} from '../constants/wail-constants'
import {push} from 'react-router-redux'

// this is a thunk
const signedIntoTwitter = () => ({
  type: Twitter.SIGNED_IN
})

export default signedIntoTwitter
