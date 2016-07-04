import Promise from 'bluebird'
import fs from 'fs-extra'
Promise.promisifyAll(fs)
import path from 'path'
import os from 'os'
import shelljs from "shelljs"
import moveThem from './moveJDKMemgator'

const zips = path.resolve('./', 'zips')
const target = path.resolve('./', 'test')
const bapps = path.resolve('./', 'bundledApps')
const currentOSArch = `${os.platform()}${os.arch()}`

const unpackedJDKs = [
  {
    path: path.join(zips, 'openjdk-1.7.0-u80-unofficial-windows-i586-image'),
    name: 'openjdk-1.7.0-u80-unofficial-windows-i586-image'
  },
  {
    path: path.join(zips, 'openjdk-1.7.0-u80-unofficial-windows-amd64-image'),
    name: 'openjdk-1.7.0-u80-unofficial-windows-amd64-image'
  },
  {
    path: path.join(zips, 'openjdk-1.7.0-u80-unofficial-linux-i586-image'),
    name: 'openjdk-1.7.0-u80-unofficial-linux-i586-image'
  },
  {
    path: path.join(zips, 'openjdk-1.7.0-u80-unofficial-linux-amd64-image'),
    name: 'openjdk-1.7.0-u80-unofficial-linux-amd64-image'
  },
  {
    path: path.join(zips, 'openjdk-1.7.0-u80-unofficial-macosx-x86_64-image'),
    name: 'openjdk-1.7.0-u80-unofficial-macosx-x86_64-image'
  },
]

let jdk = {
  path: path.join(zips, 'openjdk-1.7.0-u80-unofficial-linux-amd64-image')

}

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
