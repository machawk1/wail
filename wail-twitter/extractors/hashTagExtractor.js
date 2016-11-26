import Extractor from './extractor'

export default class HashTagExtractor extends Extractor {
  constructor (hashTags) {
    super()
    this.hashTags = new Set(hashTags)
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
