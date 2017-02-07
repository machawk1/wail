import MonitorTask from './monitorTask'

export default class UserTimeLineTask extends MonitorTask {
  constructor ({twitterClient, account, dur, extractor}) {
    super(dur)
    this.twitterClient = twitterClient
    this.mostRecentTweet = null
    this.account = account
    this.extractor = extractor
    this.firstTime = true
  }

  poll () {
    let options = {
      'screen_name': this.account,
      'exclude_replies': 'true'
    }
    if (this.mostRecentTweet) {
      options.since_id = this.mostRecentTweet
    }
    this.twitterClient.getUserTimeline(options, (err, data, resp) => {
      if (err) {
        this.wasError(err)
      } else {
        if (data.length > 0) {
          let tweets = this.doExtraction(data)
          if (tweets.length > 0) {
            this.emit('tweets', tweets)
          }
        }
        this.checkForStop()
      }
    })
  }

  doExtraction (data) {
    let tweets = []
    if (this.firstTime) {
      data.forEach(tweet => {
        this.isRecent(tweet)
      })
      data.forEach(tweet => {
        if (this.isRecent(tweet) && this.extractor.shouldExtract(tweet)) {
          tweets.push(this.extractor.extract(tweet))
        }
      })
      this.firstTime = false
    } else {
      data.forEach(tweet => {
        if (this.extractor.shouldExtract(tweet) && this.isRecent(tweet)) {
          tweets.push(this.extractor.extract(tweet))
        }
      })
    }
    return tweets
  }

  isRecent (tweet) {
    let didFindNewerTweet = tweet.id > (this.mostRecentTweet || 0)
    if (didFindNewerTweet) {
      this.mostRecentTweet = tweet.id
    }
    return didFindNewerTweet
  }

}
