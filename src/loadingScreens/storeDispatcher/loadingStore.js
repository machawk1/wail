import 'babel-polyfill'
import EventEmitter from 'eventemitter3'
import autobind from 'autobind-decorator'
import fs from 'fs-extra'
import cp from 'child_process'
import request from 'request'
import _ from 'lodash'
import moment from 'moment'
import {ipcRenderer, remote} from 'electron'
import LoadingDispatcher from '../storeDispatcher/loadingDispatcher'
import wc from '../../constants/wail-constants'


process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const settings = remote.getGlobal('settings')
const osx_java7DMG = 'http://matkelly.com/wail/support/jdk-7u79-macosx-x64.dmg'

class loadingStore extends EventEmitter {
  constructor () {
    super()
    this.progress = {
      messages: [
        'Checking Java Version',
        'Checking Heritrix, Wayback Status'
      ],
      javaCheckDone: false,
      serviceProgressDone: false,
    }

    this.serviceProgress = {
      messages: [
        'Are Heritrix and Wayback up?',
        'Both Heritrix and Wayback are up.',
        'Both Heritrix and Wayback are not up. Starting them.',
        'Heritrix is up but Wayback is not. Starting Wayback',
        'Wayback is up but Heritrix  is not. Starting Heritrix',
      ],
      accessReq: {
        hId: null,
        wId: null
      }
    }

    this.pMessage = this.progress.messages[ 0 ]

  }

  @autobind
  handleEvent (event) {
    switch (event.type) {
      case wc.Loading.JAVA_CHECK_DONE:
        this.progress.javaCheckDone = true
        this.emit('check-services')
        this.pMessage = this.progress.messages[ 1 ]
        this.emit('progress')
        this.checkServices()
        break
      case wc.Loading.DOWNLOAD_JAVA:
        const { dialog } = require('electron').remote
        dialog.showMessageBox({
          type: 'question',
          title: 'Download Required JDK',
          detail: 'In order to use Wail you must have the correct jdk. Otherwise you can not use this this tool.',
          buttons: [ 'Yes', 'No' ],
          message: 'Java needs to be installed for Heritrix and Wayback',
          cancelId: 666,
        }, this.downloadJDK)
        break
      case wc.Loading.SERVICE_CHECK_DONE:
        break
    }
  }

  @autobind
  downloadJDK (response) {
    console.log(response)
    const app = require('electron').remote.app
    if (response === 1 || response === 666) {
      app.exit(1)
    } else {
      request.get(osx_java7DMG)
        .on('response', res => {
          console.log(res.statusCode) // 200
          console.log(res.headers[ 'content-type' ])
        })
        .on('error', err => {
          console.error(err)
        })
        .pipe(fs.createWriteStream('/tmp/java7.dmg'))
        .on('close', () => {
          console.log('done')
          cp.exec('hdiutil attach /tmp/java7.dmg', (err, stdout, stderr) => {
            if (err) {
              console.error(err)
            } else {
              console.log(stderr, stdout)
              cp.exec('open /Volumes/JDK\\ 7\\ Update\\ 79/JDK\\ 7\\ Update\\ 79.pkg', (err, stdout, stderr) => {
                if (err) {
                  console.error(err)
                } else {
                  console.log(stderr, stdout)
                  app.exit(1)
                }
              })
            }
          })
        })
    }
  }

  @autobind
  checkServices () {
    let wb = () => {
      request.get(settings.get('wayback.uri_wayback'))
        .on('response',(res) => {
          console.log(res)
        })
        .on('error',(err) => {
          console.error(err)
        })
    }

    let haReq = request(_.cloneDeep(settings.get('heritrix.optionEngine')))
    haReq.on('response',(res) => {
      console.log(res)
      wb()
    })
    haReq.on('error',(err) => {
      console.error(err)
      wb()
    })
    /*
     windows.reqDaemonWindow.send('handle-request', {
     from: 'loadingStore',
     response: null,
     wasError: false,
     id: 'heritrixAccessible',
     opts: request.opts[0]
     })

     windows.reqDaemonWindow.send('handle-request', {
     from: 'loadingStore',
     response: null,
     wasError: false,
     id: 'wayBackAccessible',
     opts: request.opts[1]
     })
     */

  }

  @autobind
  progressMessage () {
    return this.pMessage
  }
}

const LoadingStore = new loadingStore()

LoadingDispatcher.register(LoadingStore.handleEvent)

export default LoadingStore
