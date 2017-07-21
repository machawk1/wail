const fs = require('fs-extra')
const path = require('path')
const os = require('os')
const webpack = require('webpack')
const zip = require('cross-zip')
const shelljs = require('shelljs')


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

async function moveThemP (opts) {
  return new Promise((resolve, reject) => {
    if (!opts) {
      opts = {
        arch: currentOSArch,
        to: bapps
      }
    }
    let to = opts.to
    let memgatorFromPath = memgatorPaths[idxs[opts.arch]]
    let memgatorToPath = path.join(to, memgatorNames[idxs[opts.arch]])
    let jdkFromPath = jdkPaths[idxs[opts.arch]]
    let jdkToPath = path.join(to, 'openjdk')
    fs.emptyDir(jdkToPath, emptyError => {
      if (emptyError) return reject(emptyError)
      console.log(`moving jdk ${jdkFromPath} to ${jdkToPath}`)
      fs.copy(jdkFromPath, jdkToPath, {clobber: true}, (jdkError) => {
        if (jdkError) return reject(jdkError)
        console.log('success in moving jdk!')
        console.log(`moving memgator ${memgatorFromPath} to ${memgatorToPath}`)
        fs.remove(memgatorToPath, removeError => {
          if (removeError) return reject(removeError)
          fs.copy(memgatorFromPath, memgatorToPath, {clobber: true}, (memgatorError) => {
            if (memgatorError) return reject(memgatorError)
            shelljs.chmod('777', memgatorToPath)
            console.log('success in moving memgator!')
            resolve()
          })
        })
      })
    })
  })
}


function moveThem (opts, cb) {
  if (!opts) {
    opts = {
      arch: currentOSArch,
      to: bapps
    }
  }
  let to = opts.to
  let memgatorFromPath = memgatorPaths[idxs[opts.arch]]
  let memgatorToPath = path.join(to, memgatorNames[idxs[opts.arch]])
  let jdkFromPath = jdkPaths[idxs[opts.arch]]
  let jdkToPath = path.join(to, 'openjdk')
  fs.emptyDirSync(jdkToPath)
  console.log(`moving jdk ${jdkFromPath} to ${jdkToPath}`)
  fs.copy(jdkFromPath, jdkToPath, {clobber: true}, (jdkError) => {
    if (jdkError) return console.error(jdkError)
    console.log('success in moving jdk!')
    console.log(`moving memgator ${memgatorFromPath} to ${memgatorToPath}`)
    fs.removeSync(memgatorToPath)
    fs.copy(memgatorFromPath, memgatorToPath, {clobber: true}, (memgatorError) => {
      if (memgatorError) return console.error(memgatorError)
      shelljs.chmod('777', memgatorToPath)
      console.log('success in moving memgator!')
      if (cb) {
        cb()
      }
    })
  })
}

module.exports = {
  moveThem,
  moveThemP
}