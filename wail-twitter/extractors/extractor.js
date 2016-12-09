import moment from 'moment'

const fromTwitterDate = (date) => moment(date, 'dd MMM DD HH:mm:ss ZZ YYYY', 'en')

export default class Extractor {
  constructor () {
    this.now = moment().startOf('hour')
  }

  shouldExtract (tweet) {
    return true
  }

  tweetIsAfterStart (tweet) {
    return this.now.isSameOrAfter(fromTwitterDate(tweet.created_at))
  }

  extract (tweet) {
    return `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`
  }
}
