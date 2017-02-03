import EventEmitter from 'eventemitter3'
import { remote, ipcRenderer as ipc } from 'electron'
import schedule from 'node-schedule'
import TwitterClient from '../twitterClient'
import makeTask from './tasks'
import moment from 'moment'
import S from 'string'
import path from 'path'

S.TMPL_OPEN = '{'
S.TMPL_CLOSE = '}'

const settings = remote.getGlobal('settings')

const makeArchiveConfig = (config, tweet) => {
  let name = S(tweet).strip('twitter.com', 'status', 'https:', '/', '.').s
  let saveThisOne = `${config.forCol}_${config.account}_twitter_${name}_${new Date().getTime()}.warc`
  return {
    type: 'twitter',
    forCol: config.forCol,
    uri_r: tweet,
    saveTo: path.join(S(settings.get('collections.colWarcs')).template({col: config.forCol}).s, saveThisOne),
    header: {
      isPartOfV: config.forCol,
      description: `Archived by WAIL for ${config.forCol}`
    }
  }
}

export default class TwitterMonitor extends EventEmitter {
  constructor () {
    super()
    this.twitterClient = new TwitterClient()
    this.monitorJobs = {}
  }

  watchTwitter (config) {
    console.log('watching twitter for', config)
    if (!config.dur) {
      config.dur = {val: 5, what: 'minutes'}
    }

    let task = makeTask(config, this.twitterClient)
    task.on('done', () => {
      let message = `Finished Monitoring ${config.account} for ${config.forCol}`
      console.log(message)
      ipc.send('display-message', {
        title: 'Twitter Monitor Update',
        level: 'info',
        message,
        uid: message
      })
      delete this.monitorJobs[config.account]
    })
    task.on('error', (err) => {
      let message = `Error occurred while monitoring ${config.account} for ${config.forCol}`
      console.error('error while monitoring', config.account)
      console.error(err)
      ipc.send('log-error-display-message', {
        m: {
          title: 'Twitter Monitor Error',
          level: 'error',
          message,
          uid: message
        },
        err: `${err} ${err.stack}`
      })
      delete this.monitorJobs[config.account]
    })

    task.on('tweets', (tweets) => {
      console.log('tweets here for', config.account)
      let configs = []
      tweets.forEach(t => {
        configs.push(makeArchiveConfig(config, t))
      })
      ipc.send('archive-uri-r', configs)
    })

    if (config.oneOff) {
      task.poll()
    } else {
      this.monitorJobs[config.account] = task
      this.monitorJobs[config.account].start(schedule, '*/5 * * * *')
    }
  }

}

