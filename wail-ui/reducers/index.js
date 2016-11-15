import {
  combineReducers
} from 'redux-immutable'
import collections from './collectionReducer'
import crawls from './crawls'

const rootReducer = combineReducers({ collections, crawls })
export default rootReducer