import moment from 'moment'

export default class RunInfo {
  constructor (ending, ended, timestamp,
               discovered, queued, downloaded) {

    this.ending = ending
    this.ended = ended
    this.timestamp = timestamp
    this.tsMoment = moment(timestamp)
    this.discovered = discovered
    this.queued = queued
    this.downloaded = downloaded
  }
}