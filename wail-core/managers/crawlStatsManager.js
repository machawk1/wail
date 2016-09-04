import autobind from 'autobind-decorator'
import chokidar from 'chokidar'
import {ipcRender as ipc} from 'electron'
import fs from 'fs-extra'
import path from 'path'
import Promise from 'bluebird'
import S from 'string'
import split2 from 'split2'
import {NullStatsError} from '../errors'


const jobRunningRe = /[a-zA-Z0-9\-:]+\s(?:CRAWL\s((?:RUNNING)|(?:EMPTY))\s-\s)(?:(?:Running)|(?:Preparing))/
const jobEndingRe = /[a-zA-Z0-9\-:]+\s(?:CRAWL\sEND(?:ING).+)/
const jobEndRe = /[a-zA-Z0-9\-:]+\s(?:CRAWL\sEND(?:(?:ING)|(?:ED)).+)/
const jobStatusRec = /(:<timestamp>[a-zA-Z0-9\-:]+)\s+(:<discovered>[0-9]+)\s+(:<queued>[0-9]+)\s+(:<downloaded>[0-9]+)\s.+/
const jobStatusRe = /([a-zA-Z0-9\-:]+)\s+([0-9]+)\s+([0-9]+)\s+([0-9]+)\s.+/

function getStats (logPath) {
  return new Promise((resolve, reject) => {
    let jobEnding = false
    let jobEnded = false
    let latestStats = null
    let rstream = fs.createReadStream(logPath)
      .pipe(split2())
      .on('data', line => {
        if (!jobEnding && !jobEnded) {
          if (jobEndingRe.test(line)) {
            jobEnding = true
          } else {
            if (jobStatusRe.test(line)) {
              latestStats = line
            }
          }
        } else {
          if (!jobEnded) {
            if (jobEndRe.test(line)) {
              jobEnded = true
            } else {
              if (jobStatusRe.test(line)) {
                latestStats = line
              }
            }
          } else {
            if (jobStatusRe.test(line)) {
              latestStats = line
            }
          }
        }
      })
      .on('end', () => {
        console.log('send')
        if (latestStats === null) {
          reject(new NullStatsError(`Latests stats was null for ${logPath}`))
        } else {
          rstream.destroy()
          let fields = S(latestStats).collapseWhitespace().s.split(' ')
          resolve({
            ending: jobEnding,
            ended: jobEnded,
            timestamp: moment(fields[ 0 ]).format(),
            discovered: fields[ 1 ],
            queued: fields[ 2 ],
            downloaded: fields[ 3 ]
          })
        }
      })
  })
}

export default class StatMonitor {
  constructor () {
    this.monitoring = new Map()
    this.launchId = /^[0-9]+$/
  }

  @autobind
  startMonitoring (jobPath, jobId) {
    fs.readdir(jobPath, (err, files) => {
      let latestLaunch = Math.max(...files.filter(item => this.launchId.test(item)))
      let logPath = path.join(jobPath, `${latestLaunch}`, 'logs', 'progress-statistics.log')
      let logWatcher = chokidar.watch(logPath, {
        awaitWriteFinish: true,
        followSymlinks: true,
      })
      this.monitoring.set(jobId, {
        logWatcher,
        errorCount: 0
      })
      logWatcher.on('change', (path) => {
        getStats(path)
          .then(stats => {
            ipc.send('crawljob-status-update',{
              jobId,
              stats
            })
            if(stats.ended) {
              logWatcher.close()
              this.monitoring.delete(jobId)
            }
          })
          .catch(error => {
            console.error(error)
            let mo = this.monitoring.get(jobId)
            let { errorCount, logWatcher } = mo
            errorCount = errorCount + 1
            if(errorCount >= 10) {
              logWatcher.close()
              this.monitoring.delete(jobId)
              ipc.send('crawlstat-monitoring-endedExecption',jobId)
            } else {
              mo.errorCount = errorCount
              this.monitoring.set(jobId,mo)
            }
          })
      })
    })
  }

  stopMonitoring() {
    for (let {logWatcher, errorCount } of this.monitoring.values()) {
      logWatcher.close()
    }
    ipc.send('crawlStats-monitoring-stoped')
  }

}