import { Map } from 'immutable'
import { CHECKED_OS } from '../../constants'

export default (state = Map({ checkDone: false, os: '', arch: '' }), action) => {
  if (action.type === CHECKED_OS) {
    let { os, arch } = action
    return state.withMutations(tstate =>
      tstate.set('checkDone', true).set('os', os).set('arch', arch)
    )
  } else {
    return state
  }
}