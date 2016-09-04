export class NullStatsError extends Error {
  constructor (message) {
    super()
    Error.captureStackTrace(this, NullStatsError)
    this.name = 'NullStatsError'
    this.message = message
  }
}

