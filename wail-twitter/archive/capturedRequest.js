const url = require('url')
const S = require('string')
const _ = require('lodash')
const uuid = require('uuid/v1')
const responseHeaderString = require('./responseHeaderString')

const {
  warcRequestHeader,
  warcResponseHeader,
  recordSeparator
} = require('./warcFields')

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const generateConnectionId = (() => {
  let id = 1
  return () => id++
})()

const fullUrl = (req, isSSL) => {
  let parsedUrl = url.parse(req.url)
  parsedUrl.protocol = isSSL ? 'https' : 'http'
  parsedUrl.host = req.headers.host
  return url.format(parsedUrl)
}

const recreateRawResponseHeaders = res => {
  let headerString = ''
  let i = 0, l = res.rawHeaders.length
  for (; i < l; i += 2) {
    headerString += res.rawHeaders[i] + ': ' + res.rawHeaders[i + 1] + '\r\n'
  }
  return `HTTP/${res.httpVersion} ${res.statusCode} ${res.statusMessage}\r\n${headerString}`
}

class CapturedRequest {
  constructor () {
    this._id = generateConnectionId()
    this._isSeed = false
    this._chunks = []
    this._request = null
    this._response = null
    this._resourceType = 'Other'
    this._responseBodySize = null
    this._responseBody = null
    this._url = null
    this._method = null
    this._reqHeadString = null
    this._hasResponse = false
    this._completed = false
  }

  seedHeaderReplacer (v, k) {
    let lowerKey = k.toLowerCase()
    if (lowerKey === 'content-length') {
      return `${this._responseBody.length}`
    } else if (lowerKey === 'content-encoding') {
      return null
    } else if (lowerKey === 'content-type') {
      if (this._url.indexOf('twitter.com') > -1) {
        return v.replace('text/javascript', 'text/html')
      } else {
        return v
      }
    } else if (lowerKey === 'proxy-connection') {
      return null
    }
    return v
  }

  addSeedUrlBody (dom) {
    this._isSeed = true
    this._responseBody = Buffer.from(dom, 'utf8')
    this._response.statusLine = this._response.statusLine.replace('HTTP/1.1 304 Not Modified', 'HTTP/1.1 200 OK')
    let resHeaders = _.mapValues(this._response.headers, this.seedHeaderReplacer.bind(this))
    this._response.headers = _.omitBy(resHeaders, _.isNull)
    this._resHeadString = responseHeaderString(this._response.headers, this._response.statusLine)
  }

  responseReceived () {
    this._hasResponse = true
  }

  setRequest (req, isSSL, body) {
    this._url = fullUrl(req, isSSL)
    this._method = req.method
    this._request = {
      url: this._url,
      httpVersion: req.httpVersion,
      method: req.method,
      headers: req.headers,
      postData: body,
      rawReq: req
    }
  }

  setResponse (res) {
    let statusLine = `HTTP/${res.httpVersion} ${res.statusCode} ${res.statusMessage}`
    let headers = res.headers
    this._response = {
      url: res.url,
      statusCode: res.statusCode,
      statusMessage: res.statusMessage,
      statusLine,
      headers,
      rawHeadersP: recreateRawResponseHeaders(res),
      rawHeaders: res.rawHeaders,
      rawRes: res
    }
    this._resHeadString = responseHeaderString(headers, statusLine)
    this._reqHeadString = res.req._header
    this._resourceType = headers['content-type']
  }

  dataReceived (data) {
    this._chunks.push(data)
  }

  responseFinished () {
    if (this._chunks.length) {
      let buffer = Buffer.concat(this._chunks)
      this._responseBodySize = buffer.length
      this._responseBody = buffer
      this._chunks = []
    } else {
      this._responseBody = Buffer.concat(this._chunks)
    }
    this._completed = true
  }

  _warcReqHeaderLen (bufLen) {
    if (this._method !== 'GET' && this._request.postData.length > 0) {
      return this._request.postData.length + bufLen
    } else {
      return bufLen
    }
  }

  _warcResHeaderLen (bufLen) {
    if (this._responseBody && (this._responseBody.length || 0) > 0) {
      return this._responseBody.length + bufLen
    } else {
      return bufLen
    }
  }

  * yieldWritable ({seedUrl, concurrentTo, now}) {
    let swapper = S(warcRequestHeader)
    let reqHeadContentBuffer = Buffer.from('\r\n' + this._reqHeadString + '\r\n', 'utf8')
    let reqWHeader = swapper.template({
      targetURI: this._url,
      concurrentTo,
      now,
      rid: uuid(),
      len: this._warcReqHeaderLen(reqHeadContentBuffer.length)
    }).s
    yield reqWHeader
    yield reqHeadContentBuffer
    if (this._method !== 'GET' && this._request.postData.length > 0) {
      yield this._request.postData
      yield '\r\n'
    }
    yield recordSeparator
    let resHeaderContentBuffer = Buffer.from('\r\n' + this._resHeadString + '\r\n', 'utf8')
    let respWHeader = swapper.setValue(warcResponseHeader).template({
      targetURI: this._url, now, rid: uuid(), len: this._warcResHeaderLen(resHeaderContentBuffer.length)
    }).s
    yield respWHeader
    yield resHeaderContentBuffer
    if (this._responseBody && (this._responseBody.length || 0) > 0) {
      yield this._responseBody
    }
    yield '\r\n'
    yield recordSeparator
  }

  get id () {
    return this._id
  }

  get chunks () {
    return this._chunks
  }

  get method () {
    return this._method
  }

  get request () {
    return this._request
  }

  get response () {
    return this._response
  }

  get resourceType () {
    return this._resourceType
  }

  get encodedSize () {
    let encodedBodySize = this._responseBodySize
    if (encodedBodySize !== null) {
      let headerSize = this._response && this._response.rawHeaders.length
      return (headerSize + encodedBodySize)
    }
    return Number.parseInt(this._response.headers['content-length'], 10)
  }

  get responseBody () {
    return this._responseBody
  }

  get url () {
    return this._url
  }

  get reqHeadString () {
    return this._reqHeadString
  }

  get resHeadString () {
    return this._resHeadString
  }

  get hasResponse () {
    return this._hasResponse
  }

  get completed () {
    return this._completed
  }

  getId () {
    return this._id
  }

  getResourceType () {
    return this._resourceType
  }

  getEncodedSize () {
    let encodedBodySize = this._responseBodySize
    if (encodedBodySize !== null) {
      let headerSize = this._response && this._response.rawHeaders.length
      return (headerSize + encodedBodySize)
    }
    return Number.parseInt(this._response.headers['content-length'], 10)
  }

  getSize () {
    return this._responseBody && this._responseBody.length
  }

  getRequest () {
    return this._request
  }

  getResponse () {
    return this._response
  }

  getResponseBody () {
    return this._responseBody
  }
}

module.exports = CapturedRequest
