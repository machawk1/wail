export default class ElectronRequestMonitor extends Map {
  constructor () {
    super()
    this._capture = true
    this._requestWillBeSent = this._requestWillBeSent.bind(this)
    this._responseReceived = this._responseReceived.bind(this)
    this._set = this.set.bind(this)

    this.set = () => {
      console.log('you fell for the trap!!! You cant add values to me, only I can :)')
    }
  }

  attach (wcDebugger) {
    wcDebugger.on('message', (event, method, params) => {
      if (method === 'Network.requestWillBeSent') {
        this._requestWillBeSent(params)
      } else if (method === 'Network.responseReceived') {
        this._responseReceived(params)
      }
    })
  }

  /**
   * @desc Sets an internal flag to begin capturing network requests
   * @param {boolean} [clear = true] clear the any previous captured requests
   * defaults to true
   */
  startCapturing (clear = true) {
    if (clear) {
      this.clear()
    }
    this._capture = true
  }

  /**
   * @desc Sets an internal flag to stop the capturing network requests
   */
  stopCapturing () {
    this._capture = false
  }

  /**
   * @desc
   * @param {Object} info
   * @private
   */
  _requestWillBeSent (info) {
    if (this._capture) {
      if (this.has(info.requestId)) {
        if (info.redirectResponse) {
          if (this.get(info.requestId).redirectResponse) {
            let cr = this.get(info.requestId)
            if (Array.isArray(cr.redirectResponse)) {
              cr.redirectResponse.push({
                url: info.redirectResponse.url,
                status: info.redirectResponse.status,
                statusText: info.redirectResponse.statusText,
                headers: info.redirectResponse.headers,
                headersText: info.redirectResponse.headersText,
                requestHeaders: info.redirectResponse.requestHeaders || info.headers,
                requestHeadersText: info.redirectResponse.requestHeadersText,
                method: info.redirectResponse.method,
                protocol: info.redirectResponse.protocol
              })
              this._set(info.requestId, cr)
            } else {
              let oldRR = cr.redirectResponse
              cr.redirectResponse = [oldRR, {
                url: info.redirectResponse.url,
                status: info.redirectResponse.status,
                statusText: info.redirectResponse.statusText,
                headers: info.redirectResponse.headers,
                headersText: info.redirectResponse.headersText,
                requestHeaders: info.redirectResponse.requestHeaders || info.headers,
                requestHeadersText: info.redirectResponse.requestHeadersText,
                method: info.redirectResponse.method,
                protocol: info.redirectResponse.protocol
              }]
              this._set(info.requestId, cr)
            }
          } else {
            this.get(info.requestId).redirectResponse = {
              url: info.redirectResponse.url,
              status: info.redirectResponse.status,
              statusText: info.redirectResponse.statusText,
              headers: info.redirectResponse.headers,
              headersText: info.redirectResponse.headersText,
              requestHeaders: info.redirectResponse.requestHeaders || info.headers,
              requestHeadersText: info.redirectResponse.requestHeadersText,
              method: info.redirectResponse.method,
              protocol: info.redirectResponse.protocol
            }
          }
        } else {
          console.log('double request')
        }
      } else {
        let captured = {
          requestId: info.requestId,
          url: info.request.url,
          headers: info.request.headers,
          method: info.request.method
        }
        if (info.redirectResponse) {
          console.log('first req has redirect res')
        }
        if (info.request.postData !== undefined && info.request.postData !== null) {
          captured.postData = info.request.postData
        }
        this._set(info.requestId, captured)
      }
    }
  }

  _responseReceived (info) {
    if (this._capture) {
      if (!this.has(info.requestId)) {
        console.log('booooo no have matching request for', info.requestId)
        this._set(info.requestId, {
          res: info.response
        })
      } else {
        if (this.get(info.requestId).res) {
          if (Array.isArray(this.get(info.requestId).res)) {
            this.get(info.requestId).res.push({
              url: info.response.url,
              status: info.response.status,
              statusText: info.response.statusText,
              headers: info.response.headers,
              headersText: info.response.headersText,
              requestHeaders: info.response.requestHeaders,
              requestHeadersText: info.response.requestHeadersText,
              protocol: info.response.protocol
            })
          } else {
            let oldRes = this.get(info.requestId).res
            this.get(info.requestId).res = [oldRes, {
              url: info.response.url,
              status: info.response.status,
              statusText: info.response.statusText,
              headers: info.response.headers,
              headersText: info.response.headersText,
              requestHeaders: info.response.requestHeaders,
              requestHeadersText: info.response.requestHeadersText,
              protocol: info.response.protocol
            }]
          }
        } else {
          this.get(info.requestId).res = {
            url: info.response.url,
            status: info.response.status,
            statusText: info.response.statusText,
            headers: info.response.headers,
            headersText: info.response.headersText,
            requestHeaders: info.response.requestHeaders,
            requestHeadersText: info.response.requestHeadersText,
            protocol: info.response.protocol
          }
        }
      }
    }
  }
}
