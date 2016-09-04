import fs from 'fs-extra'
import moment from 'moment'
import {NullStatsError} from '../errors'
import Promise from 'bluebird'
import S from 'string'
import split2 from 'split2'

const jobRunningRe = /[a-zA-Z0-9\-:]+\s(?:CRAWL\s((?:RUNNING)|(?:EMPTY))\s-\s)(?:(?:Running)|(?:Preparing))/
const jobEndingRe = /[a-zA-Z0-9\-:]+\s(?:CRAWL\sEND(?:ING).+)/
const jobEndRe = /[a-zA-Z0-9\-:]+\s(?:CRAWL\sEND(?:(?:ING)|(?:ED)).+)/
const jobStatusRec = /(:<timestamp>[a-zA-Z0-9\-:]+)\s+(:<discovered>[0-9]+)\s+(:<queued>[0-9]+)\s+(:<downloaded>[0-9]+)\s.+/
const jobStatusRe = /([a-zA-Z0-9\-:]+)\s+([0-9]+)\s+([0-9]+)\s+([0-9]+)\s.+/


export default function getCrawlStats (logPath) {
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