import * as actions from './actions'
import { ipcRenderer as ipc } from 'electron'

const notifsUiIssued = []
const notifsIpc = []
let heritrixConfig = {}

const addIpcNotif = (e, notif) => {
  if (notif) {
    if (Reflect.has(notif, 'wasError')) {
      notifsIpc.push(notif.message)
    } else {
      notifsIpc.push(notif)
    }
  }
}

const setupTestHook = (store, history) => {
  window.___store = store
  window.___getCurrentState = () => store.getState().toJS()
  window.___executeAction1 = (actionCreator, action, arg) => {
    store.dispatch(actions[actionCreator][action](arg))
  }
  window.___getRunningCrawlCount = () => store.getState().get('runningCrawls')
  window.___getTrueLoc = () => history.getCurrentLocation().pathname
  window.___getStateFor = who => store.getState().get(who).toJS()
  window.___getStateForProp = (who, prop) => store.getState().get(who).get(prop)
  window.___actions = actions
  window.___getNotifsUi = () => notifsUiIssued
  window.___getNotifsIpc = () => notifsIpc
  window.___getNotifs = () => ({
    notifsUiIssued,
    notifsIpc
  })
  window.___getHConfig = () => heritrixConfig
  window.___terminateCrawl = () => {
    store.dispatch(actions.crawlActions.terminateJob(heritrixConfig.jobId))
  }
  global.notifications$.subscribe({
    next: (notif) => {
      if (notif.type !== 'initial') {
        notifsUiIssued.push(notif.message)
      }
    }
  })

  ipc.on('display-message', addIpcNotif)
  ipc.on('log-error-display-message', (e, em) => {
    addIpcNotif(e, em.m)
  })

  ipc.on('made-heritrix-jobconf', (e, config) => {
    heritrixConfig = config
  })
}

export default setupTestHook
