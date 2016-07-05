import "babel-polyfill"
import realFs from 'fs'
import gracefulFs from 'graceful-fs'
gracefulFs.gracefulify(realFs)
import fs from 'fs-extra'
import path from 'path'
import Promise from 'bluebird'
Promise.promisifyAll(fs)
const argv = require('minimist')(process.argv.slice(2))
import os from 'os'
import moveThem from './moveJDKMemgator'
import through2 from 'through2'
import request from 'request'
import extract from 'extract-zip'
import shelljs from 'shelljs'

const zips = path.resolve('./', 'zips')
const bapps = path.resolve('./', 'bundledApps')
const memgatorsP = path.resolve('./', 'memgators')

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

const memgators = [
  'https://github.com/oduwsdl/memgator/releases/download/1.0-rc5/memgator-windows-386.exe',
  'https://github.com/oduwsdl/memgator/releases/download/1.0-rc5/memgator-windows-amd64.exe',
  'https://github.com/oduwsdl/memgator/releases/download/1.0-rc5/memgator-linux-386',
  'https://github.com/oduwsdl/memgator/releases/download/1.0-rc5/memgator-linux-amd64',
  'https://github.com/oduwsdl/memgator/releases/download/1.0-rc5/memgator-darwin-amd64',
]

const unpackedJDKs = [
  path.join(zips, 'openjdk-1.7.0-u80-unofficial-windows-i586-image'),
  path.join(zips, 'openjdk-1.7.0-u80-unofficial-windows-amd64-image'),
  path.join(zips, 'openjdk-1.7.0-u80-unofficial-linux-i586-image'),
  path.join(zips, 'openjdk-1.7.0-u80-unofficial-linux-amd64-image'),
  path.join(zips, 'openjdk-1.7.0-u80-unofficial-macosx-x86_64-image'),
]

const titles = [
  'downloading openjdk-7u80-win-i586',
  'done downloading openjdk-7u80-win-i586',
  'downloading openjdk7u80-win-amd64',
  'done downloading openjdk7u80-win-amd64',
  'downloading openjdk7u80-linux-i586',
  'done downloading openjdk7u80-linux-i586',
  'downloading openjdk7u80-linux-amd64',
  'done downloading openjdk7u80-linux-amd64',
  'downloading openjdk7u80-darwin-x86_64',
  'done downloading openjdk7u80-darwin-x86_64',
  'downloading memgator-win386',
  'done downloading memgator-win386',
  'downloading memgator-wind-amd64',
  'done downloading memgator-wind-amd64',
  'downloading memgator-linux-386',
  'done downloading memgator-linux-386',
  'downloading memgator-linux-amd64',
  'done downloading memgator-linux-amd64',
  'downloading memgator-darwin-amd64',
  'done downloading memgator-darwin-amd64',
  'downloading of externals complete'
]

const zipRE = /.zip/

let titleC = 0

function downloadJDK (uri) {
  return new Promise((resolve, reject) => {
    let opts = {
      method: 'GET',
      uri: uri,
      headers: {
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/537.13+ (KHTML, like Gecko) Version/5.1.7 Safari/534.57.2",
        "accept-encoding": "gzip,deflate,compress,application/zip",
      }
    }
    let req = request(opts)
    req.on('response', function (res) {
      let namrex = /['a-zA-z\s=;]+"([a-zA-z0-9.-]+)"/g
      if (res.statusCode !== 200) throw new Error('Status not 200')
      let encoding = res.headers[ 'content-type' ]
      let name = namrex.exec(res.headers[ 'content-disposition' ])[ 1 ]
      if (encoding == 'application/zip') {
        console.log(titles[ titleC++ ])
        res.pipe(fs.createWriteStream(`${zips}/${name}`))
          .on('close', () => {
            console.log(titles[ titleC++ ])
            resolve()
          })
      }
    })
    req.on('error', function (err) {
      reject(err)
    })
  })
}

function downloadMemgator (uri) {
  return new Promise((resolve, reject) => {
    let opts = {
      method: 'GET',
      uri: uri,
      headers: {
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/537.13+ (KHTML, like Gecko) Version/5.1.7 Safari/534.57.2",
      }
    }
    let req = request(opts)
    req.on('response', function (res) {
      let namrex = /['a-zA-z;\s]+=([a-zA-z0-9.-]+)/g
      if (res.statusCode !== 200) throw new Error('Status not 200')
      let encoding = res.headers[ 'content-type' ]
      let name = namrex.exec(res.headers[ 'content-disposition' ])[ 1 ]
      if (encoding == 'application/octet-stream') {
        console.log(titles[ titleC++ ])
        res.pipe(fs.createWriteStream(`${memgatorsP}/${name}`))
          .on('close', () => {
            console.log(titles[ titleC++ ])
            resolve()
          })
      }
    })
    req.on('error', function (err) {
      reject(err)
    })
  })
}

function extractZip (zipPath) {
  return new Promise((resolve, reject) => {
    let name = path.basename(zipPath).replace(zipRE, '')
    extract(zipPath, { dir: `${zips}`}, zipError => {
      if (zipError) {
        console.error(zipError)
        reject(zipError)
      } else {
        console.log(`done extracting ${name} ensuring content is not read only`)
        console.log(`done ensuring not read only for ${name}`)
        resolve()
      }
    })
  })
}

fs.ensureDirSync(zips)
fs.ensureDirSync(memgatorsP)
let onlyZip = through2.obj(function (item, enc, next) {
  if (!item.stats.isDirectory() && path.extname(item.path) === '.zip')
    this.push(item)
  next()
})

let unzipPaths = []

if (argv.all) {
  Promise.map(jdks, downloadJDK)
    .then(() => {
      Promise.map(memgators, downloadMemgator)
        .then(() => {
          fs.walk(zips)
            .pipe(onlyZip)
            .on('data', item => {
              shelljs.chmod('777', item.path)
              unzipPaths.push(item.path)
            })
            .on('end', () =>
              Promise.map(unzipPaths, extractZip)
                .then(() => console.log("finished"))
                .catch(error => console.error(error))
            )
        }).catch(err => console.error('there was an error downloading a jdk', err))

    })
    .catch(err => console.error('there was an error downloading a memgator', err))

} else {
  console.log(`Downloading jdk for ${currentOSArch}`)
  downloadJDK(jdks[ idxs[ currentOSArch ] ])
    .then(() => {
      console.log(`Downloading memgator for ${currentOSArch}`)
      downloadMemgator(memgators[ idxs[ currentOSArch ] ])
        .then(() => {
          console.log(`Done downloading memgator for ${currentOSArch} extracting jdk `)
          fs.walk(zips)
            .pipe(onlyZip)
            .on('data', item => {
              shelljs.chmod('777', item.path)
              extract(item.path, { dir: `${zips}`}, zipError => {
                if (zipError) {
                  console.error(`error extracting jdk for ${currentOSArch}`, zipError)
                } else {
                  let name = path.basename(item.path).replace(zipRE, '')
                  console.log(`Done extracting jdk for ${currentOSArch}`)
                  moveThem({ arch: currentOSArch, to: bapps })
                }
              })
            })
        })
        .catch(err => {
          console.error("there was an error in downloading the memgator for the current os", err)
        })
    })
    .catch(err => {
      console.error("there was an error in downloading the jdk for the current os", err)
    })

}
