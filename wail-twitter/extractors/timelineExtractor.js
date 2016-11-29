import Extractor from './extractor'

export default class TlExtractor extends Extractor {
  shouldExtract (tweet) {
    // return this.tweetIsAfterStart(tweet)
    return true
  }
}