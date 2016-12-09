import MonitorTask from './monitorTask'
import {Search} from 'js-search'

export default class TextSearch extends MonitorTask {
  constructor ({ twitterClient, account, dur, lookFor, configOpts}) {
    super(dur)
    this.twitterClient = twitterClient
    this.mostRecentTweet = null
    this.account = account
    this.firstTime = true
    this._search = new Search('id_str')
    this._search.addIndex('text')
    this._lookFor = lookFor
    this._fIds = new Set()
    this._configOpts = configOpts || {}
  }

  poll () {
    console.log('doing poll')
    let options = {
      'screen_name': this.account,
      'exclude_replies': 'true',
      ...this._configOpts
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
          let tweets = this.searchTweets(data)
          if (tweets.length > 0) {
            this.emit('tweets', tweets)
            this.stop()
          }
        }
      }
    })
  }

  arrayStrategy () {
    let found = []
    this._lookFor.forEach(lf => {
      this._search.search(lf).forEach(tweet => {
        if (!this._fIds.has(tweet.id_str)) {
          found.push(`https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`)
          this._fIds.add(tweet.id_str)
        }
      })
    })
    return found
  }

  termStrategy () {
    let found = []
    this._search.search(this._lookFor).forEach(tweet => {
      if (!this._fIds.has(tweet.id_str)) {
        found.push(`https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`)
        this._fIds.add(tweet.id_str)
      }
    })
    return found
  }

  searchTweets (tweets) {
    this._search.documents_ = []
    this._search.addDocuments(tweets)
    if (Array.isArray(this._lookFor)) {
      return this.arrayStrategy()
    } else {
      return this.termStrategy()
    }
  }
}
