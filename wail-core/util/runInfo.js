import moment from 'moment'

export default class RunInfo {
  constructor (ending, ended, timestamp,
               discovered, queued, downloaded) {

    this._ending = ending
    this._ended = ended
    this._timestamp = timestamp
    this._tsMoment = moment(timestamp)
    this._discovered = discovered
    this._queued = queued
    this._downloaded = downloaded
  }

  get ending () {
    return this._ending
  }

  get ended () {
    return this._ended
  }

  get timestamp () {
    return this._timestamp
  }

  get tsMoment () {
    return this._tsMoment
  }

  get discovered () {
    return this._discovered
  }

  get queued () {
    return this._queued
  }

  get downloaded () {
    return this._downloaded
  }

}