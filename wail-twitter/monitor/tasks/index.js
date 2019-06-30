import UserTimeLine from './userTimeline'
import TextSearch from './textSearch'
import TimeLineExtractor from '../../extractors/timelineExtractor'
import HashTagExtractor from '../../extractors/hashTagExtractor'

const makeExtractor = extractor => {
  switch (extractor.type) {
    case 'TimeLine':
      return new TimeLineExtractor()
    case 'HashTags':
      return new HashTagExtractor(extractor.hts)
  }
}

const makeTask = (config, twitterClient) => {
  switch (config.taskType) {
    case 'UserTimeLine':
      return new UserTimeLine({
        twitterClient,
        ...config
      })
    case 'TextSearch':
      return new TextSearch({
        twitterClient,
        ...config
      })
  }
}

export default makeTask
