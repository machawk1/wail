import fs from "fs-extra"
import autobind from "autobind-decorator"
import moment from "moment"
import os from "os"

export default class logger {
  constructor (options) {
    this.path = options.path
    this.endline = os.EOL
    fs.ensureFileSync(this.path)
    this.fileStream = fs.createWriteStream(this.path,{flags: 'a'})
  }

  @autobind
  info(msg){
    let date = moment().format("MM/DD/YYYY hh:mm:ssa")
    this.fileStream.write(`[${date}] [info] ${msg}${this.endline}`)
  }

  @autobind
  error(msg){
    let date = moment().format("MM/DD/YYYY hh:mm:ssa")
    this.fileStream.write(`[${date}] [error] ${msg}${this.endline}`)
  }

  @autobind
  cleanUp() {
    this.fileStream.end()
  }

}
