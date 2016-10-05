import 'babel-polyfill'
import EventEmitter from 'eventemitter3'
import autobind from 'autobind-decorator'
import fs from 'fs-extra'
import cp from 'child_process'
import request from 'request'
import {remote, ipcRenderer} from 'electron'
import LoadingDispatcher from './loadingDispatcher'
import wc from '../../constants/wail-constants'
import util from 'util'
// import { startHeritrix, startWayback } from './lsActions'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const settings = remote.getGlobal('settings')
const logger = remote.getGlobal('logger')
let serviceMan = window.servMan = remote.getGlobal('serviceMan')
const osxJava7DMG = 'http://matkelly.com/wail/support/jdk-7u79-macosx-x64.dmg'

class _LoadingStore extends EventEmitter {
  constructor () {
    super()
    this.progress = {
      messages: [
        'Checking Java Version',
        'Checking Heritrix, Wayback Status'
      ],
      javaCheckDone: false,
      serviceProgressDone: false
    }

    this.internals = {
      message: 'Loading WAIL Internals',
      done: false,
      gotHeritrix: false,
      gotCollections: false
    }

    this.serviceProgressDone = false

    this.startedHeritrix = false
    this.wasHeritrixStartError = false
    this.pMessage = this.progress.messages[ 0 ]

    ipcRenderer.on('initial-load', (e, m) => {
      this.internals.message = m
      this.emit('internal-progress', this.internals.message)
    })
  }

  @autobind
  handleEvent (event) {
    console.log('loadingStore got event', event)
    switch (event.type) {
      case wc.Loading.JAVA_CHECK_DONE:
        this.progress.javaCheckDone = true
        console.log('start migrations')
        if (settings.get('migrate')) {
          this.emit('migrate')
        } else {
          this.emit('check-services')
          this.checkServices()
        }

        this.pMessage = this.progress.messages[ 1 ]

        break
      case wc.Loading.DOWNLOAD_JAVA:
        const { dialog } = require('electron').remote
        dialog.showMessageBox({
          type: 'question',
          title: 'Download Required JDK',
          detail: 'In order to use Wail you must have a jdk. Otherwise you can not use this this tool.',
          buttons: [ 'Yes', 'No' ],
          message: 'Java needs to be installed for Heritrix and Wayback',
          cancelId: 666
        }, this.downloadJDK)
        break
      case wc.Loading.MIGRATION_DONE:
        // ipcRenderer.send('loading-finished', { yes: 'Make it so number 1' })
        // this.checkServices()
        this.emit('migration-done', this.checkServices)
        break
      case wc.Loading.SERVICE_CHECK_DONE:
        // ipcRenderer.send('loading-finished', { yes: 'Make it so number 1' })
        this.emit('progress')
        break
    }
  }

  @autobind
  serviceMessage () {
    return { progMessage: this.pMessage }
  }

  @autobind
  downloadJDK (response) {
    // console.log(response)
    settings.set('didFirstLoad', false)
    const app = require('electron').remote.app
    if (response === 1 || response === 666) {
      app.exit(1)
    } else {
      settings.set('didDlJava', true)
      this.pMessage = 'Downloading the required JDK'
      this.emit('progress')
      request.get(osxJava7DMG)
        .on('response', res => {
          // console.log(res.statusCode) // 200
          // console.log(res.headers[ 'content-type' ])
        })
        .on('error', err => {
          console.error(err)
        })
        .pipe(fs.createWriteStream('/tmp/java7.dmg'))
        .on('close', () => {
          // console.log('done')
          this.pMessage = 'Starting the install of the JDK'
          this.emit('progress')
          cp.exec('hdiutil attach /tmp/java7.dmg', (err, stdout, stderr) => {
            if (err) {
              console.error(err)
            } else {
              // console.log(stderr, stdout)
              cp.exec('open /Volumes/JDK\\ 7\\ Update\\ 79/JDK\\ 7\\ Update\\ 79.pkg', (err, stdout, stderr) => {
                if (err) {
                  console.error(err)
                } else {
                  console.log(stderr, stdout)
                }
                app.exit(1)
              })
            }
          })
        })
    }
  }

  @autobind
  wb () {
    if (serviceMan.isServiceUp('wayback')) {
      let message
      if (this.startedHeritrix) {
        message = 'Heritrix was started and Wayback is already started. Done'
      } else {
        message = 'Both Heritrix and Wayback were already started. Done'
      }
      this.pMessage = message
      console.log(this.pMessage)
      this.serviceProgressDone = true
      ipcRenderer.send('loading-finished', { yes: 'Make it so number 1' })
    } else {
      serviceMan.startWayback()
        .then(() => {
          console.log('wayback start then')
          this.serviceProgressDone = true
          ipcRenderer.send('loading-finished', { yes: 'Make it so number 1' })
          // console.log('it worked wayback')
        })
        .catch((err) => {
          console.log('it no work? why wayback', err)
          logger.error(util.format('Loading Store %s', 'launch wayback', err))
          let message
          if (this.startedHeritrix) {
            if (this.wasHeritrixStartError) {
              let m1 = 'There were critical errors while starting both Heritrix and Wayback.'
              let m2 = 'Please ensure that these services are not running already'
              message = `${m1}\n${m2}\nRestart Wail and try again. If this persists please submit a bug report`
            } else {
              message = 'There was a critical error while starting Wayback, but Heritrix was started. You can archive but not replay'
            }
          } else {
            message = 'There was a critical error while starting Wayback, but Heritrix was stareted already started. You can archive but not replay'
          }
          console.log(message)
          this.pMessage = message
          this.serviceProgressDone = true
          this.emit('service-check-done')
        })
    }
  }

  @autobind
  checkServices () {
    console.log('checking services')
    if (serviceMan.isServiceUp('heritrix')) {
      this.pMessage = 'Heritrix is already started. Checking Wayback'
      console.log('Heritrix is already started. Checking Wayback')
      this.emit('progress')
      this.wb()
    } else {
      this.startedHeritrix = true
      this.pMessage = 'Heritrix is not started. Starting'
      this.emit('progress')
      serviceMan.startHeritrix()
        .then(() => {
          console.log('Heritrix has been started. Checking Wayback')
          this.emit('progress')
          this.wb()
        })
        .catch((err) => {
          logger.error(util.format('Loading Store %s', 'launch heritrix', err))
          console.log('it no work? why heritrix', err)
          this.wasHeritrixStartError = true
          console.log('Starting Heritrix failed. Checking Wayback')
          this.emit('progress')
          this.wb()
        })
    }
  }

  @autobind
  progressMessage () {
    return this.pMessage
  }
}

const LoadingStore = new _LoadingStore()

LoadingDispatcher.register(LoadingStore.handleEvent)

export default LoadingStore
