import EventEmitter from 'eventemitter3'
import { remote } from 'electron'
import autobind from 'autobind-decorator'
import EditorDispatcher from '../dispatchers/editorDispatcher'
import wailConstants from '../constants/wail-constants'
import * as EditorActions from '../actions/editor-actions'
import _ from 'lodash'

const settings = remote.getGlobal('settings')
const EventTypes = wailConstants.EventTypes
const From = wailConstants.From
const WhichCode = wailConstants.Code.which

class editorStore extends EventEmitter {
  constructor () {
    super()
    this.code = new Map()
    if (process.env.NODE_ENV === 'development') {
      this.loadWaybackConf()
    }

  }

  @autobind
  loadWaybackConf () {
    this.code.set(WhichCode.WBC, EditorActions.readCode(settings.get('wayBackConf')))
    this.emit('wbc-fetched')
  }

  @autobind
  getCode (which, jid) {
    // console.log(`Editor Store ${which} ${jid}`)
    switch (which) {
      case WhichCode.WBC:
        return this.code.get(WhichCode.WBC)
      case WhichCode.CRAWLBEAN:
        return this.code.get(jid)
    }
  }

  @autobind
  getWayBackConf () {
    return this.code.get(WhichCode.WBC)
  }

  @autobind
  handleEvent (event) {
    // console.log('Got an event in editor store', event)
    switch (event.type) {
      case EventTypes.FETCH_CODE:
        this.loadWaybackConf()
        break
      case EventTypes.STORE_HERITRIX_JOB_CONFS:
        _.forOwn(event.confs, (jc, jid) => {
          this.code.set(jid, jc)
        })
        break
      case EventTypes.SAVE_CODE:
        let path = ''
        switch (event.which) {
          case WhichCode.WBC:
            path = settings.get('wayBackConf')
            this.code.set(WhichCode.WBC, event.code)
            break
          case WhichCode.CRAWLBEAN:
            path = event.savePath
            this.code.set(event.jid, event.code)
            break
        }
        EditorActions.saveCode(path, event.code, error => {
          if (error) {
            // console.log(`Error saving code ${error}`, event)
          } else {
            // console.log('Save success', event)
          }
        })
        break
    }
  }
}

const EditorStore = new editorStore()
EditorDispatcher.register(EditorStore.handleEvent)
export default EditorStore
