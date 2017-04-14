import React, { Component, PropTypes } from 'react'
import { remote } from 'electron'
import { OAuth } from 'oauth'
import { send } from 'redux-electron-ipc'
import pure from 'recompose/pure'
import toggle from '../actions'

const wbviewString = `
<webview autosize minwidth="800" minheight="600" style="display:inline-flex; width:100%; height:100%;" id="lwv" src="about:blank" webpreferences="allowRunningInsecureContent" plugins></webview>
`

class LoginWebview extends Component {
  static contextTypes = {
    store: PropTypes.object.isRequired
  }

  constructor (...args) {
    super(...args)
    this.loaded = false
    this.wbReady = false
    this.webview = null
    let settings = remote.getGlobal('settings')
    this.consumerKey = settings.get('twitter.wailKey')
    this.consumerSecret = settings.get('twitter.wailSecret')
    this.oauth = new OAuth(
      'https://api.twitter.com/oauth/request_token',
      'https://api.twitter.com/oauth/access_token',
      this.consumerKey,
      this.consumerSecret,
      '1.0A',
      null,
      'HMAC-SHA1'
    )
  }

  componentDidMount () {
    this.loaded = true
    this.webview = document.getElementById('lwv')
    this.webview.addEventListener('did-stop-loading', (e) => {
      console.log('it finished loading')
      if (!this.wbReady) {
        console.log('we are loaded')
        this.wbReady = true
        this.startLoginProcess()
      }
    })
  }

  startLoginProcess () {
    this.oauth.getOAuthRequestToken((error, oauth_token, oauth_token_secret, results) => {
      if (error) {
        console.error(error)
        return
      }
      let loginUrl = `https://api.twitter.com/oauth/authenticate?force_login=${false};oauth_token=${oauth_token}`
      this.getAccessToken(oauth_token, oauth_token_secret, loginUrl)
    })
  }

  getAccessToken (oauth_token, oauth_token_secret, loginUrl) {
    let webContents = this.webview.getWebContents()
    let {store} = this.context
    webContents.on('will-navigate', (event, url) => {
      console.log('will nav', url)
      let matched = url.match(/\?oauth_token=([^&]*)&oauth_verifier=([^&]*)/)
      if (matched) {
        this.oauth.getOAuthAccessToken(oauth_token, oauth_token_secret, matched[2], (error, oauth_access_token, oauth_access_token_secret) => {
          if (error) {
            console.error(error)
            return
          }
          store.dispatch(send('twitter-login-success', {
            oauth_access_token: oauth_access_token,
            oauth_access_token_secret: oauth_access_token_secret
          }))
        })
      } else {
        store.dispatch(toggle())
      }
      event.preventDefault()
    })
    this.webview.loadURL(loginUrl)
  }

  render () {
    return (
      <div style={{width: 'inherit', height: 'inherit'}} dangerouslySetInnerHTML={{__html: wbviewString}} />
    )
  }
}

export default pure(LoginWebview)
