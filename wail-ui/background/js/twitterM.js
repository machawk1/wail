import '../../../wailPollyfil'
import '../../../wail-core/util/setMethods'
import TwitterMonitor from '../../../wail-twitter/monitor/twitterMonitor'
import {remote, ipcRenderer as ipc} from 'electron'

const twitterMonitor = window.tm = new TwitterMonitor()

ipc.on('monitor-twitter-account', (e, config) => {
  twitterMonitor.watchTwitter(config)
})