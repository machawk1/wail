import cheerio from 'cheerio'
import Promise from 'bluebird'
import fs from 'fs-extra'
import EventEmitter from 'eventemitter3'
import S from 'string'
import url from 'url'
import urlType from 'url-type'
import uuid from './node-uuid'
import warcFields from './warcFields'
const {
  warcHeader,
  warcHeaderContent,
  warcMetadataHeader,
  recordSeparator
} = warcFields

Promise.promisifyAll(fs)
window.fse = fs

export default class WarcWriter extends EventEmitter {
  constructor () {
    super()
  }

  extractOutlinks (seedUrl, theDom, preserveA = false) {
    let dom = cheerio.load(theDom)
    let outlinks = new Set()
    let ret = {
      outlinks: ''
    }
    if (preserveA) {
      ret.aTags = new Set()
    }

    dom('img').each(function (i, elem) {
      let outlink = elem.attribs.src
      if (outlink) {
        if (urlType.isRelative(outlink)) {
          outlink = url.resolve(seedUrl, outlink)
        }
        if (outlink.indexOf('mailto:') < 0) {
          if (!outlinks.has(outlink)) {
            ret.outlinks += `${outlink} E =EMBED_MISC\r\n`
            outlinks.add(outlink)
          }
        }
      }
    })

    dom('style[href]').each(function (i, elem) {
      let outlink = elem.attribs.href
      if (outlink) {
        if (urlType.isRelative(outlink)) {
          outlink = url.resolve(seedUrl, outlink)
        }
        if (outlink.indexOf('mailto:') < 0) {
          if (!outlinks.has(outlink)) {
            ret.outlinks += `${outlink}  E =EMBED_MISC\r\n`
            outlinks.add(outlink)
          }
        }
      }
    })

    dom('script[src]').each(function (i, elem) {
      let outlink = elem.attribs.src
      if (outlink) {
        if (urlType.isRelative(outlink)) {
          outlink = url.resolve(seedUrl, outlink)
        }
        if (outlink.indexOf('mailto:') < 0) {
          if (!outlinks.has(outlink)) {
            ret.outlinks += `${outlink} E script/@src\r\n`
            outlinks.add(outlink)
          }
        }
      }
    })

    dom('a').each(function (i, elem) {
      let outlink = elem.attribs.href
      if (outlink) {
        if (urlType.isRelative(outlink)) {
          outlink = url.resolve(seedUrl, outlink)
        }
        if (outlink.indexOf('mailto:') < 0) {
          if (!outlinks.has(outlink)) {
            ret.outlinks += `outlink: ${outlink} L a/@href\r\n`
            outlinks.add(outlink)
            if (preserveA) {
              ret.aTags.add(outlink)
            }
          }
        }
      }
    })
    return ret
  }

  writeWarc (config) {
    let {seedUrl, networkMonitor, dtDom, ua, preserveA, toPath, header} = config
    let {doctype, dom} = dtDom
    let {outlinks} = this.extractOutlinks(seedUrl, dom, preserveA)
    // console.log(doctype)
    networkMonitor.matchNetworkToWC(seedUrl)
    networkMonitor.wcRequests.get(seedUrl).addSeedUrlBody(`<!DOCTYPE ${doctype}>\n${dom}`)
    networkMonitor.wcRequests.retrieve()
      .then(() => {
        let warcOut = fs.createWriteStream(toPath)
        warcOut.on('error', err => {
          console.error('error happened while writting to the warc', err)
          warcOut.end()
          this.emit('error', err)
        })
        warcOut.on('finish', () => {
          console.log('All writes are now complete.')
          this.emit('finished')
          warcOut.destroy()
        })

        const writeIter = this.createWriteIterator(header, ua, toPath, outlinks, seedUrl, networkMonitor)
        const doWrite = () => {
          let next = writeIter.next()
          if (!next.done) {
            warcOut.write(next.value, 'utf8', doWrite)
          } else {
            warcOut.end()
          }
        }
        doWrite()
      })
      .catch(error => {
        this.emit('error', error)
      })
  }

  * createWriteIterator (header, ua, toPath, outlinks, seedUrl, networkMonitor) {
    let now = new Date().toISOString()
    now = now.substr(0, now.indexOf('.')) + 'Z'
    let rid = uuid.v1()
    let swapper = S(warcHeaderContent)
    let whc = Buffer.from('\r\n' + swapper.template({
        version: '0.1',
        isPartOfV: header.isPartOfV,
        warcInfoDescription: header.description,
        ua
      }).s + '\r\n', 'utf8')

    let wh = Buffer.from(swapper.setValue(warcHeader).template({
      fileName: toPath,
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
      rid: uuid.v1()
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
}
