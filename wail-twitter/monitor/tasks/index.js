import UserTimeLine from './userTimeline'
import TimeLineExtractor from '../../extractors/timelineExtractor'
import HashTagExtractor from '../../extractors/hashTagExtractor'

const typeMap = {
  TimeLine: TimeLineExtractor,
  HashTag: HashTagExtractor
}

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
        extractor: makeExtractor(config.extractor),
        twitterClient,
        ...config
      })
  }
}

export default makeTask