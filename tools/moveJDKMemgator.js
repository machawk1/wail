import 'babel-polyfill'
import realFs from 'fs'
import gracefulFs from 'graceful-fs'
gracefulFs.gracefulify(realFs)
import fs from 'fs-extra'
import shelljs from "shelljs"
import path from 'path'
import Promise from 'bluebird'
Promise.promisifyAll(fs)
import os from 'os'

const zips = path.resolve('./', 'zips')
const memgators = path.resolve('./', 'memgators')
const bapps = path.resolve('./', 'bundledApps')
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
  if (!opts) {
    opts = {
      arch: currentOSArch,
      to: bapps
    }
  }
  
  let to = opts.to
  let memgatorFromPath = memgatorPaths[ idxs[ opts.arch ] ]
  let memgatorToPath = path.join(to, memgatorNames[ idxs[ opts.arch ] ])
  let jdkFromPath = jdkPaths[ idxs[ opts.arch ] ]
  let jdkToPath = path.join(to, "openjdk")
  console.log(`moving jdk ${jdkFromPath} to ${jdkToPath}`)
  fs.copy(jdkFromPath, jdkToPath, { clobber: true }, (jdkError) => {
    if (jdkError) return console.error(jdkError)
    console.log("success in moving jdk!")
    console.log(`moving memgator ${memgatorFromPath} to ${memgatorToPath}`)
    fs.copy(memgatorFromPath, memgatorToPath, { clobber: true }, (memgatorError) => {
      if (memgatorError) return console.error(memgatorError)
      shelljs.chmod('777',memgatorToPath)
      shelljs.chmod('-R','777',jdkToPath)
      console.log("success in moving memgator!")
    })
  })
}





