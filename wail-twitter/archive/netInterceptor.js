const MITMProxy = require('http-mitm-proxy')
const EventEmitter = require('eventemitter3')
const path = require('path')
const Promise = require('bluebird')
const getPort = require('get-port')
const {remote} = require('electron')
const CapturedRequest = require('./capturedRequest')

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

class NetInterceptor extends EventEmitter {
  constructor () {
    super()
    this.proxy = new MITMProxy()
    this._requests = new Map()
    this.proxy_opts = {
      keepAlive: true,
      forceSNI: true,
      port: remote.getGlobal('proxyPort'),
      sslCaDir: remote.getGlobal('proxySSLCaDir')
    }
    this.proxy.onRequest(this.handleIncomingRequest.bind(this))
    this.proxy.onResponse(this.handleIncomingResponse.bind(this))
    this.proxy.onError(this.handleProxyError.bind(this))

    process.on('exit', (code) => {
      this.stop()
    })
  }

  start () {
    return new Promise((resolve, reject) => {
      this.proxy.listen(this.proxy_opts, () => {
        resolve()
      })
    })
  }

  clearRequests () {
    this._requests.clear()
  }

  stop () {
    this.proxy.close()
  }

  switchMapKeys () {
    let capturedRequests = Array.from(this._requests.values())
    this._requests.clear()
    for (let req of capturedRequests) {
      let url = req.url
      if (url) {
        this._requests.set(url, req)
      } else {
        this._requests.set(req.id, req)
      }
    }
  }

  * reqWriteIterator (opts) {
    let capturedRequests = Array.from(this._requests.values())
    do {
      let ninfo = capturedRequests.shift()
      yield * ninfo.yieldWritable(opts)
    } while (capturedRequests.length > 0)
  }

  get requests () {
    return this._requests
  }

  getRequest (id) {
    return this._requests.get(id)
  }

  handleIncomingRequest (ctx, callback) {
    let connection = new CapturedRequest()
    this._requests.set(connection.getId(), connection)
    ctx.log = {
      id: connection.getId()
    }
    let chunks = []
    ctx.onRequestData(function (ctx, chunk, callback) {
      chunks.push(chunk)
      return callback(null, chunk)
    })
    ctx.onRequestEnd(function (ctx, callback) {
      connection.setRequest(ctx.clientToProxyRequest, ctx.isSSL, Buffer.concat(chunks))
      return callback()
    })
    return callback()
  }

  handleIncomingResponse (ctx, callback) {
    let request = ctx.clientToProxyRequest
    let response = ctx.serverToProxyResponse
    // this.emit('log', 'Response arrived: ' + request.method + ' ' + request.url + ' ' + response.statusCode)
    let connectionId = ctx.log && ctx.log.id
    let connection = null
    if (connectionId) {
      connection = this._requests.get(connectionId)
    }
    if (!connection) {
      this.emit('error', `Connection not found. ${request.url}`)
      return
    }
    connection.setResponse(response)
    connection.responseReceived()
    // this.emit('response-received', connection)
    ctx.onResponseData(function (ctx_, chunk, callback) {
      connection.dataReceived(chunk)
      return callback(null, chunk)
    })
    ctx.onResponseEnd(function (ctx_, callback) {
      connection.responseFinished()
      return callback()
    })
    return callback()
  }

  handleProxyError (ctx, error) {
    this.emit('error', 'Proxy error: ' + error)
  }
}

module.exports = NetInterceptor
