import Extractor from './extractor'
import _ from 'lodash'

const htMap = ht => {
  if (ht.startsWith('#')) {
    return [ht, ht.substr(1)]
  }
  return ht
}

export default class HashTagExtractor extends Extractor {
  constructor (hashTags) {
    super()
    this.hashTags = new Set(_.flatMap(hashTags, htMap))
  }

  shouldExtract (tweet) {
    let tweetHTS = new Set(tweet.entities.hashtags.map(ht => ht.text))
    if (tweetHTS.size > 0) {
      return this.hashTags.intersection(tweetHTS).size > 0 && this.tweetIsAfterStart(tweet)
    } else {
      return false
    }
  }
}
