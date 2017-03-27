const cheerio = require('cheerio')
const urlType = require('url-type')
const url = require('url')
const _ = require('lodash')
const fp = require('lodash/fp')

const outLinkIs = (outlink, seedHost) => {
  if (outlink && outlink.indexOf('mailto:') < 0) {
    let relTo = urlType.relativeTo(outlink)
    if (relTo && (relTo === 'directory' || relTo === 'origin')) {
      return 'sd'
    } else {
      if (url.parse(outlink).hostname === seedHost) {
        return 'sd'
      } else {
        return 'el'
      }
    }
  }
}

const makeATagExtractor = (linkConfig, seedUrl, seen, ret) => {
  switch (linkConfig) {
    case 'psd':
      return function (i, elem) {
        let outlink = elem.attribs.href
        let startedWithHash = false
        if (outlink) {
          let olIs = outLinkIs(outlink, seedUrl)
          if (urlType.isRelative(outlink)) {
            startedWithHash = outlink.startsWith('#')
            outlink = url.resolve(seedUrl, outlink)
          }
          if (outlink.indexOf('mailto:') < 0) {
            if (!seen.has(outlink) && !startedWithHash) {
              ret.outlinks += `outlink: ${outlink} L a/@href\r\n`
              if (olIs === 'sd') {
                ret.keep.push(outlink)
              }
              seen.add(outlink)
            }
          }
        }
      }
    case 'pal':
      return function (i, elem) {
        let outlink = elem.attribs.href
        let startedWithHash = false
        if (outlink) {
          if (urlType.isRelative(outlink)) {
            startedWithHash = outlink.startsWith('#')
            outlink = url.resolve(seedUrl, outlink)
          }
          if (outlink.indexOf('mailto:') < 0) {
            if (!seen.has(outlink) && !startedWithHash) {
              ret.outlinks += `outlink: ${outlink} L a/@href\r\n`
              ret.keep.push(outlink)
              seen.add(outlink)
            }
          }
        }
      }
    default:
      return function (i, elem) {
        let outlink = elem.attribs.href
        let startedWithHash = false
        if (outlink) {
          if (urlType.isRelative(outlink)) {
            startedWithHash = outlink.startsWith('#')
            outlink = url.resolve(seedUrl, outlink)
          }
          if (outlink.indexOf('mailto:') < 0) {
            if (!seen.has(outlink) && !startedWithHash) {
              ret.outlinks += `outlink: ${outlink} L a/@href\r\n`
              seen.add(outlink)
            }
          }
        }
      }
  }
}

const makeEmbeddedMiscExtractor = (seedUrl, seen, ret) => function (i, elem) {
  let outlink = elem.attribs.src
  if (outlink) {
    if (urlType.isRelative(outlink)) {
      outlink = url.resolve(seedUrl, outlink)
    }
    if (outlink.indexOf('mailto:') < 0) {
      if (!seen.has(outlink)) {
        ret.outlinks += `${outlink} E =EMBED_MISC\r\n`
        seen.add(outlink)
      }
    }
  }
}

const extractOutLinks = (seedUrl, theDom, linkConfig = 'po') => {
  const $ = cheerio.load(theDom)
  const seen = new Set()
  const ret = {outlinks: '', keep: []}
  const embedMiscEx = makeEmbeddedMiscExtractor(seedUrl, seen, ret)

  $('a').each(makeATagExtractor(linkConfig, seedUrl, seen, ret))
  $('img').each(embedMiscEx)
  $('style[href]').each(embedMiscEx)
  $('script[src]').each(embedMiscEx)
  $('link').each(embedMiscEx)
  $('embed').each(embedMiscEx)
  $('object').each(embedMiscEx)
  $('applet').each(embedMiscEx)
  $('video').each(embedMiscEx)
  $('audio').each(embedMiscEx)
  $('bgsound').each(embedMiscEx)
  $('iframe').each(embedMiscEx)

  return ret
}

const sdReducer = (acum, link) => {
  if (link.olIs === 'sd' && link.from === 'href') {
    acum.keep.push(link.link)
  }
  acum.outlinks += link.ol
  return acum
}

const allReducer = (acum, link) => {
  if (link.from === 'href') {
    acum.keep.push(link.link)
  }
  acum.outlinks += link.ol
  return acum
}

const poReducer = (acum, link) => {
  acum.outlinks += link.ol
  return acum
}

const makeLinkFun = linkConfig => {
  if (linkConfig === 'psd') {
    return fp.flow(
      fp.filter(it => it.from !== 'bad'),
      fp.uniqBy(it => it.link.toLowerCase()),
      fp.reduce(sdReducer, {outlinks: '', keep: []})
    )
  } else if (linkConfig === 'pal') {
    return fp.flow(
      fp.filter(it => it.from !== 'bad'),
      fp.uniqBy(it => it.link.toLowerCase()),
      fp.reduce(allReducer, {outlinks: '', keep: []})
    )
  } else {
    return fp.flow(
      fp.filter(it => it.from !== 'bad'),
      fp.uniqBy(it => it.link.toLowerCase()),
      fp.reduce(poReducer, {outlinks: '', keep: []})
    )
  }
}

module.exports = {
  extractOutLinks,
  makeLinkFun
}
