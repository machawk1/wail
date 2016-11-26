import EventEmitter from 'eventemitter3'
import {remote, ipcRenderer as ipc} from 'electron'
import schedule from 'node-schedule'
import TwitterClient from '../twitterClient'
import makeTask from './tasks'

export default class TwitterMonitor extends EventEmitter {
  constructor () {
    super()
    this.twitterClient = new TwitterClient()
    this.monitorJobs = {}
  }

  watchTwitter (config) {
    if (!config.dur) {
      config.dur = { val: 5, what: 'minutes' }
    }
    let task = makeTask(config, this.twitterClient)
    task.on('done', () => {
      console.log('done monitoring', config.account)
    })
    task.on('error', (err) => {
      console.error('error while monitoring', config.account)
      console.error(err)
    })

    task.on('tweets', (tweets) => {
      console.log('tweets here for', config.account)
      console.log(tweets)
    })
    this.monitorJobs[ config.account ] = task
    this.monitorJobs[ config.account ].start(schedule, '*/1 * * * *')

  }

}

