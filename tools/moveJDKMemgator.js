import 'babel-polyfill'
import realFs from 'fs'
import gracefulFs from 'graceful-fs'
gracefulFs.gracefulify(realFs)
import fs from 'fs-extra'
import path from 'path'
import ncp from 'ncp'
import Promise from 'bluebird'
Promise.promisifyAll(fs)
import os from 'os'

const zips = path.resolve('./', 'zips')

const memgators = path.resolve('./', 'memgators')

const currentOSArch = `${os.platform()}${os.arch()}`

const idxs = {
  win32ia32: 0,
  win32x64: 1,
  linuxia32: 2,
  linuxx64: 3,
  darwinx64: 4,
}

const jdkPaths = [
  path.join(zips, 'openjdk-1.7.0-u80-unofficial-windows-i586-image'),
  path.join(zips, 'openjdk-1.7.0-u80-unofficial-windows-amd64-image'),
  path.join(zips, 'openjdk-1.7.0-u80-unofficial-linux-i586-image'),
  path.join(zips, 'openjdk-1.7.0-u80-unofficial-linux-amd64-image'),
  path.join(zips, 'openjdk-1.7.0-u80-unofficial-macosx-x86_64-image'),
]

const memgatorPaths = [
  path.join(memgators, 'memgator-windows-386.exe'),
  path.join(memgators, 'memgator-windows-amd64.exe'),
  path.join(memgators, 'memgator-linux-386'),
  path.join(memgators, 'memgator-linux-amd64'),
  path.join(memgators, 'memgator-darwin-amd64'),
]

const memgatorNames = [
  'memgator.exe',
  'memgator.exe',
  'memgator',
  'memgator',
  'memgator',
]

export default function moveThem (opts) {

  let memf = memgatorPaths[ idxs[ opts.arch ] ]
  let memn = memgatorNames[ idxs[ opts.arch ] ]
  let jdkpath = jdkPaths[ idxs[ opts.arch ] ]
  let to = opts.to

  console.log(`moving jdk for arch ${opts.arch} to ${to}/openjdk`)
  fs.ensureDir(`${to}/openjdk`, err => {
    if (err) {
      console.error(`There was an error ensuring the jdk directory ${to}/openjdk for arch ${opts.arch} exists`)
      throw err
    }
    ncp(jdkpath, `${to}/openjdk`, err2 => {
      if (err2) {
        console.error(`There was an error moving the jdk for arch ${opts.arch} ${to}/openjdk`)
        throw  err2
      }
      console.log(`done moving jdk for arch ${opts.arch} to ${to}/openjdk`)
      console.log(`moving memgator for arch ${opts.arch} to ${to}/${memn}`)
      fs.copy(memf, `${to}/${memn}`, err3 => {
        if (err3) {
          console.error(`There was an error moving the memgator for arch ${opts.arch} ${to}/${memn}`)
          throw  err3
        }
        console.log(`done moving memgator for arch ${opts.arch} to ${to}/${memn}`)
      })
    })
  })
}





