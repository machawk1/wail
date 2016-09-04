import autobind from 'autobind-decorator'
import chokidar from 'chokidar'
import EventEmitter from 'eventemitter3'
import fs from 'fs-extra'
import getCrawlStats from '../util/getCrawStats'
import path from 'path'

const log = console.log.bind(console)

export default class CrawlStatsMonitor extends EventEmitter {
  constructor () {
    super()
    this.monitoring = new Map()
    this.launchId = /^[0-9]+$/
  }

  @autobind
  startMonitoring (jobPath, jobId) {
    fs.readdir(jobPath, (err, files) => {
      // really abuse js evaluation of integers as strings
      // heritrix launch ids are dates in YYYYMMDD... basically an integer
      // so babel will make this Math.max.apply(Math,array)
      let latestLaunch = Math.max(...files.filter(item => this.launchId.test(item)))
      let logPath = path.join(jobPath, `${latestLaunch}`, 'logs', 'progress-statistics.log')
      log(`found log for latest launch ${logPath}`)
      let logWatcher = chokidar.watch(logPath, {
        awaitWriteFinish: true,
        followSymlinks: true,
      })
      this.monitoring.set(jobId, {
        logWatcher,
        errorCount: 0
      })
      logWatcher.on('change', (path) => {
        getCrawlStats(path)
          .then(stats => {
            log(`crawlJob-status-update ${jobId}`, stats)
            if (stats.ended) {
              logWatcher.close()
              this.monitoring.delete(jobId)
              this.emit('crawljob-status-ended', {
                jobId,
                stats
              })
            } else {
              this.emit('crawljob-status-update', {
                jobId,
                stats
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
              log('crawlstat-monitoring-endedExecption', jobId)
              this.emit('crawlJob-monitoring-endedExecption', jobId)
            } else {
              mo.errorCount = errorCount
              this.monitoring.set(jobId, mo)
            }
          })

      })
        .on('error', error => log(`Watcher error: ${error}`))
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
  stopMonitoring(jobId) {
    if (this.monitoring.has(jobId)) {
      let {
        logWatcher,
        errorCount,
      } = this.monitoring.get(jobId)
      logWatcher.close()
      this.monitoring.delete(jobId)
      this.emit(`stopped-monitoring-${jobId}`)
    } else {
      this.emit(`stopped-monitoring-${jobId}`)
    }
  }
}