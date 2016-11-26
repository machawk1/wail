import UserTimeLine from './userTimeline'
import TimeLineExtractor from '../../extractors/timelineExtractor'

function makeTask (config, twitterClient) {
  return new UserTimeLine({
    ExtractorType: TimeLineExtractor,
    twitterClient,
    ...config
  })
}

export default makeTask