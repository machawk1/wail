import {push} from 'react-router-redux'
import {LocationChange} from '../constants/wail-constants'

const changeLocation = (to) => {
  if (to === '/twitter') {
    return {
      type: LocationChange.CHECK_TWITTER
    }
  } else {
    return push(to)
  }
}

export default changeLocation
