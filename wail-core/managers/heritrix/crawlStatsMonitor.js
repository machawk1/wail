import autobind from 'autobind-decorator'
import chokidar from 'chokidar'
import EventEmitter from 'eventemitter3'
import fs from 'fs-extra'
import getCrawlStats from '../../util/getCrawStats'
import path from 'path'
import { remote } from 'electron'

const settings = remote.getGlobal('settings')

export default class CrawlStatsMonitor extends EventEmitter {
  constructor () {
    super()
    this.monitoring = new Map()
    this.launchId = /^[0-9]+$/
    this.watcherConfig = { followSymlinks: true, awaitWriteFinish: true }
    // console.log(this.watcherConfig)
    // this.watcher = chokidar.watch(path.join(settings.get('heritrixJob'),'**/progress-statistics.log'),{ followSymlinks: true,  awaitWriteFinish: true, ignoreInitial: true })
    // this.watcher.on('add',path => console.log(`File ${path} has been added`))
    // this.watcher.on('change',path => console.log(`File ${path} has been changed`))
  }

  @autobind
  startMonitoring (jobPath, jobId) {
    console.log('start monitoring heritrix job')
    let started = new Date().getTime()
    let logPath = path.join(jobPath, '**/progress-statistics.log')
    console.log(`logpath for ${jobId} latest launch ${logPath}`)
    let logWatcher = chokidar.watch(logPath, this.watcherConfig)
    logWatcher.on('add', filePath => console.log(`File ${filePath} has been added`))
    logWatcher.on('change', (filePath) => {
      console.log('changed ', filePath)
      getCrawlStats(filePath)
        .then(stats => {
          console.log(`crawlJob-status-update ${jobId}`, stats)
          if (stats.ended) {
            logWatcher.close()
            this.monitoring.delete(jobId)
            this.emit('crawljob-status-ended', {
              jobId,
              stats: Object.assign({}, { started, warcs: path.normalize(`${filePath}/../../warcs/*.warc`) }, stats)
            })
          } else {
            this.emit('crawljob-status-update', {
              jobId,
              stats: Object.assign({}, { started }, stats)
            })
          }
        })
        .catch(error => {
          console.error(error)
          let mo = this.monitoring.get(jobId)
          let { errorCount, logWatcher } = mo
          errorCount = errorCount + 1
          if (errorCount >= 10) {
            logWatcher.close()
            this.monitoring.delete(jobId)
            console.log('crawlstat-monitoring-endedExecption', jobId)
            this.emit('crawlJob-monitoring-endedExecption', jobId)
          } else {
            mo.errorCount = errorCount
            this.monitoring.set(jobId, mo)
          }
        })
    })
    logWatcher.on('error', error => console.log(`Watcher error: ${error}`))
    this.monitoring.set(jobId, {
      logWatcher,
      errorCount: 0
    })
  }

  @autobind
  fullStopMonitoring () {
    for (let { logWatcher, errorCount } of this.monitoring.values()) {
      logWatcher.close()
    }
    this.emit('crawlStats-monitoring-stoped')
  }

  @autobind
  stopMonitoring (jobId) {
    if (this.monitoring.has(jobId)) {
      let watcherHolder = this.monitoring.get(jobId)
      watcherHolder.logWatcher.close()
      this.monitoring.delete(jobId)
      this.emit('stopped-monitoring', {jobId, wasAllReadyMonitoring: true})
    } else {
      this.emit('stopped-monitoring', {jobId, wasAllReadyMonitoring: false})
    }
  }
}
