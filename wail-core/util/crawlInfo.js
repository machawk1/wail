export default class CrawlInfo {
  constructor (urls, depth, path, confP, running = false, runs = [], forCol = 'Wail') {
    this._urls = urls
    this._forCol = forCol
    this._depth = depth
    this._path = path
    this._confP = confP
    this._running = running
    this._runs = runs
  }

  get urls () {
    return this._urls
  }

  get depth () {
    return this._depth
  }

  get path () {
    return this._path
  }

  get confP () {
    return this._confP
  }

  get running () {
    return this._running
  }

  get runs () {
    return this._runs
  }

  get forCol () {
    return this._forCol
  }
}