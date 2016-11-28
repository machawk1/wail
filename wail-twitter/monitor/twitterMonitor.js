import EventEmitter from 'eventemitter3'
import {remote, ipcRenderer as ipc} from 'electron'
import schedule from 'node-schedule'
import TwitterClient from '../twitterClient'
import makeTask from './tasks'
import Archive from '../archive/archive'
import moment from 'moment'
import S from 'string'
import path from 'path'

const settings = remote.getGlobal('settings')

const makeSavePath = (config, tweet) => {
  let name = S(tweet).strip('twitter.com', 'status', 'https:', '/', '.').s
  let saveThisOne = `${config.forCol}_${config.account}_${name}.warc`
  let cpath = path.join(settings.get('collections.dir'), `${config.forCol}`, 'archive')
  return path.normalize(path.join(cpath, saveThisOne))
}

export default class TwitterMonitor extends EventEmitter {
  constructor () {
    super()
    this.twitterClient = new TwitterClient()
    this.archiver = new Archive()
    this.monitorJobs = {}
    this.archiver.on('finished', (config) => {
      console.log('archiving finished', config)
      this.emit('archiving-completed', config)
    })
    this.archiver.on('error', (report) => {
      console.error(report)
      this.emit('archiving-error', report)
    })
  }

  watchTwitter (config) {
    if (!config.dur) {
      config.dur = { val: 5, what: 'minutes' }
    }
    let task = makeTask(config, this.twitterClient)
    task.on('done', () => {
      console.log('done monitoring', config.account)
      delete this.monitorJobs[ config.account ]
    })
    task.on('error', (err) => {
      console.error('error while monitoring', config.account)
      console.error(err)
    })

    task.on('tweets', (tweets) => {
      console.log('tweets here for', config.account)
      let saveTo = makeSavePath(config, tweets[ 0 ])
      console.log(tweets)
      this.archiver.archiveUriR({
        forCol: config.forCol,
        uri_r: tweets[ 0 ],
        saveTo,
        header: {
          isPartOfV: config.forCol,
          description: `Archived by WAIL for ${config.forCol}`
        }
      })
    })
    this.monitorJobs[ config.account ] = task
    this.monitorJobs[ config.account ].start(schedule, '*/1 * * * *')

  }

}

