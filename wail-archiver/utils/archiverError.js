export default class ArchiverError extends Error {
  constructor (dError) {
    super()
    this.dErorr = dError
  }
}
