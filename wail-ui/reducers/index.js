import {
  combineReducers
} from 'redux-immutable'
import collections from './collectionReducer'
import colNames from './collectionNames'

const rootReducer = combineReducers({ collections })
export default rootReducer