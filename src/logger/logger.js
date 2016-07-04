import fs from "fs-extra"
import util from "util"
import os from "os"

export default class logger {
  constructor (options) {
    this.path = options.path
    this.endline = os.EOL
    this.fileStream = fs.createWriteStream(options.streamConf || {flags: 'a'})
  }
}
