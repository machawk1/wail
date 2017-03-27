const Promise = require('bluebird')
const url = require('url')
const urlType = require('url-type')
const _ = require('lodash')
const mime = require('mime-types')
const path = require('path')

const cleanLinkSearch = ret => _.uniq(_.remove(ret, it => it !== ''))

const outLinkIs = (outlink, seedHost) => {
  if (url.parse(outlink).hostname === seedHost) {
    return 'sd'
  } else {
    return 'el'
  }
}

const badLink = (link, nrLink) => {
  const testR = link.startsWith('#') || link.startsWith('chrome-extension') || link.indexOf('mailto:') >= 0
  const baseTest = nrLink.startsWith('#') || link.indexOf('mailto:') >= 0
  return baseTest || testR || !!mime.lookup(link)
}

class DebuggerUtil {
  constructor () {
    this._wc = null
    this._resolveUrl = null
    this._getAllNodeAtts = this._getAllNodeAtts.bind(this)
    this._getNodeAtts = this._getNodeAtts.bind(this)
    this._getSearchResults = this._getSearchResults.bind(this)
    this._searchDom = this._searchDom.bind(this)
    this._getNodeAttsWithFrom = this._getNodeAttsWithFrom.bind(this)
    this._getAllNodeAttsWithFrom = this._getAllNodeAttsWithFrom.bind(this)
    this.extractLinks = this.extractLinks.bind(this)
    this.getAllLinks = this.getAllLinks.bind(this)
    this.getDom = this.getDom.bind(this)
    this.attach = this.attach.bind(this)
    this.detach = this.detach.bind(this)
  }

  attach (wc, resolveUrl) {
    this._wc = wc
    this._resolveUrl = resolveUrl
    this._resolveUrlHost = url.parse(resolveUrl).hostname
    return new Promise((resolve, reject) => {
      try {
        this._wc.debugger.attach('1.2')
        this._wc.debugger.sendCommand('Page.enable', (errP) => {
          if (!_.isEmpty(errP)) {
            return reject(errP)
          }
          this._wc.debugger.sendCommand('DOM.enable', (errD) => {
            if (!_.isEmpty(errD)) {
              return reject(errD)
            }
            resolve()
          })
        })
      } catch (err) {
        console.error(err)
        reject(err)
      }
    })
  }

  detach () {
    this._wc.debugger.detach()
  }

  getResourceFrameLinks () {
    return new Promise((resolve, reject) => {
      this._wc.debugger.sendCommand('Page.getResourceTree', (err, ret) => {
        if (!_.isEmpty(err)) {
          return reject(err)
        } else {
          let {frameTree} = ret
          let childFrames = frameTree.childFrames.map(cf => ({
            id: cf.frame.id,
            url: cf.frame.url,
            rez: cf.resources.map(res => res.url)
          }))
          let resourceUrls = frameTree.resources.map(res => res.url)
          resolve({
            childFrames,
            resourceUrls,
            topFrameId: frameTree.frame.id
          })
        }
      })
    })
  }

  getDom () {
    return new Promise((resolve, reject) => {
      this._wc.debugger.sendCommand('DOM.getDocument', (err1, {root}) => {
        if (!_.isEmpty(err1)) {
          return reject(err1)
        } else {
          this._wc.debugger.sendCommand('DOM.getOuterHTML', {nodeId: root.nodeId}, (err2, dom) => {
            if (!_.isEmpty(err2)) {
              return reject(err2)
            } else {
              resolve(dom)
            }
          })
        }
      })
    })
  }

  getAllLinks () {
    return this._searchDom()
      .then(this._getSearchResults)
      .then(this._getAllNodeAtts)
      .then(cleanLinkSearch)
  }

  extractLinks (linkFun) {
    return this._searchDom()
      .then(this._getSearchResults)
      .then(this._getAllNodeAttsWithFrom)
      .then(linkFun)
  }

  _searchDom () {
    return new Promise((resolve, reject) => {
      this._wc.debugger.sendCommand('DOM.performSearch', {query: '//@src | //@href'}, (err, qRet) => {
        if (!_.isEmpty(err)) {
          reject(err)
        } else {
          resolve(qRet)
        }
      })
    })
  }

  _getSearchResults ({resultCount, searchId}) {
    return new Promise((resolve, reject) => {
      this._wc.debugger.sendCommand('DOM.getSearchResults', {
        searchId, fromIndex: 0, toIndex: resultCount - 1
      }, (err, qRet) => {
        if (!_.isEmpty(err)) {
          reject(err)
        } else {
          console.log(qRet)
          resolve(qRet)
        }
      })
    })
  }

  _getNodeAttsWithFrom (nodeId) {
    return new Promise((resolve, reject) => {
      this._wc.debugger.sendCommand('DOM.getAttributes', {
        nodeId
      }, (err, qRet) => {
        if (!_.isEmpty(err)) {
          reject(err)
        } else {
          let {attributes} = qRet
          let srcIdx = _.indexOf(attributes, 'src')
          let link = '', from = 'src', ol, olIs = '', orgl = ''
          if (srcIdx > -1) {
            orgl = attributes[srcIdx + 1]
            link = url.resolve(this._resolveUrl, attributes[srcIdx + 1])
            ol = `${link} E =EMBED_MISC\r\n`
          } else {
            orgl = attributes[_.indexOf(attributes, 'href') + 1]
            link = url.resolve(this._resolveUrl, attributes[_.indexOf(attributes, 'href') + 1])
            if (_.indexOf(attributes, 'rel') === -1) {
              olIs = outLinkIs(link, this._resolveUrlHost)
              ol = `outlink: ${link} L a/@href\r\n`
              from = 'href'
            } else {
              from = olIs = 'rel'
              ol = `${link} E =EMBED_MISC\r\n`
            }
          }
          if (badLink(link, orgl)) {
            resolve({from: 'bad'})
          } else {
            resolve({from, ol, link, olIs})
          }
        }
      })
    })
  }

  _getNodeAtts (nodeId) {
    return new Promise((resolve, reject) => {
      this._wc.debugger.sendCommand('DOM.getAttributes', {
        nodeId
      }, (err, qRet) => {
        if (!_.isEmpty(err)) {
          reject(err)
        } else {
          let {attributes} = qRet
          let srcIdx = _.indexOf(attributes, 'src')
          let link = ''
          if (srcIdx > -1) {
            link = attributes[srcIdx + 1]
          } else {
            link = attributes[_.indexOf(attributes, 'href') + 1]
          }
          if (link.startsWith('#') || link.startsWith('chrome-extension') || link.indexOf('mailto:') >= 0) {
            resolve('')
          } else {
            resolve(url.resolve(this._resolveUrl, link))
          }
        }
      })
    })
  }

  _getAllNodeAtts ({nodeIds}) {
    return Promise.map(nodeIds, this._getNodeAtts, {concurrency: 1})
  }

  _getAllNodeAttsWithFrom ({nodeIds}) {
    return Promise.map(nodeIds, this._getNodeAttsWithFrom, {concurrency: 1})
  }
}

module.exports = DebuggerUtil
