import 'babel-polyfill'
import fs from 'fs-extra'
import Promise from 'bluebird'
import S from 'string'
import {encode, compare} from 'bytewise'
import _ from 'lodash'
import feathers from 'feathers/client'
import socketio from 'feathers-socketio/client'
import hooks from 'feathers-hooks'
import io from 'socket.io-client'
import yaml from 'yamljs'
import path from 'path'
import mongodb_prebuilt from 'mongodb-prebuilt'


const socket = io('http://localhost:3030',{ pingTimeout: 120000 })
const app = feathers()
  .configure(hooks())
  .configure(socketio(socket,{ pingTimeout: 120000 }))

const memgator = app.service('/archivesManager')
memgator.find({}).then(data => {
  console.log(data)
})
//
// // memgator.create({ name: 'xyz' })
// //   .then(created => {
// //     console.log(created)
// //     memgator.update('xyz' , { existingWarcs: '/home/john/wail/archives/*.warc'}, { query: {action: 'addWarcs' } })
// //       .then(data => {
// //         console.log(data)
// //         process.exit(0)
// //       })
// //       .catch(error => {
// //         console.error(error)
// //         process.exit(0)
// //       })
// //   })
// //   .catch(err => {
// //     console.error(err)
// //     process.exit(0)
// //   })
//
//
// memgator.update('xyz',{ metadata: ['title="Test"','description="Makeing sure this works"']},{query: {action: 'addMetadata'}})
//   .then(data => {
//     console.log(data)
//     process.exit(0)
//   })
//   .catch(error => {
//     console.error(error)
//     process.exit(0)
//   })

//
// function logs_callback(buffer) {
//   console.log("log message:", buffer.toString());
// }
//
// mongodb_prebuilt.start_server({
//   logs_callback: logs_callback,
//   args: {
//     dbpath: '/home/john/my-fork-wail/wail-core/dbs'
//   }
// }, function(err) {
//   if (!err) console.log('server started')
//   else  console.error(err)
// })

//
// let managed = {
//   port: '8080',
//   url: 'http://localhost:{port}/',
//   newCollection: 'bundledApps/pywb/wb-manager init {col}',
//   addWarcsToCol: 'bundledApps/pywb/wb-manager add {col} {warcs}',
//   addMetadata: 'bundledApps/pywb/wb-manager metadata {col} --set {metadata}',
//   reindexCol: 'bundledApps/pywb/wb-manager reindex {col}',
//   convertCdx: 'bundledApps/pywb/wb-manager convert-cdx {cdx}',
//   autoIndexCol: 'bundledApps/pywb/wb-manager autoindex {col}',
//   autoIndexDir: 'bundledApps/pywb/wb-manager autoindex {dir}',
//   sortedCombinedCdxj: 'bundledApps/pywb/cdx-indexer --sort -j combined.cdxj {warcs}',
//   sortedCombinedCdx: 'bundledApps/pywb/cdx-indexer --sort combined.cdx {warcs}',
//   cdxjPerColWarc: 'bundledApps/pywb/cdx-indexer --sort -j {cdx} {warc}',
//   cdxPerColWarc: 'bundledApps/pywb/cdx-indexer --sort {cdx} {warc}',
//   wayback: 'bundledApps/pywb/wayback',
//   waybackPort: 'bundledApps/pywb/wayback -p {port}',
//   waybackReplayDir: 'bundledApps/pywb/wayback -d {dir}',
//   waybackReplayDirPort: 'bundledApps/pywb/wayback -p {port} -d {dir}'
// }
//
// S.TMPL_OPEN = '{'
// S.TMPL_CLOSE = '}'
//
// let pywb = _.mapValues(managed,(v,k) => {
//   console.log(v,k)
//   if(k !== 'port' && k !== 'url') {
//     v = path.normalize(path.join('/home/john/my-fork-wail', v))
//   }
//   if(k === 'url') {
//     v = S(v).template({port: managed.port}).s
//   }
//   return v
// })
//
// console.log(pywb)
