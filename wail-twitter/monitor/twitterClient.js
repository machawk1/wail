import Twit from 'twit'
import {remote, ipcRenderer as ipc} from 'electron'
import Promise from 'bluebird'

const setting = remote.getGlobal('settings')

export default class TwitterClient {
  constructor () {
    this.twit = null
    this.streams = {}
    this.currentOp = {}
    ipc.on('signed-into-twitter', ::this.checkTwit())
  }

  checkTwit () {
    if (!this.twit) {
      let twitter = setting.get('twitter')
      this.twit = new Twit({ ...twitter, timeout_ms: 60 * 1000 })
    }
  }

  areWeDoingThis (whichOne) {
    return this.currentOp[ whichOne ] || false
  }

  doingThis (whichOne, yeaNay) {
    this.currentOp[ whichOne ] = yeaNay
  }

  getFriendsList () {
    this.checkTwit()
    if (!this.areWeDoingThis('friends/list')) {
      this.doingThis('friends/list', true)
      this.twit.get('friends/list')
        .then(result => {
          ipc.send('got-twitter-flist', {
            wasError: false,
            ...result
          })
          this.doingThis('friends/list', false)
        })
        .catch(error => {
          ipc.send('got-twitter-flist', {
            wasError: true,
            error
          })
          this.doingThis('friends/list', false)
        })
    }
  }

  getUserStream (opts = {}) {
    return this.twit.stream('user', opts)
  }

  getUserTimeline () {
    // user_timeline
    this.checkTwit()
    if (!this.areWeDoingThis('user_timeline')) {
      this.doingThis('user_timeline', true)
      this.twit.get('user_timeline')
        .then(result => {
          ipc.send('got-twitter-flist', {
            wasError: false,
            ...result
          })
          this.doingThis('friends/list', false)
        })
        .catch(error => {
          ipc.send('got-twitter-flist', {
            wasError: true,
            error
          })
          this.doingThis('friends/list', false)
        })
    }
  }

  getHomeTimeline () {
    // statuses/home_timeline
  }

}