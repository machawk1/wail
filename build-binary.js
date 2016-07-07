import fsreal from 'fs'
import gracefulFs from 'graceful-fs'
gracefulFs.gracefulify(fsreal)
import fs from 'fs-extra'
import Promise from 'bluebird'
Promise.promisifyAll(fs)
import path from 'path'
import os  from 'os'
import webpack  from 'webpack'
import electronCfg  from './webpack.config.electron.js'
import cfg  from './webpack.config.production.js'
import packager from 'electron-packager'
import del  from 'del'
import pkg  from './package.json'
import moveTo from "./tools/moveJDKMemgator"

fs.removeSync(path.join(path.resolve('.'), 'dist'))

const exec = require('child_process').exec
const argv = require('minimist')(process.argv.slice(2))

const currentOSArch = `${os.platform()}${os.arch()}`
const basePath = path.join(path.resolve('.'), 'bundledApps')

const deps = Object.keys(pkg.dependencies)
const devDeps = Object.keys(pkg.devDependencies)

const appName = 'wail'
const shouldUseAsar = argv.asar || argv.a || false
const shouldBuildAll = argv.all || false
const shouldBuildWindows = argv.win || false
const shouldBuildOSX = argv.osx || false
const shouldBuildLinux = argv.linux || false

console.log(argv)

const DEFAULT_OPTS = {
  dir: '.',
  name: appName,
  asar: shouldUseAsar,
  ignore: [
    '^/.idea($|/)',
    '^/archives/',
    '^/archiveIndexes/',
    '^/bundledApps/heritrix-3.2.0/jobs/',
    '^/bundledApps/memgator($|/)',
    '^/bundledApps/openjdk($|/)',
    '^/electron-main-dev.js',
    '^/test($|/)',
    '^/tools($|/)',
    '^/newbinaries($|/)',
    '^/memgators($|/)',
    '^/release($|/)',
    '^/waillogs($|/)',
    '^/zips($|/)',
  ].concat(devDeps.map(name => `/node_modules/${name}($|/)`))
    .concat(
      deps.filter(name => !electronCfg.externals.includes(name))
        .map(name => `/node_modules/${name}($|/)`)
    )
}

const icon = argv.icon || argv.i || 'app/app'

if (icon) {
  DEFAULT_OPTS.icon = icon
}

const version = argv.version || argv.v

if (version) {
  DEFAULT_OPTS.version = version
  startPack()
} else {
  // use the same version as the currently-installed electron-prebuilt
  exec('npm list electron-prebuilt --dev', (err, stdout) => {
    if (err) {
      DEFAULT_OPTS.version = '1.2.5'
    } else {
      DEFAULT_OPTS.version = stdout.split('electron-prebuilt@')[ 1 ].replace(/\s/g, '')
    }

    startPack()
  })
}

function build (cfg) {
  return new Promise((resolve, reject) => {
    webpack(cfg, (err, stats) => {
      if (err) return reject(err)
      resolve(stats)
    })
  })
}

function startPack () {
  console.log('building webpack.config.electron')
  build(electronCfg)
    .then((stats) => {
      console.log('building webpack.config.production')
      build(cfg)
    })
    .then((stats) => {
      console.log("removing previous builds")
      del.sync('release')
    })
    .then(paths => {
      if (shouldBuildAll) {
        // build for all platforms
        console.log("building for all platforms")
        let archs = [ 'ia32', 'x64' ]
        let platforms = [ 'linux', 'win32', 'darwin' ]

        platforms.forEach(plat => {
          archs.forEach(arch => {
            console.log(`build the binary for ${plat}-${arch}`)
            pack(plat, arch, log(plat, arch))
          })
        })
      } else {

        if (shouldBuildLinux) {
          console.log("building for linux")
          let archs = [ 'ia32', 'x64' ]
          let platforms = [ 'linux', ]

          platforms.forEach(plat => {
            archs.forEach(arch => {
              console.log(`build the binary for ${plat}-${arch}`)
              pack(plat, arch, log(plat, arch))
            })
          })
        } else if (shouldBuildOSX) {
          console.log("building for OSX")
          let archs = [ 'x64' ]
          let platforms = [ 'darwin', ]

          platforms.forEach(plat => {
            archs.forEach(arch => {
              console.log(`build the binary for ${plat}-${arch}`)
              pack(plat, arch, log(plat, arch))
            })
          })
        } else if (shouldBuildWindows) {
          console.log("building for Windows")
          let archs = [ 'ia32', 'x64' ]
          let platforms = [ 'win32' ]

          platforms.forEach(plat => {
            archs.forEach(arch => {
              console.log(`build the binary for ${plat}-${arch}`)
              pack(plat, arch, log(plat, arch))
            })
          })
        } else {
          console.log(`build the binary for ${os.platform()}-${os.arch()}`)
          pack(os.platform(), os.arch(), log(os.platform(), os.arch()))
        }

      }
    })
    .catch(err => {
      console.error(err)
    })
}

function pack (plat, arch, cb) {
  // there is no darwin ia32 electron
  if (plat === 'darwin' && arch === 'ia32') return

  const iconObj = {
    icon: DEFAULT_OPTS.icon + (() => {
      let extension = '.png'
      if (plat === 'darwin') {
        extension = '.icns'
      } else if (plat === 'win32') {
        extension = '.ico'
      }
      return extension
    })()
  }

  const opts = Object.assign({}, DEFAULT_OPTS, iconObj, {
    platform: plat,
    arch,
    prune: true,
    'app-version': pkg.version || DEFAULT_OPTS.version,
    out: `release/${plat}-${arch}`
  })

  packager(opts, cb)
}

function log (plat, arch) {
  return (err, filepath) => {
    if (err) return console.error(err)
    let moveTop
    if(plat === 'darwin') {
      moveTop = `release/${plat}-${arch}/wail-${plat}-${arch}/wail.app/Contents/Resources/app/bundledApps`
    } else {
      moveTop = `release/${plat}-${arch}/wail-${plat}-${arch}/resources/app/bundledApps`
    }
    let realsePath = path.join(path.resolve('.'), moveTop)
    moveTo({arch: `${plat}${arch}`,to: realsePath})
    console.log(`${plat}-${arch} finished!`)
  }
}