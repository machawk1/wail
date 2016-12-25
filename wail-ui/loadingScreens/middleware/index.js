import createIpc from 'redux-electron-ipc'
import { createEpicMiddleware } from 'redux-observable'
import rootEpic from '../epics'
import { INITIAL_LOAD } from '../constants'

const epic = createEpicMiddleware(rootEpic)
const ipc = createIpc({
  'initial-load': (e, whichOne) => ({
    type: INITIAL_LOAD.HAVE_UI_STATE,
    whichOne
  })
})

export {
  epic,
  ipc
}