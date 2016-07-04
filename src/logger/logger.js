import fs from "fs-extra"
import util from "util"
import moment from "moment"
import os from "os"

const maxFileSize = 5 * 1024 * 1024
const fileFormat = '[{m}:{d}:{y} {h}:{i}:{s}] [{level}] {text}'
//[06:01:2016 14:55:13] [info] accessibilityMonitor  there was an update to service statuses: heritrix[true] wayback[true]

export default class logger {
  constructor (options) {
    this.path = options.path
    this.endline = os.EOL
    this.fileStream = fs.createWriteStream(options.streamConf || {flags: 'a'})
    
  }

  info(msg){
    let date =
    this.fileStream.write(`[] [info] ${msg}${this.endline}`)
  }

  error(){

  }

  pad(number,zeros){
    zeros = zeros || 2
    return (new Array(zeros + 1).join('0') + number).substr(-zeros, zeros)
  }
}
