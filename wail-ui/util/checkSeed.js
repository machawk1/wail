import cheerio from 'cheerio'
import Promise from 'bluebird'
import _ from 'lodash'
import {STATUS_CODES} from 'http'
import normalizeUrl from 'normalize-url'
import rp from 'request-promise'
import {StatusCodeError, RequestError} from 'request-promise/errors'
import urlType from 'url-type'
import url from 'url'
import zlib from 'zlib'

const uriSanity = _.partialRight(normalizeUrl, { stripWWW: false, removeTrailingSlash: false })

const linkStat = (outlink, stats, seedHost) => {
  if (outlink && outlink.indexOf('mailto:') < 0) {
    let relTo = urlType.relativeTo(outlink)
    if (relTo) {
      if (relTo === 'directory') {
        stats[ 'Internal Links' ]++
      } else if (relTo === 'origin') {
        stats[ 'Same Domain' ]++
      } else {
        if (url.parse(outlink).hostname === seedHost) {
          stats[ 'Same Domain' ]++
        } else {
          stats[ 'External Links' ]++
        }
      }
    } else {
      if (url.parse(outlink).hostname === seedHost) {
        stats[ 'Same Domain' ]++
      } else {
        stats[ 'External Links' ]++
      }
    }
  }
}

const determinLinkType = (link, stats, seedHost) => {
  if (link && link.rel) {
    let rel = link.rel.toLowerCase()
    if (rel.indexOf('stylesheet') >= 0) {
      stats.Style++
      linkStat(link.href, stats, seedHost)
    } else if (rel.indexOf('icon') >= 0) {
      stats.Images++
      linkStat(link.href, stats, seedHost)
    }
  }
}

const statBody = (seedUrl, theDom) => {
  let stats = {
    Images: 0,
    Style: 0,
    Iframes: 0,
    Embed: 0,
    Scripts: 0,
    Object: 0,
    Applet: 0,
    Audio: 0,
    Video: 0,
    'Internal Links': 0,
    'Same Domain': 0,
    'External Links': 0
  }
  let seedHost = url.parse(seedUrl).hostname
  let $ = cheerio.load(theDom)

  $('a').each(function (i, elem) {
    if (elem.attribs) {
      linkStat(elem.attribs.href, stats, seedHost)
    }
  })

  $('link').each(function (i, elem) {
    determinLinkType(elem.attribs, stats, seedHost)
  })

  $('script[src]').each(function (i, elem) {
    linkStat(elem.attribs.src, stats, seedHost)
    stats.Scripts++
  })

  $('img').each(function (i, elem) {
    if (elem.attribs) {
      linkStat(elem.attribs.src, stats, seedHost)
    }
    stats.Images++
  })

  $('embed').each(function (i, elem) {
    if (elem.attribs) {
      linkStat(elem.attribs.src, stats, seedHost)
    }
    stats.Embed++
  })

  $('object').each(function (i, elem) {
    if (elem.attribs) {
      linkStat(elem.attribs.data, stats, seedHost)
    }
    stats.Object++
  })

  $('applet').each(function (i, elem) {
    if (elem.attribs) {
      linkStat(elem.attribs.src, stats, seedHost)
    }
    stats.Applet++
  })

  $('video').each(function (i, elem) {
    if (elem.attribs) {
      linkStat(elem.attribs.src, stats, seedHost)
    }
    stats.Video++
  })

  $('audio').each(function (i, elem) {
    if (elem.attribs) {
      linkStat(elem.attribs.src, stats, seedHost)
    }
    stats.Audio++
  })

  $('bgsound').each(function (i, elem) {
    if (elem.attribs) {
      linkStat(elem.attribs.src, stats, seedHost)
    }
    stats.Audio++
  })

  $('iframe').each(function (i, elem) {
    if (elem.attribs) {
      linkStat(elem.attribs.src, stats, seedHost)
    }
    stats.Iframes++
  })
  return stats
}

const unGZ = gzipped => new Promise((resolve, reject) => {
  zlib.gunzip(gzipped, (err, dezipped) => {
    if (err) {
      reject(err)
    } else {
      resolve(dezipped.toString('utf-8'))
    }
  })
})

const makeRequest = (config) => new Promise((resolve, reject) =>
  rp(config)
    .then(res => {
      let cType = res.headers[ 'content-type' ]
      if (cType) {
        if (cType.toLowerCase().indexOf('html') > 0) {
          let encoding = res.headers[ 'content-encoding' ]
          if (encoding && encoding.indexOf('gzip') >= 0) {
            return unGZ(res.body)
              .then(body => {
                resolve(body)
              })
              .catch(error => {
                reject({
                  wasError: true,
                  m: 'HTTP 200 OK<br>The html page was gziped<br>and an error happened while un-gzipping it.'
                })
              })
          } else {
            resolve(res.body)
          }
        } else {
          reject({
            wasError: true,
            m: `HTTP 200 OK<br>The URI did not have content type html<br>It was ${cType}`
          })
        }
      } else {
        reject({ wasError: true, m: 'HTTP 200 OK<br>No content type was specified in the response.' })
      }
    })
    .catch(StatusCodeError, (reason) => {
      // not 2xx
      let humanized = STATUS_CODES[ reason.statusCode ]
      let c = `${reason.statusCode}`[ 0 ]
      let { headers } = reason.response
      if (c === '3') {
        let toWhere
        if (headers[ 'location' ]) {
          toWhere = `<br>The location pointed to is<br>${headers[ 'location' ]}`
        } else {
          toWhere = '<br>No location was given<br>in the response headers'
        }
        reject({
          wasError: true,
          m: `HTTP ${reason.statusCode} ${humanized}${toWhere}`
        })
      } else {
        // just report
        reject({
          wasError: true,
          m: `HTTP ${reason.statusCode} ${humanized}`
        })
      }
    })
    .catch(RequestError, (reason) => {
      console.log(reason.error)
      if (reason.error.code === 'ENOTFOUND') {
        reject({ wasError: true, m: 'The URI was not found on DNS lookup' })
      } else {
        reject({ wasError: true, m: 'Severe error happened<br>Are you connected to the internet?' })
      }
    }))

const checkSeed = (seed) => {
  let uri = uriSanity(seed)
  let config = {
    method: 'GET',
    followRedirect: false,
    uri,
    resolveWithFullResponse: true
  }
  return new Promise((resolve, reject) =>
    makeRequest(config)
      .then(body => {
        resolve({
          wasError: false,
          stats: statBody(seed, body)
        })
      })
      .catch(error => {
        reject(error)
      })
  )
}

export default checkSeed
