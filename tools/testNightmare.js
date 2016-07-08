import Promise from 'bluebird'
import fs from 'fs-extra'
Promise.promisifyAll(fs)
import path from 'path'
import os from 'os'
import shelljs from "shelljs"
import moveThem from './moveJDKMemgator'
import schedule from 'node-schedule'
import crossZip from "cross-zip"
import plist from "plist"
import 'babel-polyfill'
import autobind from 'autobind-decorator'
import childProcess from 'child_process'
import through2 from 'through2'
import S from 'string'
import del from 'del'
import streamSort from 'sort-stream2'
import bytewise from 'bytewise'
import ReadWriteLock from 'rwlock'
import util from 'util'

function unixSort (a, b) {
  return bytewise.compare(bytewise.encode(a), bytewise.encode(b))
}

let warcsP = '/home/john/wail/archives'
let indexP = '/home/john/wail/config/path-index.txt'

function generatePathIndex (genCdx) {
  let index = []
  let count = 0
  let onlyWarf = through2.obj(function (item, enc, next) {
    if (!item.stats.isDirectory() && path.extname(item.path) === '.warc') {
      this.push(item)
      count++
    }
    next()
  })

  console.log("Aquiring pindex readlock")
  fs.walk(warcsP)
    .on('error', (err) => onlyWarf.emit('error', err)) // forward the error on
    .pipe(onlyWarf)
    .on('data', item => {
      index.push(`${path.basename(item.path)}\t${item.path}`)
    })
    .on('end', () => {
      console.log("Aquiring pindex writelock")
      if (count > 0) {
        console.log('The count was greater than zero')
        fs.writeFile(indexP, index.join(os.EOL), 'utf8', err => {
          console.log("Releasing pindex writelock")
          if (err) {
            console.error('generating path index with error', err)
          } else {
            console.log('done generating path index no error')
            genCdx()
          }
        })
      } else {
        console.log("There were no warcs to index")
      }

    })
    .on('error', err => console.error(err))

}

function generateCDX () {
  let replace = /.warc+$/g
  let cdxHeaderIncluded = false

  let onlyWorf = through2.obj(function (item, enc, next) {
    if (!item.stats.isDirectory() && path.extname(item.path) === '.warc')
      this.push(item)
    next()
  })

  let cdxp = '/home/john/wail/archiveIndexes'
  let cdxIndexer = '/home/john/wail/bundledApps/tomcat/webapps/bin/cdx-indexer'

  let worfToCdx = through2.obj(function (item, enc, next) {
    let through = this //hope this ensures that this is through2.obj
    let cdx = path.basename(item.path).replace(replace, '.cdx')
    let cdxFile = `${cdxp}/${cdx}`
    childProcess.exec(`${cdxIndexer} ${item.path} ${cdxFile}`, (err, stdout, stderr) => {
      if (err) {
        console.error(err)
      }
      fs.readFile(cdxFile, 'utf8', (errr, value)=> {
        if (errr) {
          console.error(errr)
        }
        through.push(value)
        next()
      })
    })
  })

  let uniqueLines = new Set()

  let cdxToLines = through2.obj(function (item, enc, next) {
    let through = this
    S(item).lines().forEach((line, index) => {
      if (!uniqueLines.has(line)) {
        if (index > 0) {
          if (!S(line).isEmpty()) {
            through.push(`${line.trim()}${os.EOL}`)
          }
        } else if (!cdxHeaderIncluded) {
          through.push(`${line}${os.EOL}`)
          cdxHeaderIncluded = true
        }
        uniqueLines.add(line)
      }
    })
    next()
  })

  let writeStream = fs.createWriteStream('/home/john/wail/archiveIndexes/index.cdx')
  console.log('Acquiring write lock for indexCDX')
  fs.walk(warcsP)
    .on('error', (err) => onlyWorf.emit('error', err)) // forward the error on please....
    .pipe(onlyWorf)
    .on('error', (err) => worfToCdx.emit('error', err)) // forward the error on please....
    .pipe(worfToCdx)
    .pipe(cdxToLines)
    .pipe(streamSort(unixSort))
    .pipe(writeStream)
    .on('close', () => {
      writeStream.destroy()
      console.log('we have closed')
      // del([ settings.get('wayback.allCDX'), settings.get('wayback.notIndexCDX') ], { force: true })
      //   .then(paths => {
      //     console.log('Releaseing write lock for indexCDX')
      //     console.log('Deleted files and folders:\n', paths.join('\n'))
      //
      //   })
    })
    .on('error', err => console.error(err))

}

generatePathIndex(generateCDX)


//
// const zips = path.resolve('./', 'zips')
// const target = path.resolve('./', 'test')
// const bapps = path.resolve('./', 'bundledApps')
// const currentOSArch = `${os.platform()}${os.arch()}`
//
// const unpackedJDKs = [
//   {
//     path: path.join(zips, 'openjdk-1.7.0-u80-unofficial-windows-i586-image'),
//     name: 'openjdk-1.7.0-u80-unofficial-windows-i586-image'
//   },
//   {
//     path: path.join(zips, 'openjdk-1.7.0-u80-unofficial-windows-amd64-image'),
//     name: 'openjdk-1.7.0-u80-unofficial-windows-amd64-image'
//   },
//   {
//     path: path.join(zips, 'openjdk-1.7.0-u80-unofficial-linux-i586-image'),
//     name: 'openjdk-1.7.0-u80-unofficial-linux-i586-image'
//   },
//   {
//     path: path.join(zips, 'openjdk-1.7.0-u80-unofficial-linux-amd64-image'),
//     name: 'openjdk-1.7.0-u80-unofficial-linux-amd64-image'
//   },
//   {
//     path: path.join(zips, 'openjdk-1.7.0-u80-unofficial-macosx-x86_64-image'),
//     name: 'openjdk-1.7.0-u80-unofficial-macosx-x86_64-image'
//   },
// ]
//
// let jdk = {
//   path: path.join(zips, 'openjdk-1.7.0-u80-unofficial-linux-amd64-image')
//
// }

console.log(fs.readFileSync('/home/john/wail/buildResources/osx/Extended-Info.plist','utf8'))
console.log(plist.parse(fs.readFileSync('/home/john/wail/buildResources/osx/Extended-Info.plist','utf8')))
// crossZip.zipSync()
// rule.second = interval
// let count = 0
// let startAgain = true
// const closure = () => {
//   if(startAgain){
//     count = 0
//     startAgain = false
//     return rule
//   }
//   return null
//
// }
// let job = schedule.scheduleJob(rule, () => {
//   if(count < 10) {
//       console.log(`job ${count}`)
//     count += 1
//   } else {
//
//     let restart = closure()
//     if(restart != null){
//       job.cancel(true)
//       job.schedule(restart)
//     } else {
//       job.cancel(false)
//     }
//   }
// })
// moveThem({arch: "win32x64", to: target })
//
// let mp = "/home/john/wail/memgators/memgator-linux-amd64"
// fs.copy(jdk.path, path.join(target,"openjdk"), {clobber: true}, (err) => {
//   if (err) return console.error(err)
//   console.log("success!")
//   fs.copy(mp,path.join(target,"memgator"), {clobber: true}, (err) => {
//     if (err) return console.error(err)
//     fs.chmodSync(path.join(target,"memgator"), '777')
//     console.log("success!")
//   })
// })
// unpackedJDKs.forEach(jdk => {
//   console.log("moving ",jdk)
//   fs.copy(jdk.path,`${target}${path.sep}${jdk.name}`,(err) => {
//     if (err) return console.error(err)
//     console.log("success!")
//   })
// })
