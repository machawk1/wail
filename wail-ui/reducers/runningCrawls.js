import { RunningCrawlCounter } from '../constants/wail-constants'

const runningCrawls = (state = 0, action) => {
  switch (action.type) {
    case RunningCrawlCounter.INCREMENT:
      return state + 1
    case RunningCrawlCounter.DECREMENT:
      return state > 0 ? state - 1 : 0
    default:
      return state
  }
}

export default runningCrawls
