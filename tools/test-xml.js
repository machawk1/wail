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

const heritrixPath = '/home/john/some thing/heritrix'
// fs.stat('/home/john/some thing2/heritrix', (errC, stats) => {
//   console.log(errC, stats)
// })

fs.ensureDir('/home/john/some thing/some thing 2', e => {
  console.log(e)
})
fs.copy('/home/john/some thing/heritrix', '/home/john/some thing/some thing 2/h', (errCopy) => {
  console.log(errCopy)
})
// const ls = cp.spawn('cp', ['-r', '/home/john/some thing/heritrix', '/home/john/some thing/some thing else'])
//
// ls.stdout.on('data', (data) => {
//   console.log(`stdout: ${data}`);
// });
//
// ls.stderr.on('data', (data) => {
//   console.log(`stderr: ${data}`);
// });
//
// ls.on('close', (code) => {
//   console.log(`child process exited with code ${code}`);
// })
// const myDrpBx = new DropBox({accessToken: 'mWS__8ZEoCIAAAAAAAAAR2diLk1kQo31OKfnAq9YQp5QG1ueh1_Q7-T5DJexumwK'})
// myDrpBx.filesDownload({path: '/Convict Conditioning - Paul Wade.pdf'})
//   .then(response => {
//     fs.writeFile(response.name, response.fileBinary, 'binary', function (err) {
//       if (err) { throw err; }
//       console.log('File: ' + data.name + ' saved.');
//     })
//   })
//   .catch(error => {
//     console.log(error)
//   })

