import React, { Component } from 'react'
import { remote, ipcRenderer as ipc } from 'electron'
import Promise from 'bluebird'
import moment from 'moment'
import normalizeUrl from 'normalize-url'
import ElectronArchiver from './electronArchiver'
import { notificationMessages as notifm } from '../wail-ui/constants/uiStrings'

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
  let eMessage = error.message || error.m || `${error}`
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

function noop () {}

export default class WAILArchiver extends Component {
  constructor (...args) {
    super(...args)
    this.webview = null
    this.loaded = false
    this.wbReady = false
    this._attachedArchiver = false
    this.preserving = false
    this.loadTimeout = null
    this.didPageLoadTimeoutHappen = false
    this.archiveQ = []
    this.archiver = new ElectronArchiver()
    this.pageLoaded = this.pageLoaded.bind(this)
    this.loadTimedOutCB = this.loadTimedOutCB.bind(this)
    this.archiver.on('error', (report) => {
      console.error('archiver error', report)
    })
    this.archiver.on('warc-gen-finished', () => {
      let config = this.archiveQ[0]
      console.log('finished', config)
      addWarcToCol(config)
      this.archiveQ.shift()
      this.maybeMore()
    })

    ipc.on('archive-uri-r', (e, config) => {
      this.archiveUriR(config)
    })
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

  loadTimedOutCB () {
    console.log('timed out')
    this.pageLoaded(true)
      .then(noop)
      .catch(error => {
        console.error(error)
      })
  }

  startArchiving () {
    // will-download
    if (!this._attachedArchiver) {
      let webContents = this.webview.getWebContents()
      this.archiver.setUp(webContents)
        .then(() => {
          this._attachedArchiver = true
          this.archiver.startCapturing()
          let {uri_r} = this.archiveQ[0]
          this.webview.loadURL(normalizeUrl(uri_r, {stripFragment: false, stripWWW: false}))
          this.loadTimeout = setTimeout(this.loadTimedOutCB, 15000)
          this.preserving = false
          this.wasLoadError = false
        })
        .catch(error => {
          console.error('setup failed :(')
          console.error(error)
        })
    } else {
      this.archiver.startCapturing()
      let {uri_r} = this.archiveQ[0]
      this.webview.loadURL(normalizeUrl(uri_r, {stripFragment: false, stripWWW: false}))
      this.loadTimeout = setTimeout(this.loadTimedOutCB, 15000)
      this.preserving = false
      this.wasLoadError = false
    }
  }

  maybeMore () {
    if (this.archiveQ.length > 0) {
      this.startArchiving()
    } else {
      console.log('no more to archive waiting')
    }
  }

  async pageLoaded (fromTimeOut = false) {
    if (!this.preserving) {
      let arConfig = this.archiveQ[0]
      this.preserving = true
      clearTimeout(this.loadTimeout)
      this.loadTimeout = null
      console.log('page loaded from debugger')
      let mdata
      let mdataError = false
      try {
        mdata = await this.archiver.getMetadataSameD()
      } catch (error) {
        console.error('metadata get failed')
        mdataError = true
      }
      try {
        await this.archiver.doScroll()
      } catch (error) {
        console.error('scroll error')
        console.error(error)
      }
      if (!fromTimeOut) {
        await Promise.delay(5000)
      }
      // this.webview.stop()
      this.archiver.stopCapturing()
      console.log('are we crashed', this.webview)
      let links
      let outlinks
      if (!mdataError) {
        outlinks = mdata.result.value.outlinks
        links = mdata.result.value.links
      } else {
        outlinks = ''
        links = []
      }
      this.archiver.initWARC(arConfig.saveTo)

      this.archiver.genWarc({
        info: {
          v: 'WAIL-Archiver[1.0.0]',
          isPartOfV: arConfig.isPartOfV,
          warcInfoDescription: arConfig.description
        },
        outlinks,
        UA: this.webview.getUserAgent(),
        seedURL: arConfig.uri_r
      }).then(noop)
        .catch(error => {
          failUseHeritrix(conf, error)
          // console.error(error)
        })
    }
  }

  componentDidMount () {
    // Set up listeners.
    console.log('we did mount')
    this.loaded = true
    this.webview = document.getElementById('awv')
    this.webview.addEventListener('did-stop-loading', (e) => {
      console.log('it finished loading')
      if (!this.wbReady) {
        this.archiver.on('page-loaded', this.pageLoaded)
        this.wbReady = true
        this.maybeMore()
      }
    })

    if (process.env.NODE_ENV === 'development') {
      this.webview.addEventListener('console-message', (e) => {
        console.log('Guest page logged a message:', e.message)
      })
    }
  }

  render () {
    return (
      <div style={{width: 'inherit', height: 'inherit'}}>
        <div dangerouslySetInnerHTML={{
          __html: `<webview class="archiveWV"  id="awv" src="about:blank" disablewebsecurity webpreferences="allowRunningInsecureContent" partition="archive" plugins> </webview>`
        }}
        />
      </div>
    )
  }
}