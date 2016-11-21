import {combineReducers} from 'redux-immutable'
import {enableBatching} from 'redux-batched-actions'
import {filterActions} from 'redux-ignore'
import {reducer as form, actionTypes} from 'redux-form/immutable'
import {CollectionEvents, CrawlEvents, CheckUrlEvents, Header} from '../constants/wail-constants'
import collections from './collectionReducer'
import crawls from './crawls'
import checkUrl from './checkUrl'
import twitter from './twitter'

const rootReducer = enableBatching(combineReducers({
  collections: filterActions(collections, Object.values(CollectionEvents)),
  crawls: filterActions(crawls, Object.values(CrawlEvents)),
  form: filterActions(form, Object.values(actionTypes)),
  checkUrl: filterActions(checkUrl, Object.values(CheckUrlEvents)),
  twitter
}))

export default rootReducer
