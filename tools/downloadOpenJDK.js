import 'babel-polyfill'
import realFs from 'fs'
import gracefulFs from 'graceful-fs'
gracefulFs.gracefulify(realFs)
import fs from 'fs-extra'
import path from 'path'
import Promise from 'bluebird'
Promise.promisifyAll(fs)
const argv = require('minimist')(process.argv.slice(2))
import os from 'os'

import through2 from 'through2'
import request from 'request'
import extract from 'extract-zip'

let zips = path.resolve('./', 'zips')
let bapps = path.resolve('./', 'bundledApps')

const currentOSArch = `${os.platform()}${os.arch()}`

const idxs = {
  win32ia32: 0,
  win32x64: 1,
  linuxia32: 2,
  linuxx64: 3,
  darwinx64: 4,
}

//checksums from public git
const checkSums = [
  /*https://github.com/alexkasko/openjdk-unofficial-builds/blob/master/checksums/7u80/openjdk-1.7.0-u80-unofficial-windows-i586-image.zip.sha256*/
  'f3b715bc049b3c88bc47695278433c7dc4b2648e2b156f5e24346aecba343035',
  /*https://github.com/alexkasko/openjdk-unofficial-builds/blob/master/checksums/7u80/openjdk-1.7.0-u80-unofficial-windows-amd64-image.zip.sha256*/
  '1b835601f4ae689b9271040713b01d6bdd186c6a57bb4a7c47e1f7244d5ac928',
  /*https://github.com/alexkasko/openjdk-unofficial-builds/blob/master/checksums/7u80/openjdk-1.7.0-u80-unofficial-linux-i586-image.zip.sha256*/
  '2dafc91c91bd088a9d39528c3c29f44024aa10e5863db0f6d76b03b95a2f2917',
  /*https://github.com/alexkasko/openjdk-unofficial-builds/blob/master/checksums/7u80/openjdk-1.7.0-u80-unofficial-linux-amd64-image.zip.sha256*/
  'b87beb73f07af5b89b35b8656439c70fb7f46afdaa36e4a9394ad854c3a0b23d',
  /*https://github.com/alexkasko/openjdk-unofficial-builds/blob/master/checksums/7u80/openjdk-1.7.0-u80-unofficial-macosx-x86_64-image.zip.sha256*/
  'f6df07cec3b1bd53b857e5f4e20309ab5e8aeaa29ca9152ab0d26b77b339780a',
]

//downloads from https://bitbucket.org/alexkasko/openjdk-unofficial-builds and https://github.com/alexkasko/openjdk-unofficial-builds
//have roll your own from https://github.com/hgomez/obuildfactory/wiki can only roll linux so far.....
const jdks = [
  'https://bitbucket.org/alexkasko/openjdk-unofficial-builds/downloads/openjdk-1.7.0-u80-unofficial-windows-i586-image.zip',
  'https://bitbucket.org/alexkasko/openjdk-unofficial-builds/downloads/openjdk-1.7.0-u80-unofficial-windows-amd64-image.zip',
  'https://bitbucket.org/alexkasko/openjdk-unofficial-builds/downloads/openjdk-1.7.0-u80-unofficial-linux-i586-image.zip',
  'https://bitbucket.org/alexkasko/openjdk-unofficial-builds/downloads/openjdk-1.7.0-u80-unofficial-linux-amd64-image.zip',
  'https://bitbucket.org/alexkasko/openjdk-unofficial-builds/downloads/openjdk-1.7.0-u80-unofficial-macosx-x86_64-image.zip',
]

const unpackedJDKs = [
  path.join(zips, 'openjdk-1.7.0-u80-unofficial-windows-i586-image.zip'),
  path.join(zips, 'openjdk-1.7.0-u80-unofficial-windows-amd64-image.zip'),
  path.join(zips, 'openjdk-1.7.0-u80-unofficial-linux-i586-image.zip'),
  path.join(zips, 'openjdk-1.7.0-u80-unofficial-linux-amd64-image.zip'),
  path.join(zips, 'openjdk-1.7.0-u80-unofficial-macosx-x86_64-image.zip'),
]

fs.ensureDir(zips, err => console.log(err))
let namrex = /.zip/
let onlyZip = through2.obj(function (item, enc, next) {
  if (!item.stats.isDirectory() && path.extname(item.path) === '.zip')
    this.push(item)
  next()
})

if (argv.all) {

  jdks.forEach(vm => {
    let opts = {
      method: 'GET',
      url: vm,
      headers: {
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/537.13+ (KHTML, like Gecko) Version/5.1.7 Safari/534.57.2",
        "accept-encoding": "gzip,deflate,compress,application/zip",
      }
    }
    let req = request(opts)

    req.on('response', function (res) {
      let namrex = /['a-zA-z\s=;]+"([a-zA-z0-9.-]+)"/g
      if (res.statusCode !== 200) throw new Error('Status not 200')
      console.log(res.headers)
      var encoding = res.headers[ 'content-type' ]
      var name = namrex.exec(res.headers[ 'content-disposition' ])[ 1 ]

      if (encoding == 'application/zip') {
        console.log('application/zip')
        res.pipe(fs.createWriteStream(`${zips}/${name}`))
      }
    })
    req.on('error', function (err) {
      throw err;
    })
  })

} else {
  let opts = {
    method: 'GET',
    uri: jdks[ idxs[ currentOSArch ] ],
    headers: {
      "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/537.13+ (KHTML, like Gecko) Version/5.1.7 Safari/534.57.2",
      "accept-encoding": "gzip,deflate,compress,application/zip",
    }
  }

  let req = request(opts)

  req.on('response', function (res) {
    let namrex = /['a-zA-z\s=;]+"([a-zA-z0-9.-]+)"/g
    if (res.statusCode !== 200) throw new Error('Status not 200')
    console.log(res.headers)
    var encoding = res.headers[ 'content-type' ]
    var name = namrex.exec(res.headers[ 'content-disposition' ])[ 1 ]

    if (encoding == 'application/zip') {
      console.log('application/zip')
      res.pipe(fs.createWriteStream(`${zips}/${name}`))
        .on('close', () => {
          console.log('we have closed')
          fs.walk(zips)
            .pipe(onlyZip)
            .on('data', item => {
              console.log(path.basename(item.path))
              let name = path.basename(item.path).replace(namrex, '')
              extract(item.path, { dir: `${zips}` }, err1 => {
                console.log(err1)

              })
              console.log(name)
            })

        })

    }
  })
  req.on('error', function (err) {
    throw err;
  })
}





