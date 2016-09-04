import RunInfo from './runInfo'

export default class CrawlInfo {
  constructor (urls, depth, path, confP, running = false, runs = [], forCol = 'Wail') {
    this.urls = urls
    this.forCol = forCol
    this.depth = depth
    this.path = path
    this.confP = confP
    this.running = running
    let Runs = null
    if (Runs.length > 0) {
      Runs = runs.map(r => new RunInfo(...r))
    } else {
      Runs = runs
    }
    this.runs = Runs
    this._sortRuns()
  }

  _sortRuns () {
    this.runs.sort((j1, j2) => {
      if (j1.tsMoment.isBefore(j2.tsMoment)) {
        return 1
      }

      if (j1.tsMoment.isAfter(j2.tsMoment)) {
        return -1
      }

      return 0
    })
  }

  toString () {
    return `CrawlInfo[forCol: ${this.forCol}, urls: ${this.urls}, running: ${this.running}, #runs:${this.runs.length}]`
  }

}