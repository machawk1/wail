// import {remote, ipcRenderer as ipc} from 'electron'
import MonitorTask from './monitorTask'
import Extractor from '../../extractors/extractor'

export default class UserTimeLineTask extends MonitorTask {
  constructor ({ twitterClient, account, dur, ExtractorType = Extractor }) {
    super(dur)
    this.twitterClient = twitterClient
    this.mostRecentTweet = null
    this.account = account
    this.extractor = new ExtractorType()
    this.firstTime = true
  }

  poll () {
    console.log('doing poll')
    let options = {
      'screen_name': this.account,
      'exclude_replies': 'true'
    }
    console.log(options)
    if (this.mostRecentTweet) {
      options.since_id = this.mostRecentTweet
    }
    this.twitterClient.getUserTimeline(options, (err, data, resp) => {
      if (err) {
        this.wasError(err)
      } else {
        console.log('userTimeline no errors', data)
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
        if (this.extractor.shouldExtract(tweet)) {
          tweets.push(this.extractor.extract(tweet))
        }
      })
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