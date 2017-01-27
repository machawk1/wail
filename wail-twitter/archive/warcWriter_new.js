const Promise = require('bluebird')
const fs = require('fs-extra')
const uuid = require('uuid/v1')
const S = require('string')
const moment = require('moment')
const EventEmitter = require('eventemitter3')
const {
  warcHeader,
  warcHeaderContent,
  warcMetadataHeader,
  recordSeparator
} = require('./warcFields')

const toPath = '/home/john/WebstormProjects/testWarcreateElectron/pageO2.warc'

class WarcWriter extends EventEmitter {
  constructor () {
    super()
  }

  *makeWriteIter ({seedUrl, networkMonitor, outlinks, ua}) {
    let now = new Date().toISOString()
    now = now.substr(0, now.indexOf('.')) + 'Z'
    let rid = uuid()
    let swapper = S(warcHeaderContent)
    let whc = Buffer.from('\r\n' + swapper.template({
        version: '156',
        isPartOfV: 'sads',
        warcInfoDescription: 'dsadsaas',
        ua
      }).s + '\r\n', 'utf8')

    let wh = Buffer.from(swapper.setValue(warcHeader).template({
      fileName: 'test.warc',
      now,
      len: whc.length,
      rid
    }).s, 'utf8')

    let wmhc = Buffer.from('\r\n' + outlinks + '\r\n', 'utf8')
    let wmh = Buffer.from(swapper.setValue(warcMetadataHeader).template({
      targetURI: seedUrl,
      now,
      len: wmhc.length,
      concurrentTo: rid,
      rid: uuid()
    }).s, 'utf8')
    let opts = {seedUrl, concurrentTo: rid, now}
    yield wh
    yield whc
    yield recordSeparator
    yield wmh
    yield wmhc
    yield recordSeparator
    yield * networkMonitor.reqWriteIterator(opts)
  }

  writeWarc (config) {
    const warcOut = fs.createWriteStream(toPath)
    warcOut.on('error', err => {
      console.error('error happened while writting to the warc', err)
    })
    warcOut.on('finish', () => {
      console.log('All writes are now complete.')
      warcOut.destroy()
      this.emit('done')
    })
    const writeIter = this.makeWriteIter(config)
    const doWrite = () => {
      let next = writeIter.next()
      if (!next.done) {
        warcOut.write(next.value, 'utf8', doWrite)
      } else {
        warcOut.end()
      }
    }
    doWrite()
  }

  appendToWarc (config) {
    const warcOut = fs.createWriteStream(toPath, {flags: 'a'})
    warcOut.on('error', err => {
      console.error('error happened while writting to the warc', err)
    })
    warcOut.on('finish', () => {
      console.log('All writes are now complete.')
      warcOut.destroy()
      this.emit('done')
    })
    const writeIter = this.makeWriteIter(config)
    const doWrite = () => {
      let next = writeIter.next()
      if (!next.done) {
        warcOut.write(next.value, 'utf8', doWrite)
      } else {
        warcOut.end()
      }
    }
    console.time('writting warc')
    doWrite()
  }
}
module.exports = WarcWriter
