import fs from 'fs-extra'
import autobind from 'autobind-decorator'
import moment from 'moment'
import os from 'os'

export default class logger {
  constructor (options) {
    this.path = options.path
    this.endline = os.EOL
    fs.ensureFileSync(this.path)
    this.fileStream = fs.createWriteStream(this.path, { flags: 'a' })
  }

  @autobind
  info (msg) {
    let date = moment().format("MM/DD/YYYY hh:mm:ssa")
    let lmsg = `[${date}] [info] ${msg}${this.endline}`
    this.fileStream.write(lmsg)
  }

  @autobind
  error (msg) {
    let date = moment().format("MM/DD/YYYY hh:mm:ssa")
    let lmsg = `[${date}] [error] ${msg}${this.endline}`
    this.fileStream.write(lmsg)
  }

  @autobind
  cleanUp () {
    this.fileStream.end()
  }

}
