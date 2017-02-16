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

const indexerP = path.join('/home/john/my-fork-wail/bundledApps/pywb', 'cdx-indexer')
const archiveP = path.join('/home/john/Documents/_WAIL_ManagedCollections/collections/default', 'archive')

const indexer = cp.spawn(indexerP, ['-j', `${archiveP}`])

indexer.stdout.on('data', function (data) {
  console.log('stdout: ' + data.toString());
});

indexer.stderr.on('data', function (data) {
  console.log('stderr: ' + data.toString());
});

indexer.on('exit', function (code) {
  console.log('child process exited with code ' + code.toString());
});

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