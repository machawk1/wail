import { nonconfigurable, readonly } from 'core-decorators'
import {default as wc} from '../constants'

const {
  REQUEST_HERITRIX
} = wc.EventTypes

export class Request {
  constructor (type, rtype, from, options) {
    this.type = type
    this.rtype = rtype
    this.options = options
    this.from = from
    this.failedCount = 0
    this.hadToRetry = false
    this.completed = false
    this.trueFailure = false
    this.doRetry = false
  }

  handleError (err) {

  }

  completedSuccess () {

  }

  completedError () {

  }

  wasTrueFailure () {
    return this.trueFailure
  }

  retry () {
    return this.doRetry
  }

  resetFail () {
    this.failedCount = 0
    this.hadToRetry = false
    this.completed = false
    this.trueFailure = false
    this.doRetry = false
  }

}

export class HeritrixRequest extends Request {
  constructor (jobId, hRequestType, from, options, priority) {
    super(REQUEST_HERITRIX, hRequestType, from, options)
    this.jobId = jobId
    this.finalError = null
    this.priority = priority
  }

  handleError (err) {
    if (err.error.code === 'ETIMEDOUT') {
      if (!this.hadToRetry) {
        this.hadToRetry = this.doRetry = true
      } else {
        this.trueFailure = true
        this.doRetry = false
        this.completed = true
      }
    } else {
      if (err.statusCode === 303) {
        this.doRetry = false
        this.trueFailure = false
        this.completed = true
      } else {
        if (!this.hadToRetry) {
          this.hadToRetry = this.doRetry = true
        } else {
          this.trueFailure = true
          this.doRetry = false
          this.completed = true
          this.finalError = err
        }
      }
    }
  }
}
