import '../../../wailPollyfil'
import '../../../wail-core/util/setMethods'
import TwitterMonitor from '../../../wail-twitter/monitor/twitterMonitor'
import {remote, ipcRenderer as ipc} from 'electron'

const twitterMonitor = window.tm = new TwitterMonitor()

ipc.on('monitor-twitter-account', (e, config) => {
  twitterMonitor.watchTwitter(config)
})

twitterMonitor.on('archiving-completed', config => {
  console.log('archiving finished for', config)
})

twitterMonitor.on('archiving-error', report => {
  console.error('archiving error for', report.error)
  console.log('archiving error for', report.config)
})