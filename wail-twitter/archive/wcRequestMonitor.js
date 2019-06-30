import Resource from './resource'
import _ from 'lodash'
import Promise from 'bluebird'

const filter = {
  urls: ['http://*/*', 'https://*/*']
}

export default class WcRequestMonitor {
  constructor () {
    this.wcRequests = new Map()
    this.hadErrors = new Set()
  }

  attach (webContents) {
    this.wcRequests.clear()
    this.hadErrors.clear()
    webContents.session.webRequest.onSendHeaders(filter, (dets, cb) => {
      this.add('beforeSend', dets)
    })
    webContents.session.webRequest.onHeadersReceived(filter, (dets, cb) => {
      this.add('receiveHead', dets)
      cb({cancel: false, requestHeaders: dets.requestHeaders})
    })
    webContents.session.webRequest.onBeforeRedirect(filter, (dets) => {
      this.add('beforeRedirect', dets)
    })
    webContents.session.webRequest.onCompleted(filter, (dets) => {
      this.add('complete', dets)
    })
    webContents.session.webRequest.onErrorOccurred(filter, (dets) => {
      this.add('error', dets)
      console.log('WEBREQUEST MONITOR ERROR DANGER!!!', dets)
    })
  }

  detach (webContents) {
    webContents.session.webRequest.onSendHeaders(filter, null)
    webContents.session.webRequest.onHeadersReceived(filter, null)
    webContents.session.webRequest.onBeforeRedirect(filter, null)
    webContents.session.webRequest.onCompleted(filter, null)
    webContents.session.webRequest.onErrorOccurred(filter, null)
  }

  add (event, dets) {
    if (event === 'error') {
      this.hadErrors.add(dets.url)
      if (this.wcRequests.has(dets.url)) {
        this.wcRequests.delete(dets.url)
      }
    } else {
      if (!this.hadErrors.has(dets.url)) {
        if (!this.wcRequests.has(dets.url)) {
          this.wcRequests.set(dets.url, new Resource(dets.url, dets.resourceType, dets.method))
        }
        this.wcRequests.get(dets.url).add(event, dets)
      }
    }
  }

  retrieve (doNotInclude) {
    const vals = Array.from(this.wcRequests.values())
    if (doNotInclude) {
      return Promise.map(vals.filter(r => r.url !== doNotInclude), r => r.dl(), {concurrency: 4})
    } else {
      return Promise.map(vals, r => r.dl(), {concurrency: 4})
    }
  }

  dlWrite (warcStream, opts, doNotInclude) {
    if (doNotInclude) {
      return Promise.all(Array.from(this.wcRequests.values()).filter(r => r.url !== doNotInclude).map(r => r.dl()))
    } else {
      return Promise.all(Array.from(this.wcRequests.values()).map(r => r.dl()))
    }
  }

  filter (doNotInclude) {
    return Array.from(this.wcRequests.values()).filter(r => r.url !== doNotInclude)
  }

  getTypesResources (type) {
    return _.filter(Array.from(this.wcRequests.values()), r => r.type == type)
  }

  rTypesGrouped () {
    return _.groupBy(Array.from(this.wcRequests.values()), r => r.type)
  }

  remove (key) {
    this.wcRequests.delete(key)
  }

  keys () {
    return this.wcRequests.keys()
  }

  resources () {
    return Array.from(this.wcRequests.values()).filter(r => r.method === 'GET' && r.rdata !== null)
  }

  [Symbol.iterator] () {
    return this.wcRequests.entries()
  }

  get (key) {
    return this.wcRequests.get(key)
  }

  has (key) {
    return this.wcRequests.has(key)
  }

  match (networkInfo) {
    for (let [url, winfo] of this.wcRequests) {
      let ninfo = networkInfo.get(url)
      if (ninfo) {
        winfo.addNetwork(ninfo)
      } else {
        console.log('ninfo for ', url, 'of wcRequests was null', winfo)
      }
    }
  }

  clear () {
    this.wcRequests.clear()
  }
}
