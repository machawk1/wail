import moment from 'moment'

const fromTwitterDate = (date) => moment(date, 'dd MMM DD HH:mm:ss ZZ YYYY', 'en')

export default class Extractor {
  constructor () {
    this.now = moment()
  }

  shouldExtract (tweet) {
    return true
  }

  tweetIsAfterStart (tweet) {
    return fromTwitterDate(tweet.created_at).isSameOrAfter(this.now)
  }

  extract (tweet) {
    return `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`
  }
}
