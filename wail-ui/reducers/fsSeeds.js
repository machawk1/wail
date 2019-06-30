import {Map} from 'immutable'
import S from 'string'
import makeCrawlInfoRecord from '../records/crawlInfoRecord'
import {AddSeedFromFsEvents} from '../constants/wail-constants'

const {
  ADD_SEED, ADDING_SEED, ADDING_SEED_DONE,
  SEED_CHECKED, ADDING_SEED_DONE_ERROR, RESET_ADD_SEED_MESSAGE
} = AddSeedFromFsEvents

export default (state = Map({ message: defaultM, checkingDone: false, warcSeeds: [], hadErrors: [] }), action) => {
  console.log('checkUrl Reducer', action)
  switch (action.type) {
    case ADDING_SEED:
      return state.withMutations(map => map.set('checkingDone', false).set('message', action.message))
    case ADDING_SEED_DONE:
      return state.withMutations(map =>
        map.set('message', defaultM).set('checkingDone', true)
          .set('warcSeeds', action.warcSeeds)
          .set('hadErrors', action.hadErrors)
      )
    case RESET_ADD_SEED_MESSAGE:
      return state.withMutations(map =>
        map.set('message', defaultM)
          .set('checkingDone', false)
          .set('warcSeeds', [])
          .set('hadErrors', [])
      )
    default:
      return state
  }
}
