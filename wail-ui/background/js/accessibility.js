import 'babel-polyfill'
import ServiceManager from '../../../wail-core/managers/serviceManager'
import { ipcRenderer as ipc, remote } from 'electron'
import Settings from '../../../wail-core/remoteSettings'
import processStates from '../../../wail-core/managers/serviceManager/processControlers/processStates'

const settings = new Settings()
settings.configure()
const serviceMan = new ServiceManager(settings)

const wbSub = serviceMan.observeWayback(({prev, cur}) => {

})

const hSub = serviceMan.observeHeritrix(({prev, cur}) => {

})

ipc.on('start-service', (e, who) => {
  serviceMan.startService(who)
    .then(() => {
      console.log('started', who)
    })
    .catch(fatalError => {

    })
})

ipc.on('stop-service', (e, who) => {
  serviceMan.killService(who)
    .then(() => {
      console.log('killed', who)
    })
    .catch(fatalError => {

    })
})

ipc.on('restart-wayback', () => {
  serviceMan.restartWayback()
    .then(() => {
      console.log('restarted wayback')
    })
    .catch(fatalError => {

    })
})
