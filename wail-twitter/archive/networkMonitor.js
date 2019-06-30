import WcRequestMonitor from './wcRequestMonitor'
import {clonner} from './util'
import '../../wail-core/util/setMethods'

export default class NetworkMonitor {
  constructor () {
    this.wcRequests = new WcRequestMonitor()
    this.networkRequests = new Map()
  }

  requestWillBeSent (params) {
    let { request } = params
    if (!this.networkRequests.has(request.url)) {
      this.networkRequests.set(request.url, {
        request: clonner(request),
        response: null
      })
    } else {
      let oldRequest = this.networkRequests.get(request.url).request
      this.networkRequests.get(request.url).request = [ oldRequest, clonner(request) ]
    }
  }

  responseReceived (params) {
    let { response } = params
    if (this.networkRequests.has(response.url)) {
      if (!this.networkRequests.get(response.url).response) {
        this.networkRequests.get(response.url).response = clonner(response)
      } else {
        let oldResponse = this.networkRequests.get(response.url).response
        this.networkRequests.get(response.url).response = [ oldResponse, clonner(response) ]
      }
    }
  }

  attach (webContents) {
    this.wcRequests.attach(webContents)
    return true
  }

  detach (webContents) {
    this.wcRequests.detach(webContents)
  }

  * reqWriteIterator (opts) {
    let requestArray = this.wcRequests.resources()
    do {
      let ninfo = requestArray.shift()
      yield * ninfo.yeildWritable(opts)
    } while (requestArray.length > 0)
  }

  matchNetworkToWC (aUrl) {
    let s1 = new Set(this.wcRequests.keys())
    let s2 = new Set(this.networkRequests.keys())
    let dif = s1.difference(s2)
    console.log(dif)
    for (let wtf of dif) {
      if (wtf !== aUrl) {
        console.log('removing', wtf)
        this.wcRequests.remove(wtf)
        this.networkRequests.delete(wtf)
      }
    }
    this.wcRequests.match(this.networkRequests)
  }
}
