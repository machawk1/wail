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
      if (res.requestHeadersText) {
        requestHeaders = res.requestHeadersText
      } else {
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
      }
      // console.log(requestHeaders)

      if (nreq.postData) {
        await this.writeRequestRecord(nreq.url, requestHeaders, nreq.postData)
      } else {
        await this.writeRequestRecord(nreq.url, requestHeaders)
      }

      // response
      if (res.headersText) {
        responseHeaders = res.headersText
      } else {
        responseHeaders = `HTTP/1.1 ${res.status} ${res.statusText || STATUS_CODES[res.status]}${CRLF}`
        head = res.headers
        for (headerKey in head) {
          responseHeaders += `${headerKey}: ${head[headerKey]}${CRLF}`
        }
        responseHeaders += `${CRLF}`
      }

      // console.log(responseHeaders)
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
      // multi redirection
      // the full request headers is on the first redirect
      if (nreq.redirectResponse[0].requestHeadersText) {
        requestHeaders = nreq.redirectResponse[0].requestHeadersText
      } else {
        // the full request headers was not on the first redirect
        // must create it with the bare minimum info required
        // emulates the dev tools and is what was actually sent
        head = nreq.headers
        purl = URL.parse(nreq.url)
        if (!(head.host || head.Host)) {
          head['Host'] = purl.host
        }
        requestHeaders = `${nreq.method} ${purl.path} HTTP/1.1${CRLF}`
        // no need for hasOwnProperty, https://chromedevtools.github.io/devtools-protocol/tot/wcDebugger/#type-Headers
        // states headers is a json object
        for (headerKey in head) {
          requestHeaders += `${headerKey}: ${head[headerKey]}${CRLF}`
        }
        requestHeaders += `${CRLF}`
      }
    } else {
      // single redirection
      if (nreq.redirectResponse.requestHeadersText) {
        // the full request headers is on the redirect response
        requestHeaders = nreq.redirectResponse.requestHeadersText
      } else {
        // the full request headers was not on the redirect
        // must create it with the bare minimum info required
        // emulates the dev tools and is what was actually sent
        head = nreq.headers
        purl = URL.parse(nreq.url)
        if (!(head.host || head.Host)) {
          head['Host'] = purl.host
        }
        requestHeaders = `${nreq.method} ${purl.path} ${nreq.redirectResponse.protocol.toUpperCase()}${CRLF}`
        for (headerKey in head) {
          requestHeaders += `${headerKey}: ${head[headerKey]}${CRLF}`
        }
        requestHeaders += `${CRLF}`
      }
    }

    await this.writeRequestRecord(nreq.url, requestHeaders)

    /* the redirection or redirection chain */
    if (isMultiRedirect) {
      // multi redirection
      // We handled the request for the first redirect, now for its response
      if (nreq.redirectResponse[0].headersText) {
        // console.log(nreq.redirectResponse[0].headersText)
        rderHeaders = nreq.redirectResponse[0].headersText
      } else {
        head = nreq.redirectResponse[0].headers
        aRedirect = nreq.redirectResponse[0]
        rderHeaders = `${aRedirect.protocol.toUpperCase()} ${aRedirect.status} ${aRedirect.statusText || STATUS_CODES[aRedirect.status]}${CRLF}`
        for (headerKey in head) {
          rderHeaders += `${headerKey}: ${head[headerKey]}${CRLF}`
        }
        rderHeaders += `${CRLF}`
      }
      await this.writeResponseRecord(nreq.url, rderHeaders)
      // now loop through the remaining redirection chain
      redirectLen = nreq.redirectResponse.length
      redirReses = nreq.redirectResponse
      i = 1
      for (; i < redirectLen; ++i) {
        aRedirect = redirReses[i]
        if (aRedirect.requestHeadersText) {
          requestHeaders = aRedirect.requestHeadersText
        } else {
          // the full request headers was not on the redirect
          // must create it with the bare minimum info required
          // emulates the dev tools and is what was actually sent
          head = aRedirect.headers
          purl = URL.parse(aRedirect.url)
          if (!(head.host || head.Host)) {
            head['Host'] = purl.host
          }
          requestHeaders = `${nreq.method} ${purl.path} ${aRedirect.protocol.toUpperCase()}${CRLF}`
          for (headerKey in head) {
            requestHeaders += `${headerKey}: ${head[headerKey]}${CRLF}`
          }
          requestHeaders += `${CRLF}`
        }
        await this.writeRequestRecord(aRedirect.url, requestHeaders)
        if (aRedirect.headersText) {
          rderHeaders = aRedirect.headersText
        } else {
          rderHeaders = `${aRedirect.protocol.toUpperCase()} ${aRedirect.status} ${aRedirect.statusText || STATUS_CODES[aRedirect.status]}${CRLF}`
          head = aRedirect.headers
          for (headerKey in head) {
            rderHeaders += `${headerKey}: ${head[headerKey]}${CRLF}`
          }
          rderHeaders += `${CRLF}`
        }
        // console.log(rderHeaders)
        rderHeaders = rderHeaders.replace(noGZ, '')
        // console.log(rderHeaders)
        await this.writeResponseRecord(aRedirect.url, rderHeaders)
      }
    } else {
      // single redirection
      // We handled the request for the redirect, now for its response
      if (nreq.redirectResponse.headersText) {
        rderHeaders = nreq.redirectResponse.headersText
      } else {
        aRedirect = nreq.redirectResponse
        rderHeaders = `${aRedirect.protocol.toUpperCase()} ${aRedirect.status} ${aRedirect.statusText || STATUS_CODES[aRedirect.status]}${CRLF}`
        head = aRedirect.headers
        for (headerKey in head) {
          rderHeaders += `${headerKey}: ${head[headerKey]}${CRLF}`
        }
        rderHeaders += `${CRLF}`
      }
      // console.log(rderHeaders)
      rderHeaders = rderHeaders.replace(noGZ, '')
      // console.log(rderHeaders)
      await this.writeResponseRecord(nreq.url, rderHeaders)
    }

    /* the final response (maybe has body) */
    if (nreq.res) {
      res = nreq.res
      // request for the final response in redirection / redirection chain
      if (res.requestHeadersText || res.requestHeaders) {
        if (res.requestHeadersText) {
          finalRequestHeaders = res.requestHeadersText
        } else {
          head = res.requestHeaders
          purl = URL.parse(res.url)
          if (!(head.host || head.Host)) {
            head['Host'] = purl.host
          }
          finalRequestHeaders = `${nreq.method} ${purl.path} HTTP/1.1${CRLF}`
          for (headerKey in head) {
            finalRequestHeaders += `${headerKey}: ${head[headerKey]}${CRLF}`
          }
          finalRequestHeaders += `${CRLF}`
        }

        await this.writeRequestRecord(res.url, finalRequestHeaders)
      }
      // response for the final request in redirection / redirection chain
      if (res.headersText) {
        finalResponseHeaders = res.headersText
      } else {
        head = res.headers
        finalResponseHeaders = `HTTP/1.1 ${res.status} ${res.statusText || STATUS_CODES[res.status]}${CRLF}`
        for (headerKey in head) {
          finalResponseHeaders += `${headerKey}: ${head[headerKey]}${CRLF}`
        }
        finalResponseHeaders += `${CRLF}`
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
      // console.log(finalResponseHeaders)
      if (!wasError) {
        finalResponseHeaders = finalResponseHeaders.replace(noGZ, '')
        finalResponseHeaders = finalResponseHeaders.replace(replaceContentLen, `Content-Length: ${Buffer.byteLength(resData, 'utf8')}${CRLF}`)
      }
      // console.log(finalResponseHeaders)
      await this.writeResponseRecord(res.url, finalResponseHeaders, resData)
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

    if (Array.isArray(nreq.res)) {
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
      if (res.requestHeadersText) {
        // response has full request headers string
        requestHeaders = res.requestHeadersText
      } else if (!isEmpty(res.requestHeaders)) {
        // response did not have the full request headers string use object
        requestHeaders = `${nreq.method} ${purl.path} HTTP/1.1${CRLF}`
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
        requestHeaders = `${nreq.method} ${purl.path} HTTP/1.1${CRLF}`
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
      if (res.headersText || res.headers) {
        if (res.headersText) {
          responseHeaders = res.headersText
        } else if (!isEmpty(res.headers)) {
          head = res.headers
          responseHeaders = `HTTP/1.1 ${res.status} ${res.statusText || STATUS_CODES[res.status]}${CRLF}`
          for (headerKey in head) {
            responseHeaders += `${headerKey}: ${head[headerKey]}${CRLF}`
          }
          responseHeaders += `${CRLF}`
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

    // https://chromedevtools.github.io/devtools-protocol/tot/wcDebugger/#type-RequestId states that
    // the requestId we use as the key is unique to the request so we take the last element
    // no clue why we have two responses
    if (Array.isArray(nreq.res)) {
      res = nreq.res.pop()
    } else {
      res = nreq.res
    }

    if (res.requestHeadersText) {
      requestHeaders = res.requestHeadersText
    } else if (!isEmpty(res.requestHeaders)) {
      requestHeaders = `${nreq.method} ${purl.path} HTTP/1.1${CRLF}`
      head = res.requestHeaders
      if (!(head.host || head.Host)) {
        head['Host'] = purl.host
      }
      for (headerKey in head) {
        requestHeaders += `${headerKey}: ${head[headerKey]}${CRLF}`
      }
    } else if (!isEmpty(nreq.headers)) {
      requestHeaders = `${nreq.method} ${purl.path} HTTP/1.1${CRLF}`
      head = nreq.headers
      if (!(head.host || head.Host)) {
        head['Host'] = purl.host
      }
      for (headerKey in head) {
        requestHeaders += `${headerKey}: ${head[headerKey]}${CRLF}`
      }
      requestHeaders += `${CRLF}`
    } else {
      console.log('the request headers are both empty')
    }
    await this.writeRequestRecord(nreq.url, requestHeaders)

    if (res.headersText) {
      responseHeaders = res.headersText
    } else if (!isEmpty(res.headers)) {
      head = res.headers
      if (!(head.host || head.Host)) {
        head['Host'] = purl.host
      }
      responseHeaders = `HTTP/1.1 ${res.status} ${res.statusText || STATUS_CODES[res.status]}${CRLF}`
      for (headerKey in head) {
        responseHeaders += `${headerKey}: ${head[headerKey]}${CRLF}`
      }
      responseHeaders += `${CRLF}`
    } else {
      console.log('the response headers are empty')
    }
    await this.writeResponseRecord(nreq.url, responseHeaders)
  }
}
