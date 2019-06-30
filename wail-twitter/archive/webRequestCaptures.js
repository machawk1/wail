const S = require('string')
const capturers = resourceManager => ({
  beforeSendHead: (dets, cb) => {
    if (dets.resourceType !== 'mainFrame' || dets.resourceType !== 'subframe') {
      resourceManager.add('beforeSend', dets)
    }
    cb({ cancel: false, requestHeaders: dets.requestHeaders })
  },
  receiveHead: (dets, cb) => {
    if (dets.resourceType !== 'mainFrame' || dets.resourceType !== 'subframe') {
      resourceManager.add('receiveHead', dets)
    }
    cb({ cancel: false, requestHeaders: dets.requestHeaders })
  },
  beforeRedirect: dets => {
    if (dets.resourceType !== 'mainFrame' || dets.resourceType !== 'subframe') {
      resourceManager.add('beforeRedirect', dets)
    }
  },
  onComplete (dets) {
    if (dets.resourceType !== 'mainFrame' || dets.resourceType !== 'subframe') {
      resourceManager.add('complete', dets)
    }
  }
})

module.exports = capturers
