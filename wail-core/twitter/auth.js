import {BrowserWindow} from 'electron'
import fs from 'fs-extra'
import nodeTwitterApi from 'node-twitter-api'
import TwitterClient  from './twitter-client'

let authWindow = null

export default class Auth {
  static authorized (callback) {
    let token = Auth.defaultAccount()

    if (token && token[ 'accessToken' ]) {
      callback()
      return
    }

    new Auth((token) => {
      Auth.addToken(token, () => {
        callback()
      })
    })
  }

  static addToken (token, callback) {
    let twitterAuths = fs.readJsonSync(global.settings.get('twitter'))
    let tokens = twitterAuths.tokens
    tokens.push(token)
    JsonLoader.writeHome(this.ACCOUNTS_JSON, Auth.uniqTokens(tokens))
    callback()
  }

  static uniqTokens (tokens) {
    let names = []
    let uniqed = []

    for (let token of tokens) {
      if (names.indexOf(token[ 'screenName' ]) < 0) {
        uniqed.push(token)
        names.push(token[ 'screenName' ])
      }
    }
    return uniqed
  }

  static byScreenName (screenName) {
    for (let account of Auth.allAccounts()) {
      if (account[ 'screenName' ] === screenName) {
        return account
      }
    }
    return {}
  }

  static defaultAccount () {
    let accounts = Auth.allAccounts()

    if (accounts.length === 0) {
      return {}
    }
    return accounts[ 0 ]
  }

  static allAccounts () {
    return JsonLoader.readHome(this.ACCOUNTS_JSON) || []
  }

  static credentials () {
    return JsonLoader.read(this.CREDENTIALS_JSON)
  }

  constructor (callback) {
    let credentials = Auth.credentials()

    let nodeTwitterApi = new nodeTwitterApi({
      callback: 'http://example.com',
      consumerKey: credentials[ 'apiKey' ],
      consumerSecret: credentials[ 'apiSecret' ],
    })

    let klass = this

    nodeTwitterApi.getRequestToken((error, requestToken, requestTokenSecret) => {
      let oldWindow
      let url = nodeTwitterApi.getAuthUrl(requestToken)
      if (authWindow) {
        oldWindow = authWindow
      }

      authWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
          nodeIntegration: false,
        },
      })

      authWindow.webContents.on('will-navigate', (event, url) => {
        let matched = url.match(/\?oauth_token=([^&]*)&oauth_verifier=([^&]*)/)
        if (matched) {
          event.preventDefault()

          nodeTwitterApi.getAccessToken(requestToken, requestTokenSecret, matched[ 2 ], (error, accessToken, accessTokenSecret) => {
            if (error) {
              new Auth(callback)
            } else {
              let token = { accessToken: accessToken, accessTokenSecret: accessTokenSecret }
              let client = new TwitterClient(token)

              return client.verifyCredentials((user) => {
                token[ 'id_str' ] = user.id_str
                token[ 'screenName' ] = user.screen_name
                callback(token)
                if (authWindow) {
                  authWindow.close()
                  authWindow = null
                }
              })
            }
          })
        } else if (url.match(/\/account\/login_verification/)) {
          // noop (start of 2FA session)
        } else if (url.match(/\/oauth\/authenticate/)) {
          // noop (redirection to successful callback)
        } else {
          event.preventDefault()

          // regard current session as invalid submission and retry
          new Auth(callback)
        }
      })

      if (oldWindow) {
        oldWindow.close()
      }
      authWindow.loadURL(`${url}&force_login=true`)
    })
  }
}