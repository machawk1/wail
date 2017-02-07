import rp from 'request-promise'
const {STATUS_CODES} = require('http')
import Promise from 'bluebird'
import _ from 'lodash'
import zlib from 'zlib'
import S from 'string'
import url from 'url'
import { cloneWC } from './util'
import uuid from './node-uuid'
import warcFields from './warcFields'
const {
  warcRequestHeader,
  warcResponseHeader,
  recordSeparator
} = warcFields

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const events = {
  'beforeSend': 1,
  'receiveHead': 2,
  'beforeRedirect': 3,
  'complete': 4,
  1: 'sendHead',
  2: 'receiveHead',
  3: 'beforeRedirect',
  4: 'complete'
}

const headerStringHelper = (s, pair) => {
  if (Array.isArray(pair[1])) {
    return s + pair[1].reduce((ss, val) => ss + `${pair[0]}: ${val}\r\n`, '')
  }
  return s + `${pair[0]}: ${pair[1]}\r\n`
}

function requestHttpString (r) {
  if (!r || !r.url) {
    console.error(r)
  }
  return `${r.method} ${url.parse(r.url).path} HTTP/1.1\r\n`
}
const responseHttpString = r => {
  let {statusLine, statusCode} = r
  if (statusLine.indexOf(STATUS_CODES[statusCode]) < 0) {
    console.log('badded we do not have the full status code', statusLine, statusCode, STATUS_CODES[statusCode])
    return `${statusLine.substr(0, 8)} ${statusCode} ${STATUS_CODES[statusCode]}\r\n`
  }
  return `${r.statusLine}\r\n`
}

const stringifyHeaders = (r, accessor) => _
  .sortBy(_.toPairs(r[accessor]), [0])
  .reduce((s, hpair) => headerStringHelper(s, hpair), '')

const makeHeaderString = (r, accessor, func) =>
func(r) + stringifyHeaders(r, accessor)

export default class Resource {
  constructor (url, type, method) {
    this.request = null
    this.response = null
    this.complete = null
    this.redirect = null
    this.matchedNinfo = null
    this.method = method
    this.type = type
    this.url = url
    this.completed = false
    this.didRedirect = false
    this.rdata = null
    this.getHeaders = null
    this.isSeed = false
    this.seedUrlHeaderMap = this.seedUrlHeaderMap.bind(this)
  }

  add (event, dets) {
    let eNum = events[event]
    if (eNum === 1) {
      if (!this.getHeaders) {
        this.getHeaders = dets.requestHeaders
      }
      this.request = cloneWC(dets)
    } else if (eNum === 2) {
      this.response = cloneWC(dets)
    } else if (eNum === 3) {
      this.redirect = cloneWC(dets)
      this.didRedirect = true
    } else {
      this.complete = cloneWC(dets)
      // this.complete.headerText = makeHeaderString(this.complete, 'responseHeaders', responseHttpString)
      this.completed = true
    }
  }

  seedUrlHeaderMap (v, k) {
    let lowerKey = k.toLowerCase()
    if (lowerKey === 'content-length') {
      return `${this.rdata.length}`
    } else if (lowerKey === 'content-encoding') {
      return null
    } else if (lowerKey === 'content-type') {
      if (this.url.indexOf('twitter.com') > -1) {
        return v.replace('text/javascript', 'text/html')
      } else {
        return v
      }
    }
    return v
  }

  addSeedUrlBody (dom) {
    this.isSeed = true
    this.rdata = Buffer.from(dom, 'utf8')
    this.response.statusLine = this.response.statusLine.replace('HTTP/1.1 304 Not Modified', 'HTTP/1.1 200 OK')
    if (this.response) {
      this.response.responseHeaders = _.omitBy(_.mapValues(this.response.responseHeaders, this.seedUrlHeaderMap), _.isNull)
    }
    if (this.redirect) {
      this.redirect.responseHeaders = _.omitBy(_.mapValues(this.redirect.responseHeaders, this.seedUrlHeaderMap), _.isNull)
      console.log(this.redirect.responseHeaders)
    }
    if (this.completed) {
      this.complete.responseHeaders = _.omitBy(_.mapValues(this.complete.responseHeaders, this.seedUrlHeaderMap), _.isNull)
    }
  }

  _response () {
    if (this.redirect) {
      return this.redirect
    } else if (this.completed) {
      return this.complete
    } else {
      return this.response
    }
  }

  * yeildWritable (opts) {
    let {seedUrl, concurrentTo, now} = opts
    if (this.method === 'GET') {
      let res = this._response()
      let reqHeaderString
      let resHeaderString
      if (res && this.request) {
        reqHeaderString = makeHeaderString(this.request, 'requestHeaders', requestHttpString)
        resHeaderString = makeHeaderString(res, 'responseHeaders', responseHttpString)
      } else {
        if (this.request) {
          reqHeaderString = makeHeaderString(this.request, 'requestHeaders', requestHttpString)
        } else {
          console.log(this.url, this.matchedNinfo, this.redirect)
          console.log('We may have an issue')
          return
        }
      }
      let swapper = S(warcRequestHeader)
      let reqHeadContentBuffer = Buffer.from('\r\n' + reqHeaderString + '\r\n', 'utf8')
      let reqWHeader = swapper.template({
        targetURI: this.url, concurrentTo,
        now, rid: uuid.v1(), len: reqHeadContentBuffer.length
      }).s
      yield reqWHeader
      yield reqHeadContentBuffer
      yield recordSeparator
      if (res) {
        let resHeaderContentBuffer = Buffer.from('\r\n' + resHeaderString + '\r\n', 'utf8')
        let respWHeader = swapper.setValue(warcResponseHeader).template({
          targetURI: this.url,
          now, rid: uuid.v1(), len: resHeaderContentBuffer.length + (this.rdata || Buffer.from([])).length
        }).s
        yield respWHeader
        yield resHeaderContentBuffer
        yield (this.rdata || Buffer.from([]))
        yield '\r\n'
        yield recordSeparator
      }
    }
  }

  dl () {
    return new Promise((resolve, reject) => {
      if (this.method !== 'POST' && !this.isSeed) {
        rp({
          headers: this.getHeaders,
          method: 'GET',
          encoding: null, // always get buffer
          url: this.url,
          strictSSL: false,
          rejectUnauthorized: false,
          resolveWithFullResponse: true
        })
          .then(data => {
            this.rdata = data.body
            resolve()
          })
          .catch(error => {
            console.log('downloading error', error)
            if (error.name === 'StatusCodeError') {
              if (error.response.body) {
                this.rdata = error.response.body
              }
              resolve()
            } else {
              reject(error)
            }
          })
      } else {
        resolve()
      }
    })
  }

  addNetwork (ninfo) {
    this.matchedNinfo = ninfo
    if (Array.isArray(this.request)) {
      console.log('we have multiple request for same url', this.url, this.request)
    }

    if (Array.isArray(this.response)) {
      console.log('we have multipe response for same url', this.url, this.response)
    }

    if (Array.isArray(this.redirect)) {
      console.log('we have multipe redirects for same url', this.url, this.redirect)
    }
    if (Array.isArray(this.complete)) {
      console.log('we have multipe completed for same url', this.url, this.complete)
    }
  }

}
