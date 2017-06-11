import { OAuth } from 'oauth'
import Promise from 'bluebird'
import ReactDOM from 'react-dom'
import Rx from 'rxjs'
import constz from '../constants'

function getOAuthRequestToken (containerRef) {
  return Rx.Observable.fromPromise(new Promise((resolve, reject) => {
      const args = JSON.parse(decodeURIComponent(window.location.hash.slice(1)))
      const force_login = args['force_login'] || false
      let authUrl = `https://api.twitter.com/oauth/authenticate?force_login=${force_login.toString()};oauth_token=`
      let oauth = new OAuth(
        'https://api.twitter.com/oauth/request_token',
        'https://api.twitter.com/oauth/access_token',
        args.key,
        args.secret,
        '1.0A',
        null,
        'HMAC-SHA1'
      )

      oauth.getOAuthRequestToken((error, oauth_token, oauth_token_secret, results) => {
        if (error) {
          reject(error)
          return
        }

        resolve({
          containerRef,
          oauth,
          oauth_token,
          oauth_token_secret,
          loginURL: `${authUrl}${oauth_token}`
        })
      })
    })
  )
}

export function gotContainerRef (containerRef) {
  return {
    type: constz.GOT_CONTAINER_REF,
    containerRef
  }
}

// "https://twitter.com/login/error?username_or_email=dsafsa&redirect_after_login=https%3A%2F%2Fapi.twitter.com%2Foauth%2Fauthenticate%3Foauth_token%3DRM22lAAAAAAAxgPPAAABXJTMXKs"

function setUpWebview ({containerRef, oauth, oauth_token, oauth_token_secret, loginURL}) {
  const container = ReactDOM.findDOMNode(containerRef)
  container.innerHTML = `<webview id="loginWebView" plugins disablewebsecurity webpreferences="allowRunningInsecureContent" src="${loginURL}" partition="twitlogin" class="inheritThyWidthHeight"></webview>`
  const wbv = document.getElementById('loginWebView')
  // did-navigate-in-page,will-navigate
  let weMatchedGettingToken = false
  return Rx.Observable.fromEventPattern(
    function webviewAdd (addHandler) {
      function onceReady () {
        addHandler({
          type: constz.WBV_READY,
          wbv
        })
        wbv.removeEventListener('dom-ready', onceReady)
      }

      wbv.addEventListener('dom-ready', onceReady)
      wbv.addEventListener('did-navigate', (e) => {
        console.log('webview did nav', e)
        let matched = e.url.match(/\?oauth_token=([^&]*)&oauth_verifier=([^&]*)/)
        if (matched && !weMatchedGettingToken) {
          weMatchedGettingToken = true
          addHandler({type: constz.LOGIN_BAD_UNPW})
          oauth.getOAuthAccessToken(oauth_token, oauth_token_secret, matched[2], (error, oauth_access_token, oauth_access_token_secret) => {
            if (error) {
              weMatchedGettingToken = false
              addHandler({
                type: constz.CLIENT_TOKEN_ERROR,
                error
              })
            } else {
              addHandler({
                type: constz.GOT_CLIENT_TOKENS,
                oauth_access_token,
                oauth_access_token_secret
              })
            }
          })
        } else if (e.url.includes('login/error?username_or_email')) {
          addHandler({type: constz.LOGIN_BAD_UNPW})
        } else {
          addHandler({type: constz.NO_OTHER_NAV})
        }
      })
      wbv.addEventListener('did-navigate-in-page', (...args) => {
        console.log(args)
      })

      wbv.addEventListener('did-fail-load', (errorCode, errorDescription, validatedURL, isMainFrame) => {
        addHandler({
          type: constz.WBV_LOAD_FAILED,
          errorCode,
          errorDescription,
          validatedURL,
          isMainFrame
        })
      })
    },
    function webviewRemove (removeHandler) {

    }
  )
}

export function startLoginProcess (action) {
  const {containerRef} = action
  return getOAuthRequestToken(containerRef) // one off observable
    .switchMap(setUpWebview) // switch from it and start taking from the new observable
}

export function goBackToLogin () {
  return {type: constz.WENT_BACK_TO_LOGIN}
}