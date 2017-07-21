import URL from 'url'
import { STATUS_CODES } from 'http'
import { getResBodyElectron } from './utils'
import isEmpty from 'lodash/isEmpty'
import WARCWriterBase from './warcWriterBase'
import { CRLF } from './warcFields'

const noGZ = /Content-Encoding.*gzip\r\n/gi
const replaceContentLen = /Content-Length:.*\r\n/gi

const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.71 Safari/537.36'

export default class ElectronWARCGenerator extends WARCWriterBase {
  /**
   * @desc Generates The Request Response WARC Records for POST
   * @param {Object} nreq the captured HTTP request/response for the POST request
   * @param {Object} wcDebugger the electron webcontents debugger object
   * @return {Promise.<void>}
   */
  async generatePost (nreq, wcDebugger) {
    let res
    let requestHeaders
    let responseHeaders
    let purl
    let headerKey
    let head
    res = nreq.res
    if (!res) {
      // request
      purl = URL.parse(nreq.url)
      if (!(nreq.headers.host || nreq.headers.Host)) {
        nreq.headers['Host'] = purl.host
      }
      requestHeaders = `${nreq.method} ${purl.path} HTTP/1.1${CRLF}`
      head = nreq.headers
      for (headerKey in head) {
        requestHeaders += `${headerKey}: ${head[headerKey]}${CRLF}`
      }
      requestHeaders += `${CRLF}`
      if (nreq.postData) {
        await this.writeRequestRecord(nreq.url, requestHeaders, nreq.postData)
      } else {
        await this.writeRequestRecord(nreq.url, requestHeaders)
      }
    } else {
      // request
      purl = URL.parse(nreq.url)
      if (!(nreq.headers.host || nreq.headers.Host)) {
        nreq.headers['Host'] = purl.host
      }
      if (this._noHTTP2) {
        requestHeaders = `${nreq.method} ${purl.path} HTTP/1.1${CRLF}`
      } else {
        requestHeaders = `${nreq.method} ${purl.path} ${res.protocol.toUpperCase()}${CRLF}`
      }
      head = nreq.headers
      for (headerKey in head) {
        requestHeaders += `${headerKey}: ${head[headerKey]}${CRLF}`
      }
      requestHeaders += `${CRLF}`
      // console.log(requestHeaders)

      if (nreq.postData) {
        await this.writeRequestRecord(nreq.url, requestHeaders, nreq.postData)
      } else {
        await this.writeRequestRecord(nreq.url, requestHeaders)
      }

      // response
      if (this._noHTTP2) {
        responseHeaders = `HTTP/1.1 ${res.status} ${res.statusText || STATUS_CODES[res.status]}${CRLF}`
      } else {
        responseHeaders = `${res.protocol.toUpperCase()} ${res.status} ${res.statusText || STATUS_CODES[res.status]}${CRLF}`
      }
      head = res.headers
      for (headerKey in head) {
        responseHeaders += `${headerKey}: ${head[headerKey]}${CRLF}`
      }
      responseHeaders += `${CRLF}`

      // console.log(responseHeaders)
      // if their is no response body these values are undefined
      // do not request body if there is none or zero length body
      let resData
      let wasError = false
      try {
        let rbody = await getResBodyElectron(nreq.requestId, wcDebugger)
        if (rbody.base64Encoded) {
          resData = Buffer.from(rbody.body, 'base64')
        } else {
          resData = Buffer.from(rbody.body, 'utf8')
        }
      } catch (err) {
        wasError = true
      }
      if (!wasError) {
        responseHeaders = responseHeaders.replace(noGZ, '')
        responseHeaders = responseHeaders.replace(replaceContentLen, `Content-Length: ${Buffer.byteLength(resData, 'utf8')}${CRLF}`)
      }
      // console.log(responseHeaders)
      // console.log(responseHeaders)
      await this.writeResponseRecord(nreq.url, responseHeaders, resData)
    }
  }

  /**
   * @desc Special Case Handler To Correctly Serialize 3xx Responses.
   *
   * The browser will automatically chase down 3xx responses until terminal
   * status is reached 2xx, 4xx, 5xx. So we must account for that fact and the
   * redirectResponse is guarantied to be an array or plain object.
   * @param {Object} nreq the captured HTTP request/response for the redirected request
   * @param {Object} wcDebugger the electron webcontents debugger object
   * @return {Promise.<void>}
   */
  async generateRedirectResponse (nreq, wcDebugger) {
    // optimization for function speed by pulling up let decelerations
    let purl // a parsed URL
    let rderHeaders // a redirection responses HTTP headers string
    let redirReses // an array of redirection responses
    let head // a header object
    let i // the one and only i
    let aRedirect // a redirection response
    let redirectLen
    let requestHeaders // the HTTP headers string for the initial request that redirected
    let res // the response object
    let headerKey
    let finalRequestHeaders
    let finalResponseHeaders
    let isMultiRedirect = Array.isArray(nreq.redirectResponse)

    /* The initial request */
    if (isMultiRedirect) {
      // the full request headers was not on the first redirect
      // must create it with the bare minimum info required
      // emulates the dev tools and is what was actually sent
      head = nreq.headers
      purl = URL.parse(nreq.url)
      if (!(head.host || head.Host)) {
        head['Host'] = purl.host
      }
      if (this._noHTTP2) {
        requestHeaders = `${nreq.method} ${purl.path} HTTP/1.1${CRLF}`
      } else {
        requestHeaders = `${nreq.method} ${purl.path} ${nreq.redirectResponse[0].protocol.toUpperCase()}${CRLF}`
      }
      // no need for hasOwnProperty, https://chromedevtools.github.io/devtools-protocol/tot/Network/#type-Headers
      // states headers is a json object
      for (headerKey in head) {
        requestHeaders += `${headerKey}: ${head[headerKey]}${CRLF}`
      }
      requestHeaders += `${CRLF}`
    } else {
      head = nreq.headers
      purl = URL.parse(nreq.url)
      if (!(head.host || head.Host)) {
        head['Host'] = purl.host
      }
      if (this._noHTTP2) {
        requestHeaders = `${nreq.method} ${purl.path} HTTP/1.1${CRLF}`
      } else {
        requestHeaders = `${nreq.method} ${purl.path} ${nreq.redirectResponse.protocol.toUpperCase()}${CRLF}`
      }
      for (headerKey in head) {
        requestHeaders += `${headerKey}: ${head[headerKey]}${CRLF}`
      }
      requestHeaders += `${CRLF}`
    }

    await this.writeRequestRecord(nreq.url, requestHeaders)

    /* the redirection or redirection chain */
    if (isMultiRedirect) {
      // multi redirection
      // We handled the request for the first redirect, now for its response
      head = nreq.redirectResponse[0].headers
      aRedirect = nreq.redirectResponse[0]
      if (this._noHTTP2) {
        rderHeaders = `HTTP/1.1 ${aRedirect.status} ${aRedirect.statusText || STATUS_CODES[aRedirect.status]}${CRLF}`
      } else {
        rderHeaders = `${aRedirect.protocol.toUpperCase()} ${aRedirect.status} ${aRedirect.statusText || STATUS_CODES[aRedirect.status]}${CRLF}`
      }
      for (headerKey in head) {
        rderHeaders += `${headerKey}: ${head[headerKey]}${CRLF}`
      }
      rderHeaders += `${CRLF}`
      await this.writeResponseRecord(nreq.url, rderHeaders)
      // now loop through the remaining redirection chain
      redirectLen = nreq.redirectResponse.length
      redirReses = nreq.redirectResponse
      i = 1
      for (; i < redirectLen; ++i) {
        aRedirect = redirReses[i]
        // the full request headers was not on the redirect
        // must create it with the bare minimum info required
        // emulates the dev tools and is what was actually sent
        head = aRedirect.headers
        purl = URL.parse(aRedirect.url)
        if (!(head.host || head.Host)) {
          head['Host'] = purl.host
        }
        if (this._noHTTP2) {
          requestHeaders = `HTTP/1.1 ${purl.path} ${aRedirect.protocol.toUpperCase()}${CRLF}`
        } else {
          requestHeaders = `${nreq.method} ${purl.path} ${aRedirect.protocol.toUpperCase()}${CRLF}`
        }
        for (headerKey in head) {
          requestHeaders += `${headerKey}: ${head[headerKey]}${CRLF}`
        }
        requestHeaders += `${CRLF}`
        await this.writeRequestRecord(aRedirect.url, requestHeaders)
        if (this._noHTTP2) {
          rderHeaders = `HTTP/1.1 ${aRedirect.status} ${aRedirect.statusText || STATUS_CODES[aRedirect.status]}${CRLF}`
        } else {
          rderHeaders = `${aRedirect.protocol.toUpperCase()} ${aRedirect.status} ${aRedirect.statusText || STATUS_CODES[aRedirect.status]}${CRLF}`
        }
        head = aRedirect.headers
        for (headerKey in head) {
          rderHeaders += `${headerKey}: ${head[headerKey]}${CRLF}`
        }
        rderHeaders += `${CRLF}`
        // console.log(rderHeaders)
        rderHeaders = rderHeaders.replace(noGZ, '')
        // console.log(rderHeaders)
        await this.writeResponseRecord(aRedirect.url, rderHeaders)
      }
    } else {
      // single redirection
      // We handled the request for the redirect, now for its response
      aRedirect = nreq.redirectResponse
      if (this._noHTTP2) {
        rderHeaders = `HTTP/1.1 ${aRedirect.status} ${aRedirect.statusText || STATUS_CODES[aRedirect.status]}${CRLF}`
      } else {
        rderHeaders = `${aRedirect.protocol.toUpperCase()} ${aRedirect.status} ${aRedirect.statusText || STATUS_CODES[aRedirect.status]}${CRLF}`
      }
      head = aRedirect.headers
      for (headerKey in head) {
        rderHeaders += `${headerKey}: ${head[headerKey]}${CRLF}`
      }
      rderHeaders += `${CRLF}`
      // console.log(rderHeaders)
      rderHeaders = rderHeaders.replace(noGZ, '')
      // console.log(rderHeaders)
      await this.writeResponseRecord(nreq.url, rderHeaders)
    }

    /* the final response (maybe has body) */
    if (nreq.res) {
      let isArray = Array.isArray(nreq.res)
      res = nreq.res
      if (isArray) {
        res = res.shift()
      }
      // request for the final response in redirection / redirection chain
      head = res.requestHeaders || nreq.headers
      purl = URL.parse(res.url)
      if (!(head.host || head.Host)) {
        head['Host'] = purl.host
      }
      if (this._noHTTP2) {
        finalRequestHeaders = `${nreq.method} ${purl.path} HTTP/1.1${CRLF}`
      } else {
        finalRequestHeaders = `${nreq.method} ${purl.path} ${res.protocol.toUpperCase()}${CRLF}`
      }
      for (headerKey in head) {
        finalRequestHeaders += `${headerKey}: ${head[headerKey]}${CRLF}`
      }
      finalRequestHeaders += `${CRLF}`

      await this.writeRequestRecord(res.url, finalRequestHeaders)

      // response for the final request in redirection / redirection chain
      head = res.headers
      if (this._noHTTP2) {
        finalResponseHeaders = `HTTP/1.1 ${res.status} ${res.statusText || STATUS_CODES[res.status]}${CRLF}`
      } else {
        finalResponseHeaders = `${res.protocol.toUpperCase()} ${res.status} ${res.statusText || STATUS_CODES[res.status]}${CRLF}`
      }
      for (headerKey in head) {
        finalResponseHeaders += `${headerKey}: ${head[headerKey]}${CRLF}`
      }
      finalResponseHeaders += `${CRLF}`

      // if their is no response body these values are undefined
      // do not request body if there is none or zero length body
      let resData
      let wasError = false
      try {
        let rbody = await getResBodyElectron(nreq.requestId, wcDebugger)
        if (rbody.base64Encoded) {
          resData = Buffer.from(rbody.body, 'base64')
        } else {
          resData = Buffer.from(rbody.body, 'utf8')
        }
      } catch (err) {
        wasError = true
      }
      // console.log(finalResponseHeaders)
      if (!wasError) {
        finalResponseHeaders = finalResponseHeaders.replace(noGZ, '')
        finalResponseHeaders = finalResponseHeaders.replace(replaceContentLen, `Content-Length: ${Buffer.byteLength(resData, 'utf8')}${CRLF}`)
      }
      // console.log(finalResponseHeaders)
      await this.writeResponseRecord(res.url, finalResponseHeaders, resData)
      if (isArray && nreq.res.length > 0) {
        let i = 0
        let len = nreq.res.length
        let anotherRes
        for (; i < len; ++i) {
          anotherRes = nreq.res[i]
          if (anotherRes.url !== res.url ||
            anotherRes.requestHeadersText !== res.requestHeadersText
          ) {
            head = anotherRes.requestHeaders || nreq.headers
            purl = URL.parse(anotherRes.url)

            if (!(head.host || head.Host)) {
              head['Host'] = purl.host
            }
            if (this._noHTTP2) {
              finalRequestHeaders = `${nreq.method} ${purl.path} HTTP/1.1${CRLF}`
            } else {
              finalRequestHeaders = `${nreq.method} ${purl.path} ${anotherRes.protocol.toUpperCase()}${CRLF}`
            }
            for (headerKey in head) {
              finalRequestHeaders += `${headerKey}: ${head[headerKey]}${CRLF}`
            }
            finalRequestHeaders += `${CRLF}`

            await this.writeRequestRecord(anotherRes.url, finalRequestHeaders)

            // anotherResponse for the final request in redirection / redirection chain
            head = anotherRes.headers
            if (this._noHTTP2) {
              finalResponseHeaders = `HTTP/1.1 ${anotherRes.status} ${anotherRes.statusText || STATUS_CODES[anotherRes.status]}${CRLF}`
            } else {
              finalResponseHeaders = `${anotherRes.protocol.toUpperCase()} ${anotherRes.status} ${anotherRes.statusText || STATUS_CODES[anotherRes.status]}${CRLF}`
            }
            for (headerKey in head) {
              finalResponseHeaders += `${headerKey}: ${head[headerKey]}${CRLF}`
            }
            finalResponseHeaders += `${CRLF}`

            // if their is no anotherResponse body these values are undefined
            // do not request body if there is none or zero length body
            let anotherResData
            let wasError = false
            try {
              let rbody = await getResBodyElectron(nreq.requestId, wcDebugger)
              if (rbody.base64Encoded) {
                anotherResData = Buffer.from(rbody.body, 'base64')
              } else {
                anotherResData = Buffer.from(rbody.body, 'utf8')
              }
            } catch (err) {
              wasError = true
            }
            // console.log(finalResponseHeaders)
            if (!wasError) {
              finalResponseHeaders = finalResponseHeaders.replace(noGZ, '')
              finalResponseHeaders = finalResponseHeaders.replace(replaceContentLen, `Content-Length: ${Buffer.byteLength(anotherResData, 'utf8')}${CRLF}`)
            }
            // console.log(finalResponseHeaders)
            await this.writeResponseRecord(anotherRes.url, finalResponseHeaders, anotherResData)
          }
        }
      }
    }
  }

  /**
   * @desc Generates The Request Response WARC Records for GET
   * @param {Object} nreq the captured HTTP request/response for the GET request
   * @param {Object} wcDebugger the electron webcontents debugger object
   * @return {Promise.<void>}
   */
  async generateGet (nreq, wcDebugger) {
    let res
    let requestHeaders
    let responseHeaders
    let purl = URL.parse(nreq.url)
    let headerKey
    let head
    let wasResArray = Array.isArray(nreq.res)
    if (wasResArray) {
      // no idea why this would happen
      res = nreq.res.pop()
    } else {
      res = nreq.res
    }
    if (res === null || res === undefined) {
      // we do not have a response
      requestHeaders = `${nreq.method} ${purl.path} HTTP/1.1${CRLF}`
      if (!isEmpty(nreq.headers)) {
        // the headers object is present
        head = nreq.headers
        if (!(head.host || head.Host)) {
          head['Host'] = purl.host
        }
        for (headerKey in head) {
          requestHeaders += `${headerKey}: ${head[headerKey]}${CRLF}`
        }
        requestHeaders += `${CRLF}`
      } else {
        // the headers object is not present, recreate with minimal information
        requestHeaders += `Host: ${purl.host}\r\nUser-Agent: ${UA}${CRLF}`
      }

      await this.writeRequestRecord(nreq.url, requestHeaders)
      // console.log(requestHeaders)
    } else {
      if (res.protocol === 'data') {
        return
      }
      if (!isEmpty(res.requestHeaders)) {
        // response did not have the full request headers string use object
        if (this._noHTTP2) {
          requestHeaders = `${nreq.method} ${purl.path} HTTP/1.1${CRLF}`
        } else {
          requestHeaders = `${nreq.method} ${purl.path} ${res.protocol.toUpperCase()}${CRLF}`
        }
        head = res.requestHeaders
        if (!(head.host || head.Host)) {
          head['Host'] = purl.host
        }
        for (headerKey in head) {
          requestHeaders += `${headerKey}: ${head[headerKey]}${CRLF}`
        }
        requestHeaders += `${CRLF}`
      } else {
        // response has no full request http headers information
        if (this._noHTTP2) {
          requestHeaders = `${nreq.method} ${purl.path} HTTP/1.1${CRLF}`
        } else {
          requestHeaders = `${nreq.method} ${purl.path} ${res.protocol.toUpperCase()}${CRLF}`
        }
        if (!isEmpty(nreq.headers)) {
          // the request object has the request http header object
          head = nreq.headers
          if (!(head.host || head.Host)) {
            head['Host'] = purl.host
          }
          for (headerKey in head) {
            requestHeaders += `${headerKey}: ${head[headerKey]}${CRLF}`
          }
          requestHeaders += `${CRLF}`
        } else {
          // the request object does not have the request http header information
          // recreate with minimal information
          requestHeaders += `Host: ${purl.host}\r\nUser-Agent: ${UA}${CRLF}`
        }
      }

      await this.writeRequestRecord(nreq.url, requestHeaders)
      if (!isEmpty(res.headers)) {
        head = res.headers
        if (this._noHTTP2) {
          responseHeaders = `HTTP/1.1 ${res.status} ${res.statusText || STATUS_CODES[res.status]}${CRLF}`
        } else {
          responseHeaders = `${res.protocol.toUpperCase()} ${res.status} ${res.statusText || STATUS_CODES[res.status]}${CRLF}`
        }
        for (headerKey in head) {
          responseHeaders += `${headerKey}: ${head[headerKey]}${CRLF}`
        }
        responseHeaders += `${CRLF}`
      } else {
        console.log('the response headers are empty GET')
        if (this._noHTTP2) {
          responseHeaders = `HTTP/1.1 ${res.status} ${res.statusText || STATUS_CODES[res.status]}${CRLF}`
        } else {
          responseHeaders = `${res.protocol.toUpperCase()} ${res.status} ${res.statusText || STATUS_CODES[res.status]}${CRLF}`
        }
      }
      let resData
      let wasError = false
      try {
        let rbody = await getResBodyElectron(nreq.requestId, wcDebugger)
        if (rbody.base64Encoded) {
          resData = Buffer.from(rbody.body, 'base64')
        } else {
          resData = Buffer.from(rbody.body, 'utf8')
        }
      } catch (err) {
        wasError = true
      }

      if (!wasError) {
        responseHeaders = responseHeaders.replace(noGZ, '')
        responseHeaders = responseHeaders.replace(replaceContentLen, `Content-Length: ${Buffer.byteLength(resData, 'utf8')}${CRLF}`)
      }
      await this.writeResponseRecord(nreq.url, responseHeaders, resData)
      if (wasResArray && nreq.res.length > 0) {
        let i = 0
        let len = nreq.res.length
        for (; i < len; ++i) {
          res = nreq.res[i]
          if (!isEmpty(res.headers)) {
            head = res.headers
            if (this._noHTTP2) {
              responseHeaders = `HTTP/1.1 ${res.status} ${res.statusText || STATUS_CODES[res.status]}${CRLF}`
            } else {
              responseHeaders = `${res.protocol.toUpperCase()} ${res.status} ${res.statusText || STATUS_CODES[res.status]}${CRLF}`
            }
            for (headerKey in head) {
              responseHeaders += `${headerKey}: ${head[headerKey]}${CRLF}`
            }
            responseHeaders += `${CRLF}`
          } else {
            continue
          }

          let resData
          let wasError = false
          try {
            let rbody = await getResBodyElectron(nreq.requestId, wcDebugger)
            if (rbody.base64Encoded) {
              resData = Buffer.from(rbody.body, 'base64')
            } else {
              resData = Buffer.from(rbody.body, 'utf8')
            }
          } catch (err) {
            wasError = true
          }

          if (!wasError) {
            responseHeaders = responseHeaders.replace(noGZ, '')
            responseHeaders = responseHeaders.replace(replaceContentLen, `Content-Length: ${Buffer.byteLength(resData, 'utf8')}${CRLF}`)
          }
          await this.writeResponseRecord(nreq.url, responseHeaders, resData)
        }
      }
    }
  }

  /**
   * @desc Generates The Request Response WARC Records for OPTIONS
   * @param {Object} nreq the captured HTTP request/response for the OPTIONS request
   * @param {Object} wcDebugger the electron webcontents debugger object
   * @return {Promise.<void>}
   */
  async generateOptions (nreq, wcDebugger) {
    let res
    let requestHeaders
    let responseHeaders
    let purl = URL.parse(nreq.url)
    let headerKey
    let head

    // https://chromedevtools.github.io/devtools-protocol/tot/Network/#type-RequestId states that
    // the requestId we use as the key is unique to the request so we take the last element
    // no clue why we have two responses
    if (Array.isArray(nreq.res)) {
      res = nreq.res.pop()
    } else {
      res = nreq.res
    }

    if (!isEmpty(res.requestHeaders)) {
      if (this._noHTTP2) {
        requestHeaders = `${nreq.method} ${purl.path} HTTP/1.1${CRLF}`
      } else {
        requestHeaders = `${nreq.method} ${purl.path} ${res.protocol.toUpperCase()}${CRLF}`
      }
      head = res.requestHeaders
      if (!(head.host || head.Host)) {
        head['Host'] = purl.host
      }
      for (headerKey in head) {
        requestHeaders += `${headerKey}: ${head[headerKey]}${CRLF}`
      }
    } else if (!isEmpty(nreq.headers)) {
      if (this._noHTTP2) {
        requestHeaders = `${nreq.method} ${purl.path} HTTP/1.1${CRLF}`
      } else {
        requestHeaders = `${nreq.method} ${purl.path} ${res.protocol.toUpperCase()}${CRLF}`
      }
      head = nreq.headers
      if (!(head.host || head.Host)) {
        head['Host'] = purl.host
      }
      for (headerKey in head) {
        requestHeaders += `${headerKey}: ${head[headerKey]}${CRLF}`
      }
      requestHeaders += `${CRLF}`
    } else {
      requestHeaders = `${nreq.method} ${purl.path} ${res.protocol.toUpperCase()}${CRLF}`
    }

    await this.writeRequestRecord(nreq.url, requestHeaders)

    if (!isEmpty(res.headers)) {
      head = res.headers
      if (!(head.host || head.Host)) {
        head['Host'] = purl.host
      }
      if (this._noHTTP2) {
        responseHeaders = `HTTP/1.1 ${res.status} ${res.statusText || STATUS_CODES[res.status]}${CRLF}`
      } else {
        responseHeaders = `${res.protocol.toUpperCase()} ${res.status} ${res.statusText || STATUS_CODES[res.status]}${CRLF}`
      }
      for (headerKey in head) {
        responseHeaders += `${headerKey}: ${head[headerKey]}${CRLF}`
      }
      responseHeaders += `${CRLF}`
    } else {
      if (this._noHTTP2) {
        responseHeaders = `HTTP/1.1 ${res.status} ${res.statusText || STATUS_CODES[res.status]}${CRLF}`
      } else {
        responseHeaders = `${res.protocol.toUpperCase()} ${res.status} ${res.statusText || STATUS_CODES[res.status]}${CRLF}`
      }
    }
    await this.writeResponseRecord(nreq.url, responseHeaders)
  }

  /**
   * @desc Handle Non HTTP POST GET OPTIONS request. And yes the live web uses them all
   * @param {Object} nreq the captured HTTP request/response
   * @param {Object} wcDebugger the electron webcontents debugger object
   * @return {Promise.<void>}
   */
  async generateOther (nreq, wcDebugger) {
    // ducktape
    if (!nreq.postData) {
      await this.generateGet(nreq, wcDebugger)
    } else {
      await this.generatePost(nreq, wcDebugger)
    }
  }

  /**
   * @desc If a stray response comes in without a request HTTP/2 likely preserve it!
   * @param {Object} nreq the captured HTTP response
   * @param {Object} wcDebugger the electron webcontents debugger object
   * @return {Promise.<void>}
   */
  async generateOnlyRes (nreq, wcDebugger) {
    let res = nreq.res
    let requestHeaders
    let responseHeaders
    let purl = URL.parse(res.url)
    let headerKey
    let head
    res.protocol = res.protocol || 'http/1.1'
    if (res.protocol === 'data') {
      return
    }

    if (res.requestHeadersText) {
      nreq.method = res.requestHeadersText.substring(0, res.requestHeadersText.indexOf(' '))
    } else {
      // we handle htt2 :method
      return
    }

   if (!isEmpty(res.requestHeaders)) {
      // response did not have the full request headers string use object
      if (this._noHTTP2) {
        requestHeaders = `${nreq.method} ${purl.path} HTTP/1.1${CRLF}`
      } else {
        requestHeaders = `${nreq.method} ${purl.path} ${res.protocol.toUpperCase()}${CRLF}`
      }
      head = res.requestHeaders
      if (!(head.host || head.Host)) {
        head['Host'] = purl.host
      }
      for (headerKey in head) {
        requestHeaders += `${headerKey}: ${head[headerKey]}${CRLF}`
      }
      requestHeaders += `${CRLF}`
    } else {
      // response has no full request http headers information
      if (this._noHTTP2) {
        requestHeaders = `${nreq.method} ${purl.path} HTTP/1.1${CRLF}`
      } else {
        requestHeaders = `${nreq.method} ${purl.path} ${res.protocol.toUpperCase()}${CRLF}`
      }
      // the request object does not have the request http header information
      // recreate with minimal information
      requestHeaders += `Host: ${purl.host}\r\nUser-Agent: ${UA}${CRLF}`
    }

    await this.writeRequestRecord(res.url, requestHeaders)

    if (!isEmpty(res.headers)) {
      head = res.headers
      if (this._noHTTP2) {
        responseHeaders = `HTTP/1.1 ${res.status} ${res.statusText || STATUS_CODES[res.status]}${CRLF}`
      } else {
        responseHeaders = `${res.protocol.toUpperCase()} ${res.status} ${res.statusText || STATUS_CODES[res.status]}${CRLF}`
      }
      for (headerKey in head) {
        responseHeaders += `${headerKey}: ${head[headerKey]}${CRLF}`
      }
      responseHeaders += `${CRLF}`
    } else {
      if (this._noHTTP2) {
        responseHeaders = `HTTP/1.1 ${res.status} ${res.statusText || STATUS_CODES[res.status]}${CRLF}`
      } else {
        responseHeaders = `${res.protocol.toUpperCase()} ${res.status} ${res.statusText || STATUS_CODES[res.status]}${CRLF}`
      }
    }

    let resData
    let wasError = false
    try {
      let rbody = await getResBodyElectron(nreq.requestId, wcDebugger)
      if (rbody.base64Encoded) {
        resData = Buffer.from(rbody.body, 'base64')
      } else {
        resData = Buffer.from(rbody.body, 'utf8')
      }
    } catch (err) {
      wasError = true
    }

    if (!wasError) {
      responseHeaders = responseHeaders.replace(noGZ, '')
      responseHeaders = responseHeaders.replace(replaceContentLen, `Content-Length: ${Buffer.byteLength(resData, 'utf8')}${CRLF}`)
    }
    await this.writeResponseRecord(res.url, responseHeaders, resData)
  }
}
