import React, { Component } from 'react'
import { remote, ipcRenderer as ipc } from 'electron'
import Promise from 'bluebird'
import WarcWriter from './warcWriter'
import NetworkMonitor from './networkMonitor'
import moment from 'moment'
import normalizeUrl from 'normalize-url'
import {notificationMessages as notifm} from '../../wail-ui/constants/uiStrings'

// /home/john/my-fork-wail/wail-twitter/archive/inject.js

const addWarcToCol = config => {
  let type = config.type || 'WC'
  let lastUpdated = moment().format()
  ipc.send('add-warcs-to-col-wcreate', {
    type,
    col: config.forCol,
    warcs: config.saveTo,
    lastUpdated,
    seed: {
      forCol: config.forCol,
      url: config.uri_r,
      jobId: `${config.forCol}_WAIL_${type}`,
      lastUpdated,
      added: lastUpdated
    }
  })
}

const failUseHeritrix = (config, error) => {
  let jId = new Date().getTime()
  ipc.send('makeHeritrixJobConf', {
    urls: config.uri_r,
    depth: 1,
    jobId: jId,
    forCol: config.forCol
  })
  let eMessage = error.message || error.m
  let message = notifm.wailWarcreateError(eMessage)
  ipc.send('log-error-display-message', {
    m: {
      title: notifm.wailWarcreateErrorTitle,
      level: 'error',
      message,
      uid: message,
      autoDismiss: 0
    },
    err: error
  })
}

export default class ArchiveComponent extends Component {
  constructor (props) {
    super(props)
    console.log('creating ArchiveComponent')
    this.loaded = false
    this.wbReady = false
    this.webview = null
    this.archiveQ = []
    this.networkMonitor = window.nm = new NetworkMonitor()
    this.warcWritter = new WarcWriter()

    this.warcWritter.on('error', (error) => {
      console.error('there was an error in the warc writter', error)
      let config = this.archiveQ[0]
      console.error(config)
      failUseHeritrix(config, error)
      this.archiveQ.shift()
      this.maybeMore()
    })

    this.warcWritter.on('finished', () => {
      let config = this.archiveQ[0]
      console.log('finished', config)
      addWarcToCol(config)
      this.archiveQ.shift()
      this.maybeMore()
    })

    ipc.on('archive-uri-r', (e, config) => {
      this.archiveUriR(config)
    })
    this.ipcMessage = this.ipcMessage.bind(this)
  }

  componentDidMount () {
    // Set up listeners.
    console.log('we did mount')
    this.loaded = true
    this.webview = document.getElementById('awv')
    this.webview.addEventListener('did-stop-loading', (e) => {
      console.log('it finished loading')
      if (!this.wbReady) {
        console.log('we are loaded')
        this.wbReady = true
        this.maybeMore()
      }
    })

    this.webview.addEventListener('did-fail-load', (e) => {
      this.wasLoadError = true
      if (this.archiveQ.length > 0) {
        let config = this.archiveQ[0]
        e.m = e.errorDescription
        failUseHeritrix(config, e)
        this.archiveQ.shift()
        this.maybeMore()
      }
    })

    if (process.NODE_ENV === 'development') {
      this.webview.addEventListener('console-message', (e) => {
        console.log('Guest page logged a message:', e.message)
      })
    }

    this.webview.addEventListener('ipc-message', this.ipcMessage)
  }

  componentWillUpdate (nextProps, nextState, nextContext) {
    console.log('archive component will update', this.wbReady)
    // if (this.wbReady) {
    //   let webContents = this.webview.getWebContents()
    //   this.networkMonitor.detach(webContents)
    // }
  }

  addArcConfig (arConfig) {
    if (Array.isArray(arConfig)) {
      arConfig.forEach(ac => {
        this.archiveQ.push(ac)
      })
    } else {
      this.archiveQ.push(arConfig)
    }
  }

  archiveUriR (arConfig) {
    if (this.archiveQ.length > 0) {
      this.addArcConfig(arConfig)
    } else {
      this.addArcConfig(arConfig)
      if (this.wbReady) {
        this.startArchiving()
      }
    }
  }

  startArchiving () {
    this.wasLoadError = false
    let {uri_r} = this.archiveQ[0]
    console.log('archiving', uri_r)
    let webContents = this.webview.getWebContents()
    this.networkMonitor.attach(webContents)
    this.webview.loadURL(normalizeUrl(uri_r, {stripFragment: false, stripWWW: false}))
  }

  maybeMore () {
    if (this.archiveQ.length > 0) {
      this.startArchiving()
    } else {
      console.log('no more to archive waiting')
    }
  }

  freshSession (webContents) {
    console.log('freshSession')
    return new Promise((resolve, reject) => {
      console.log('in promise')
      let opts = {
        origin: webContents.getURL(),
        storages: ['appcache', 'filesystem', 'local storage']
      }
      webContents.session.clearStorageData(opts, () => {
        console.log('cleared storage data')
        webContents.clearHistory()
        resolve()
      })
    })
  }

  extractDoctypeDom (webContents) {
    return new Promise((resolve, reject) => {
      webContents.executeJavaScript('document.doctype.name', false, doctype => {
        webContents.executeJavaScript('document.documentElement.outerHTML', false, dom => {
          resolve({doctype, dom})
        })
      })
    })
  }

  async ipcMessage (event) {
    if (event.channel === 'injected-archive') {
      let msg = event.args[0]
      if (msg === 'did-finish-load') {
        console.log('real did finish load')
        // this.webview.send('get-resources')
        if (!this.wasLoadError) {
          let webContents = this.webview.getWebContents()
          this.networkMonitor.detach(webContents)
          let ret
          try {
            ret = await this.extractDoctypeDom(webContents)
          } catch (error) {
            let config = this.archiveQ[0]
            failUseHeritrix(config, error)
            this.archiveQ.shift()
            this.maybeMore()
          }
          let arConfig = this.archiveQ[0]
          let opts = {
            seedUrl: arConfig.uri_r,
            lookUp: webContents.getURL(),
            networkMonitor: this.networkMonitor,
            ua: this.webview.getUserAgent(),
            dtDom: ret,
            preserveA: false,
            toPath: arConfig.saveTo,
            header: arConfig
          }
          this.warcWritter.writeWarc(opts)
        }
      } else {
        console.log(msg)
      }
    }
  }

  render () {
    let wb = {__html: `<webview class="archiveWV"  id="awv" src="about:blank" preload=${remote.getGlobal('settings').get('archivePreload')} partition="archive" plugins> </webview>`}
    console.log(wb)
    return (
      <div style={{width: 'inherit', height: 'inherit'}}>
        <div dangerouslySetInnerHTML={wb} />
      </div>
    )
  }
}
