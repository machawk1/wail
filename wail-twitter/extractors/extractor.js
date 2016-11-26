import moment from '../../wail-core/util/momentWplugins'

export default class Extractor {
  constructor () {
    this.now = moment().startOf('hour')
  }

  shouldExtract (tweet) {
    return true
  }

  tweetIsAfterStart (tweet) {
    return this.now.isSameOrAfter(moment.fromTwitterDate(tweet.created_at))
  }

  extract (tweet) {
    return `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`
  }
}