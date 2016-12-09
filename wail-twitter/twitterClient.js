import Twit from 'twit'
import {remote, ipcRenderer as ipc} from 'electron'
import Promise from 'bluebird'

const setting = remote.getGlobal('settings')

export default class TwitterClient {
  constructor () {
    this.twit = null
    this.streams = {}
    this.currentOp = {}
    this._checkTwit()
    ipc.on('signed-into-twitter', ::this._checkTwit)
  }

  signIn (settingsVals) {
    if (!this.twit) {
      this.twit = new Twit({
        consumer_key: settingsVals.wailKey,
        consumer_secret: settingsVals.wailSecret,
        access_token: settingsVals.userToken,
        access_token_secret: settingsVals.userSecret,
        timeout_ms: 60 * 1000
      })
    }
  }

  _checkTwit () {
    if (!this.twit) {
      let twitter = setting.get('twitter')
      if (twitter.userSignedIn) {
        this.twit = new Twit({
          consumer_key: twitter.wailKey,
          consumer_secret: twitter.wailSecret,
          access_token: twitter.userToken,
          access_token_secret: twitter.userSecret,
          timeout_ms: 60 * 1000
        })
      } else {
        console.log('twitter user not signed in')
        // throw new Error('User Not Signed In')
      }
    }
  }

  _areWeDoingThis (whichOne) {
    return this.currentOp[ whichOne ] || false
  }

  _doingThis (whichOne, yeaNay) {
    this.currentOp[ whichOne ] = yeaNay
  }

  _sendResult (result, channel, action) {
    ipc.send(channel, {
      wasError: false,
      ...result
    })
    this._doingThis(action, false)
  }

  _sendError (error, channel, action) {
    ipc.send(channel, {
      wasError: true,
      error
    })
    this._doingThis(action, false)
  }

  _getRequest (api, opts) {
    return this.twit.get(api, opts)
  }

  getUserStream (opts = {}) {
    return this.twit.stream('user', opts)
  }

  getFriendsList (opts = {}) {
    this._checkTwit()
    return this.twit.get('friends/list', opts)
  }

  getUserTimeline (opts = {}, cb) {
    // user_timeline
    this._checkTwit()
    if (cb) {
      this.twit.get('statuses/user_timeline', opts, cb)
    } else {
      return this.twit.get('statuses/user_timeline', opts)
    }
  }

  getHomeTimeline (opts = {}, cb) {
    // statuses/home_timeline
    this._checkTwit()
    if (cb) {
      this.twit.get('statuses/home_timeline', opts, cb)
    } else {
      return this.twit.get('statuses/home_timeline', opts)
    }
  }

  getUserId (opts = {}, cb) {
    this._checkTwit()
    if (cb) {
      this.twit.get('users/lookup', opts, cb)
    } else {
      return this.twit.get('users/lookup', opts)
    }
  }

}
