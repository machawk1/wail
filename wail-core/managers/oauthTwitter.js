import assert from 'assert'
import { BrowserWindow } from 'electron'
import { OAuth } from 'oauth'

export default class AuthWindow {
  constructor({ key, secret }) {
    assert(key, 'OAuth Consumer Key is needed!')
    assert(secret, 'OAuth Consumer secret is needed!')
    this.consumerKey = key
    this.consumerSecret = secret
    this.window = null
    this.resolve = null
    this.reject = null
  }

  startRequest() {
    let authUrl = 'https://api.twitter.com/oauth/authenticate?oauth_token='
    let oauth = new OAuth(
      'https://api.twitter.com/oauth/request_token',
      'https://api.twitter.com/oauth/access_token',
      this.consumerKey,
      this.consumerSecret,
      '1.0A',
      null,
      'HMAC-SHA1'
    )

    let deferredPromise = new Promise((resolve, reject) => {
      let isResolved = false
      this.resolve = (value) => {
        if (isResolved) {
          return
        }

        isResolved = true
        resolve(value)
      }

      this.reject = (error)=> {
        if (isResolved) {
          return
        }

        isResolved = true
        reject(error)
      }
    })

    oauth.getOAuthRequestToken((error, oauth_token, oauth_token_secret, results) => {
      if (error) {
        this.reject(error)
        return
      }

      let url = authUrl + oauth_token
      this.getAccessToken(oauth, oauth_token, oauth_token_secret, url)
    })
    return deferredPromise
  }

  getAccessToken(oauth, oauth_token, oauth_token_secret, url) {
    this.window = new BrowserWindow({ width: 800, height: 600, webPreferences: {webSecurity: false},nodeIntegration: false })
    this.window.on('close', () => {
      this.reject(new Error('the window is closed before complete the authentication.'))
    })
    this.window.webContents.on('will-navigate', (event, url) => {
       console.log('will nav',url)
      let matched
      if (matched = url.match(/\?oauth_token=([^&]*)&oauth_verifier=([^&]*)/)) {
        oauth.getOAuthAccessToken(oauth_token, oauth_token_secret, matched[2], (error, oauth_access_token, oauth_access_token_secret) => {
          if (error) {
            this.reject(error)
            return
          }

          this.resolve({
            oauth_access_token: oauth_access_token,
            oauth_access_token_secret: oauth_access_token_secret,
          })
          this.window.close()
        })
      }

      event.preventDefault()
    })
    this.window.loadURL(url)
  }
}