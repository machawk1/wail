import Immutable from 'immutable'
import { JDK_INSTALL } from '../../constants'

const {INSTALL_PROCESS_ERROR, START_INSTALL} = JDK_INSTALL

export default (state = Immutable.Map({
  started: false,
  wasError: false,
  error: null,
  where: '',
  stderr: ''
}), action) => {
  console.log(action)
  switch (action.type) {
    case INSTALL_PROCESS_ERROR:
      return state.merge({wasError: true, ...action.report})
    case START_INSTALL:
      return state.set('started', true)
    default:
      return state
  }
}