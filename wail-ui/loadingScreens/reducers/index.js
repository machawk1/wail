import {combineReducers} from 'redux-immutable'
import {enableBatching} from 'redux-batched-actions'

const rootReducer = enableBatching(combineReducers({
  checkUrl: filterActions(checkUrl, Object.values(CheckUrlEvents)),
  collections: filterActions(collections, Object.values(CollectionEvents)),
  form: filterActions(form, Object.values(actionTypes)),
  jobIds: filterActions(jobIds, jobIdFilter),
  runningCrawls: filterActions(runningCrawls, Object.values(RunningCrawlCounter)),
  runs: filterActions(runsReducer, Object.values(CrawlEvents)),
  serviceStatuses: filterActions(serviceStatuses, Object.values(ServiceEvents)),
  twitter: filterActions(twitter, Object.values(Twitter))
}))

export default rootReducer