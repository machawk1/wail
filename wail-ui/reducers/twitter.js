import { Map } from 'immutable'
import { remote } from 'electron'
import { Twitter } from '../constants/wail-constants'
const settings = remote.getGlobal('settings')

const twitter = (state = Map({userSignedIn: settings.get('twitter.userSignedIn')}), action) => {
  switch (action.type) {
    case Twitter.SIGNED_IN:
      return state.set('userSignedIn', true)
    default:
      return state
  }
}

export default twitter
