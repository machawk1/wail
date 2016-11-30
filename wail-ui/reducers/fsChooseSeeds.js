import {Map} from 'immutable'
import S from 'string'
import makeCrawlInfoRecord from '../records/crawlInfoRecord'
import {AddSeedFromFsEvents} from '../constants/wail-constants'

const {
  ADD_SEED, ADDING_SEED, ADDING_SEED_DONE,
  ADDING_SEED_DONE_ERROR, RESET_ADD_SEED_MESSAGE
} = AddSeedFromFsEvents

export default (state = Map(), action) => {
  console.log('checkUrl Reducer', action)
  switch (action.type) {
    case CHECK_SEED:
      return state.set(action.warc, action.seed)
    case RESET_CHECK_SEED:
      return Map()
    default:
      return state
  }
}
