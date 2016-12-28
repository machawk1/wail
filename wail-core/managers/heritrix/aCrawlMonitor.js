import chokidar from 'chokidar'
import path from 'path'
import getCrawlStats from '../../util/getCrawStats'

export default class ACrawlMonitor {
  constructor (jobPath, jobId, onUpdate, onEnd, onExceedECount, watcherConfig) {
    this._added = []
    this._hasEnded = false
    this._closed = false
    this.started = new Date().getTime()
    this.logPath = path.join(jobPath, '**/progress-statistics.log')
    this.jobId = jobId
    this.onUpdate = onUpdate
    this.onEnd = onEnd
    this.errorCount = 0
    this.onExceedECount = onExceedECount

    console.log(`logpath for ${jobId} latest launch ${this.logPath}`)
    this.logWatcher = chokidar.watch(this.logPath, watcherConfig)
    this.logWatcher.on('add', filePath => {
      this._added.push(filePath)
      console.log(`File ${filePath} has been added`)
    })
    this.logWatcher.on('change', ::this._monitorUpdate)
    this.logWatcher.on('error', ::this._monitorError)
  }

  _monitorUpdate (filePath, stats) {
    if (!this._hasEnded) {
      getCrawlStats(filePath)
        .then(stats => {
          // console.log(`crawlJob-status-update ${this.jobId}`, stats)
          if (stats.ended) {
            this.stopWatching()
            let finalStats = Object.assign({}, {
              started: this.started,
              warcs: path.normalize(`${filePath}/../../warcs/*.warc`)
            }, stats)
            this.onEnd(this.jobId, { jobId: this.jobId, stats: finalStats })
          } else {
            this.onUpdate({
              jobId: this.jobId,
              stats: Object.assign({}, { started: this.started }, stats)
            })
          }
        })
        .catch(error => {
          this._statsGetterError(error)
        })
    }
  }

  _monitorError (error) {
    console.log(`Watcher error: ${error}`)
    console.error(error)
    this.errorCount++
    if (this.errorCount >= 10) {
      this.stopWatching()
      this.onExceedECount(this.jobId)
    }
  }

  _statsGetterError (error) {
    console.log(`statsGetterError: ${error}`)
    console.error(error)
    this.errorCount++
    if (this.errorCount >= 10) {
      this.stopWatching()
      this.onExceedECount(this.jobId)
    }
  }

  stopWatching () {
    if (!this._closed) {
      this._hasEnded = true
      this._added.forEach(f => {
        this.logWatcher.unwatch(f)
      })
      this.logWatcher.close()
      this._closed = true
      this.logWatcher = null
    }
  }

  isEnded () {
    return this._hasEnded
  }

  isClosed () {
    return this._closed
  }
}
