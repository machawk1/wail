import { combineReducers } from 'redux-immutable'
import { enableBatching } from 'redux-batched-actions'
import { filterActions } from 'redux-ignore'
import { reducer as form, actionTypes } from 'redux-form/immutable'
import collections from './collectionReducer'
import runningCrawls from './runningCrawls'
import checkUrl from './checkUrl'
import twitter from './twitter'
import { runsReducer, jobIds } from './crawls'
import serviceStatuses from './serviceStatuses'
import wailCrawls from './wailCrawl'
import {
  CollectionEvents, CrawlEvents, CheckUrlEvents, ServiceEvents,
  Twitter, RunningCrawlCounter, JobIdActions
} from '../constants/wail-constants'
import { uiActions } from '../../wail-core/globalStrings'

const jobIdFilter = [CrawlEvents.GOT_ALL_RUNS, JobIdActions.ADD_ID, JobIdActions.REMOVE_ID]

const rootReducer = enableBatching(combineReducers({
  checkUrl: filterActions(checkUrl, Object.values(CheckUrlEvents)),
  collections: filterActions(collections, Object.values(CollectionEvents)),
  form: filterActions(form, Object.values(actionTypes)),
  jobIds: filterActions(jobIds, jobIdFilter),
  runningCrawls: filterActions(runningCrawls, Object.values(RunningCrawlCounter)),
  runs: filterActions(runsReducer, Object.values(CrawlEvents)),
  serviceStatuses: filterActions(serviceStatuses, Object.values(ServiceEvents)),
  twitter: filterActions(twitter, Object.values(Twitter)),
  wailCrawls: filterActions(wailCrawls, uiActions.wailCrawlReducerFilter)
}))

export default rootReducer
