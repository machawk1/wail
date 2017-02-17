const _ = require('lodash')
const DB = require('nedb')
const util = require('util')
const path = require('path')
const Promise = require('bluebird')
const S = require('string')
const cp = require('child_process')
const fp = require('lodash/fp')
const fs = require('fs-extra')
const DropBox = require('dropbox')
const prettyBytes = require('pretty-bytes')
const through2 = require('through2')
const streamSort = require('sort-stream2')
const Twit = require('twit')
const jsSearch = require('js-search')
const Rx = require('rxjs/Rx')
const filenamify = require('filenamify')
const filenamifyUrl = require('filenamify-url')
const normalizeUrl = require('normalize-url')
// const autoI = cp.fork('/home/john/my-fork-wail/wail-core/autoIndexer/autoIndexer.js')
//
// autoI.on('message', (m) => {
//   console.log(m)
// })
// autoI.send({
//   type: 'init',
//   pywbP: '/home/john/my-fork-wail/bundledApps/pywb',
//   colPs: ['/home/john/Documents/_WAIL_ManagedCollections/collections/default']
// })
//

const t = 'chrome-extension://klbibkeccnjlkjkiokjodocebajanakg/suspended.html#uri=https://github.com/acdlite/recompose/blob/master/src/packages/recompose/lifecycle.js'
console.log(filenamify(t))
console.log(filenamifyUrl(t))
console.log(normalizeUrl(t,{stripWWW: false,stripFragment: false}))

// const readTweets = async () => {
//   const tweets = await fs.readJSONAsync('wsdlTweet.json')
//   console.log(tweets)
//   tweets.forEach(t => {
//     console.log(t.entities)
//   })
//   // searcher.addDocuments(tweets)
//   // searcher.search('unarchivable').forEach(it => {
//   //   console.log(it)
//   // })
// }

// readTweets()