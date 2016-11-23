const cheerio = require('cheerio')
const Promise = require('bluebird')
const fs = require('fs-extra')
const moment = require('moment')
const EventEmitter = require('eventemitter3')
const S = require('string')
const url = require('url')
const urlType = require('url-type')
const uuid = require('./node-uuid')
const {
  warcHeader,
  warcHeaderContent,
  warcMetadataHeader,
  recordSeparator
} = require('./warcFields')

Promise.promisifyAll(fs)
window.fse = fs

const toPath = '/home/john/WebstormProjects/testWarcreateElectron/test6.warc'

class WarcWriter extends EventEmitter {
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
    console.time('writting warc')
    let { seedUrl, networkMonitor, dtDom, ua, preserveA } = config
    console.log(ua)
    let { doctype, dom }  = dtDom
    let { outlinks }  =  this.extractOutlinks(seedUrl, dom, preserveA)
    // console.log(doctype)
    networkMonitor.matchNetworkToWC(seedUrl)
    networkMonitor.wcRequests.get(seedUrl).addSeedUrlBody(`<!DOCTYPE ${doctype}>\n${dom}`)
    networkMonitor.wcRequests.retrieve()
      .then(() => {
        let now = new Date().toISOString()
        now = now.substr(0, now.indexOf('.')) + 'Z'
        let rid = uuid.v1()
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
          rid: uuid.v1()
        }).s, 'utf8')
        let opts = { seedUrl, concurrentTo: rid, now }
        let warcOut = fs.createWriteStream(toPath)
        warcOut.on('error', err => {
          console.error('error happened while writting to the warc', err)
        })
        warcOut.on('finish', () => {
          console.log('All writes are now complete.')
          warcOut.destroy()
          console.timeEnd('writting warc')
        })
        warcOut.write(wh, 'utf8')
        warcOut.write(whc, 'utf8')
        warcOut.write(recordSeparator, 'utf8')
        warcOut.write(wmh, 'utf8')
        warcOut.write(wmhc, 'utf8')
        warcOut.write(recordSeparator, 'utf8')
        let writeIter = networkMonitor.reqWriteIterator(opts)
        const doWrite = () => {
          console.log('doing write', new moment().format())
          let next = writeIter.next()
          if (!next.done) {
            warcOut.write(next.value, 'utf8', doWrite)
          } else {
            warcOut.end()
          }
        }

        doWrite()
      })
    //
    // let it = {}

    //
    // for (let [url,winfo] of networkMonitor.wcRequests) {
    //   console.log(url)
    //   // winfo.writeToWarcFile2(warcOut, '', opts)
    //   console.log('----------------\n\n')
    // }
    // warcOut.end()

    // this.extractOutlinks(aUrl, theDom, preserveA)

    // networkInfo.wcRequests.retrieve(aUrl)
    //   .then(() => {
    //     // let warcOut = fs.createWriteStream(toPath)
    //     // warcOut.on('end', () => {
    //     //   console.log('it endded')
    //     // })
    //     // warcOut.on('finish', () => {
    //     //   console.error('All writes are now complete.')
    //     //   warcOut.destroy()
    //     // })
    //     // for (let it of networkInfo.wcRequests.resources()) {
    //     //   if (it.rdata) {
    //     //     console.log(it)
    //     //     try {
    //     //       warcOut.write(it.rdata.body,'utf8')
    //     //     } catch (e) {
    //     //       console.error(e)
    //     //     }
    //     //   }
    //     //   warcOut.write('\r\n')
    //     // }
    //     // warcOut.end()
    //
    //   })
    // for (let [url,winfo] of networkInfo.wcRequests) {
    //   let ninfo = networkInfo.networkRequests.get(url)
    //   if (winfo.response.method !== 'POST') {
    //     if (aUrl === url) {
    //       console.log('we found net info for initial request', winfo, ninfo)
    //     } else {
    //       if (ninfo) {
    //         console.log(url)
    //         console.log('wcinfo', winfo.request, winfo.response)
    //         console.log('ninfo', ninfo.request, ninfo.response)
    //         console.log('---------------------\n\n')
    //       }
    //     }
    //   }
    // }
  }
}

module.exports = WarcWriter

/*
 let ninfo = networkInfo.networkRequests.get(url)
 if (winfo.response.method !== 'POST') {
 if (aUrl === url) {
 console.log('we found net info for initial request')
 if (ninfo.response.headersText && ninfo.response.requestHeadersText) {
 let { headersText, requestHeadersText } = ninfo.response
 console.log(headersText, requestHeadersText)
 } else {
 let { requestHeaders } = winfo.request
 let { responseHeaders } = winfo.response
 console.log(requestHeaders, responseHeaders)
 }
 } else {
 if (ninfo) {

 if (ninfo.response.headersText && ninfo.response.requestHeadersText) {
 let { headersText, requestHeadersText } = ninfo.response
 console.log(headersText, requestHeadersText)
 } else {
 console.log('baddd', url)
 console.log(winfo.request, winfo.response)
 }
 }
 }
 }
 it[ url ] = {
 winfo, ninfo
 }
 */