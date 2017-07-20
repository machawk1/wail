import React, { Component } from 'react'
import { remote, ipcRenderer as ipc } from 'electron'
import path from 'path'
import Promise from 'bluebird'
import moment from 'moment'
import normalizeUrl from 'normalize-url'
import filenamifyUrl from 'filenamify-url'
import S from 'string'
import uuidv1 from 'uuid/v1'
import ElectronArchiver from './electronArchiver'
import { notificationMessages as notifm } from '../wail-ui/constants/uiStrings'
import Settings from '../wail-core/remoteSettings'
import { archiving, ipcChannels, uiActions } from '../wail-core/globalStrings'

function addWarcToCol (config) {
  let type = config.type || 'WC'
  let lastUpdated = moment().format()
  ipc.send(ipcChannels.ADD_WARC_TO_COLL_WAIL_ARCHIVED, {
    type,
    col: config.forCol,
    warcs: config.saveTo,
    lastUpdated,
    seed: {
      forCol: config.forCol,
      url: config.uri_r,
      jobId: config.jobId,
      lastUpdated,
      added: lastUpdated
    }
  })
}

function failUseHeritrix (config, error) {
  let jId = new Date().getTime()
  ipc.send(archiving.ARCHIVE_WITH_HERITRIX, {
    urls: config.uri_r,
    depth: 1,
    jobId: jId,
    forCol: config.forCol
  })
  let eMessage = error.message || error.m || `${error}`
  let message = notifm.wailWarcreateError(eMessage)
  ipc.send(ipcChannels.LOG_ERROR_WITH_NOTIFICATION, {
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

const Q1 = 'q1'
const Q2 = 'q2'

/**
 *
 */
export default class WAILArchiver extends Component {
  constructor (...args) {
    super(...args)
    this.webview = null
    this.loadTimeout = null
    this._settings = null
    this._current = null
    this.loaded = false
    this.wbReady = false
    this._attachedArchiver = false
    this.preserving = false
    this._swapper = S('')
    this.archiveQ = []
    this.archiveQ2 = []
    this._lastQ = Q1
    this.archiver = new ElectronArchiver()
    this.extractedSeedWarcPath = this.extractedSeedWarcPath.bind(this)
    this.pageLoaded = this.pageLoaded.bind(this)
    this.loadTimedOutCB = this.loadTimedOutCB.bind(this)
    this.archiver.on('error', (report) => {
      console.error('archiver error', report)
    })
    this.archiver.on('warc-gen-finished', () => {
      let config = this._current
      console.log('finished', config)
      let uiCrawlProgress = {
        type: uiActions.WAIL_CRAWL_FINISHED,
        update: {
          forCol: config.forCol,
          lastUpdated: moment().format('MMM DD YYYY h:mm:ssa')
        }
      }
      if (this._current.parent) {
        uiCrawlProgress.update.parent = config.parent
        ipc.send(ipcChannels.WAIL_CRAWL_UPDATE, uiCrawlProgress)
      } else {
        uiCrawlProgress.update.jobId = config.jobId
        ipc.send(ipcChannels.WAIL_CRAWL_UPDATE, uiCrawlProgress)
        addWarcToCol(config)
      }

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
          let lastUpdated = moment().format('MMM DD YYYY h:mm:ssa')
          ipc.send(ipcChannels.WAIL_CRAWL_UPDATE, {
            type: uiActions.WAIL_CRAWL_START,
            update: {
              jobId: this._current.jobId,
              forCol: this._current.forCol,
              uri_r: this._current.uri_r,
              started: lastUpdated,
              lastUpdated
            }
          })
          this.archiver.startCapturing()
          this.webview.loadURL(normalizeUrl(this._current.uri_r, {stripFragment: false, stripWWW: false}))
          this.loadTimeout = setTimeout(this.loadTimedOutCB, 15000)
          this.preserving = false
          this.wasLoadError = false
        })
        .catch(error => {
          console.error('setup failed :(')
          console.error(error)
        })
    } else {
      let started = moment().format('MMM DD YYYY h:mm:ssa')
      let crawlUpdate = {
        type: uiActions.WAIL_CRAWL_START,
        update: {
          forCol: this._current.forCol,
          lastUpdated: started,
          started
        }
      }
      if (this._current.parent) {
        crawlUpdate.update.parent = this._current.parent
      } else {
        crawlUpdate.update.jobId = this._current.jobId
      }
      ipc.send(ipcChannels.WAIL_CRAWL_UPDATE, crawlUpdate)
      this.archiver.startCapturing()
      this.webview.loadURL(normalizeUrl(this._current.uri_r, {stripFragment: false, stripWWW: false}))
      this.loadTimeout = setTimeout(this.loadTimedOutCB, 15000)
      this.preserving = false
      this.wasLoadError = false
    }
  }

  /**
   * Alternate Archiving Queues Until One Or Both Are Exhausted,
   * when one is exhausted take from the other until either
   * the one currently being drained is exhausted yielding ```both exhausted```
   * or the other is filled in this return to alternating otherwise
   * wait till one or both becomes filled
   */
  maybeMore () {
    let q1l = this.archiveQ.length
    let q2l = this.archiveQ2.length
    if (q1l > 0 && q2l > 0) {
      if (this._lastQ === Q1) {
        // console.log(`taking from Q2, remaining Q1: ${q1l} remaining Q2: ${q2l} `)
        this._current = this.archiveQ2.shift()
        this._lastQ = Q2
      } else {
        // console.log(`taking from Q1, remaining Q1: ${q1l} remaining Q2: ${q2l} `)
        this._current = this.archiveQ.shift()
        this._lastQ = Q1
      }
      this.startArchiving()
    } else if (q1l > 0 && q2l === 0) {
      // console.log(`taking from Q1, remaining Q1: ${q1l} remaining Q2: ${q2l} `)
      this._current = this.archiveQ.shift()
      this._lastQ = Q1
      this.startArchiving()
    } else if (q1l === 0 && q2l > 0) {
      // console.log(`taking from Q2, remaining Q1: ${q1l} remaining Q2: ${q2l} `)
      this._current = this.archiveQ2.shift()
      this._lastQ = Q2
      this.startArchiving()
    } else {
      // console.log('no more to archive waiting')
      this._current = null
      this.webview.stop()
    }
  }

  extractedSeedWarcPath (seed, forCol) {
    return path.join(
      this._swapper.setValue(this._settings.get('collections.colWarcs')).template({col: forCol}, '{', '}').s,
      `${filenamifyUrl(seed)}-${forCol}-${new Date().getTime()}.warc`
    )
  }

  async pageLoaded (fromTimeOut = false) {
    if (!this.preserving) {
      this.preserving = true
      let arConfig = this._current
      let links
      let outlinks
      let mdata
      let mdataError = false
      clearTimeout(this.loadTimeout)
      this.loadTimeout = null
      // console.log('page loaded from debugger', arConfig)
      try {
        mdata = await this.archiver.getMetadataBasedOnConfig(arConfig.type)
        // console.log(mdata)
      } catch (error) {
        console.error('metadata get failed', error)
        mdataError = true
      }

      if (arConfig.scroll) {
        try {
          await this.archiver.doScroll()
        } catch (error) {
          console.error('scroll error')
          console.error(error)
        }
      }

      if (!fromTimeOut) {
        await Promise.delay(5000)
      }
      // this.webview.stop()
      this.archiver.stopCapturing()
      if (!mdataError) {
        outlinks = mdata.outlinks
        links = mdata.links || []
      } else {
        outlinks = ''
        links = []
      }

      if (links.length > 0) {
        // console.log('we have links', links)
        let forCol = arConfig.forCol
        this.archiveQ2 = this.archiveQ2.concat(links.map(newSeed => ({
          forCol,
          jobId: uuidv1(),
          parent: arConfig.jobId,
          type: archiving.PAGE_ONLY,
          uri_r: newSeed,
          saveTo: this.extractedSeedWarcPath(newSeed, forCol),
          isPartOfV: forCol,
          description: `Archived by WAIL for ${forCol}`
        })))

        console.log(this.archiveQ2)

        ipc.send(ipcChannels.WAIL_CRAWL_UPDATE, {
          type: uiActions.WAIL_CRAWL_Q_INCREASE,
          update: {
            jobId: arConfig.jobId,
            forCol,
            by: links.length,
            lastUpdated: moment().format('MMM DD YYYY h:mm:ssa')
          }
        })
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
          failUseHeritrix(arConfig, error)
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
        this._settings = new Settings()
        this._settings.configure()
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
      <div
        style={{width: 'inherit', height: 'inherit'}}
        dangerouslySetInnerHTML={{
          __html: `<webview class="archiveWV"  id="awv" src="about:blank" disablewebsecurity webpreferences="allowRunningInsecureContent" partition="archive" plugins> </webview>`
        }}
      />
    )
  }
}
