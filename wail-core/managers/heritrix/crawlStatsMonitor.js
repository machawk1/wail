import chokidar from 'chokidar'
import EventEmitter from 'eventemitter3'
import path from 'path'
import { remote } from 'electron'
import getCrawlStats from '../../util/getCrawStats'
import ACrawlMonitor from './aCrawlMonitor'

const settings = remote.getGlobal('settings')

export default class CrawlStatsMonitor extends EventEmitter {
  constructor () {
    super()
    this.monitoring = new Map()
    this.launchId = /^[0-9]+$/
    this.watcherConfig = {followSymlinks: false}
  }

  startMonitoring (jobPath, jobId) {
    this.monitoring.set(jobId, new ACrawlMonitor(jobPath, jobId, ::this.childMOnUpdate,
      ::this.childMOnEnd, ::this.childMOnExceedECount, this.watcherConfig))
  }

  childMOnUpdate (stats) {
    this.emit('crawljob-status-update', stats)
  }

  childMOnEnd (jobId, stats) {
    this.emit('crawljob-status-ended', stats)
    this.monitoring.delete(jobId)
  }

  childMOnExceedECount (jobId) {
    this.monitoring.delete(jobId)
  }

  _startMonitoring (jobPath, jobId) {
    // console.log('start monitoring heritrix job')
    let started = new Date().getTime()
    let logPath = path.join(jobPath, '**/progress-statistics.log')
    // console.log(`logpath for ${jobId} latest launch ${logPath}`)
    let logWatcher = chokidar.watch(logPath, this.watcherConfig)
    logWatcher.on('add', filePath => console.log(`File ${filePath} has been added`))
    logWatcher.on('change', (filePath) => {
      // console.log('changed ', filePath)
      getCrawlStats(filePath)
        .then(stats => {
          // console.log(`crawlJob-status-update ${jobId}`, stats)
          if (stats.ended) {
            this.stopMonitoring(jobId)
            this.emit('crawljob-status-ended', {
              jobId,
              stats: Object.assign({}, {started, warcs: path.normalize(`${filePath}/../../warcs/*.warc`)}, stats)
            })
          } else {
            this.emit('crawljob-status-update', {
              jobId,
              stats: Object.assign({}, {started}, stats)
            })
          }
        })
        .catch(error => {
          // console.error(error)
          let mo = this.monitoring.get(jobId)
          let {errorCount, logWatcher} = mo
          errorCount = errorCount + 1
          if (errorCount >= 10) {
            logWatcher.close()
            this.monitoring.delete(jobId)
            // console.log('crawlstat-monitoring-endedExecption', jobId)
            this.emit('crawlJob-monitoring-endedExecption', jobId)
          } else {
            mo.errorCount = errorCount
            this.monitoring.set(jobId, mo)
          }
        })
    })
    logWatcher.on('error', error => {
      // console.log(`Watcher error: ${error}`)
      console.error(error)
      let mo = this.monitoring.get(jobId)
      let {errorCount, logWatcher} = mo
      errorCount = errorCount + 1
      if (errorCount >= 10) {
        logWatcher.close()
        this.monitoring.delete(jobId)
        // console.log('crawlstat-monitoring-endedExecption', jobId)
        this.emit('crawlJob-monitoring-endedExecption', jobId)
      } else {
        mo.errorCount = errorCount
        this.monitoring.set(jobId, mo)
      }
    })
    this.monitoring.set(jobId, {
      logWatcher,
      errorCount: 0
    })
  }

  fullStopMonitoring () {
    for (let logWatcher of this.monitoring.values()) {
      logWatcher.stopWatching()
      this.monitoring.delete(logWatcher.jobId)
    }
    this.emit('crawlStats-monitoring-stoped')
  }

  stopMonitoring (jobId) {
    if (this.monitoring.has(jobId)) {
      this.monitoring.get(jobId).stopWatching()
      this.monitoring.delete(jobId)
      this.emit('stopped-monitoring', {jobId, wasAllReadyMonitoring: true})
    } else {
      this.emit('stopped-monitoring', {jobId, wasAllReadyMonitoring: false})
    }
  }
}
