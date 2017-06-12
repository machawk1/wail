import * as fs from 'fs-extra'
import Promise from 'bluebird'
import path from 'path'
import os from 'os'
import webpack from 'webpack'
import zip from 'cross-zip'
import electronCfg from './webpackConfigs/ui/webpack.config.electron.js'
import cfgUI from './webpackConfigs/ui/webpack.config.production.js'
import cfgCore from './webpackConfigs/core/webpack.config.production.js'
import packager from 'electron-packager'
import pkg from './package.json'
import cp from 'child_process'
import { moveThemP } from './tools/moveJDKMemgator'

const argv = require('minimist')(process.argv.slice(2))
const cwd = process.cwd()
const iconPath = path.normalize(path.join(cwd, 'build/icons/whale.ico'))
//fs.emptyDirSync(path.join(cwd, 'dist'))

const darwinBuild = {
  icon: 'whale.icns',
  iconPath: path.normalize(path.join(cwd, 'buildResources/osx/whale.icns')),
  archiveIcon: 'archive.icns',
  archiveIconPath: path.normalize(path.join(cwd, 'buildResources/osx/archive.icns')),
  extendPlist: path.normalize(path.join(cwd, 'buildResources/osx/Extended-Info.plist'))
}

const deps = Object.keys(pkg.dependencies)
const devDeps = Object.keys(pkg.devDependencies)

const shouldBuildAll = argv.all || false
const shouldBuildWindows = argv.win || false
const shouldBuildOSX = argv.osx || false
const shouldBuildLinux = argv.linux || false
const shouldBuildCurrent = !shouldBuildAll && !shouldBuildLinux && !shouldBuildOSX && !shouldBuildWindows

// /Users/jberlin/WebstormProjects/wail/archives/collections/Wail/archive
const ignore = [
  '^/archiveIndexes($|/)',
  '^/archives2($|/)',
  '^/.babelrc($|/)',
  '^/node_modules/.cache($|/)',
  '^/.babelrc2($|/)',
  '^/.babelrc.bk($|/)',
  '^/.gitattributes$',
  '^/depDifWinRest.txt$',
  '^/build($|/)',
  '^/build-binary.js$',
  '^/build-binary-old.js$',
  '^/bundledApps/heritrix/heritrix_out.log$',
  '^/bundledApps/heritrix/adhoc.keystore$',
  '^/bundledApps/heritrix/heritrix.pid$',
  '^/bundledApps/heritrix/jobs/',
  '^/bundledApps/memgator($|/)',
  '^/bundledApps/old($|/)',
  '^/bundledApps/bk($|/)',
  '^/bundledApps/openjdk($|/)',
  '^/bundledApps/wailpy($|/)',
  '^/bundledApps/tomcat($|/)',
  '^/bundledApps/pywb_($|/)',
  '^/.codeclimate.yml($|/)',
  '^/crawler-beans_bk.cxml$',
  '^/dev_coreData',
  '^/coreData($|/)',
  '^/doElectron.sh$',
  '^/wail-core_old($|/)',
  '^/bootstrap.sh$',
  '^/npm-debug.log.*$',
  '^/tests($|/)',
  '^/chromDLogs($|/)',
  '^/electron-main-dev.js$',
  '^/.gitignore($|/)',
  '^/.idea($|/)',
  '^/images($|/)',
  '^/memgators($|/)',
  '^/newbinaries($|/)',
  '^/README.md$',
  '^/release($|/)',
  '^/requirements.txt$',
  '^/test($|/)',
  '^/tools($|/)',
  '^/waillogs($|/)',
  '^/webpack.config.*$',
  '^/webpackConfigs($|/)$',
  '^/buildResources($|/)$',
  '^/sharedUtil($|/)$',
  '^/wail_utils($|/)$',
  '^/wail-core_old($|/)$',
  '^/wail-config($|/)$',
  '^/bundledApps/pywb_old($|/)$',
  '^/support($|/)$',
  '^/temp($|/)$',
  '^/yarn.lock$',
  '^/zips($|/)'
].concat(devDeps.map(name => `/node_modules/${name}($|/)`))
  .concat(
    deps.filter(name => !electronCfg.externals.includes(name))
      .filter(name => !cfgUI.externals.includes(name))
      .map(name => `/node_modules/${name}($|/)`)
  )

const DEFAULT_OPTS = {
  appCopyright: 'Copyright © 2016-2017 Web Science And Digital Libraries Research Group ODU CS',
  appVersion: pkg.version,
  asar: false,
  prune: true,
  dir: cwd,
  name: pkg.name,
  ignore,
  overwrite: true,
  out: path.normalize(path.join(cwd, 'release')),
  electronVersion: require('electron/package.json').version
}

// OSX
const darwinSpecificOpts = {

  'appBundleId': 'wsdl.cs.odu.edu.wail',

  // The application category type, as shown in the Finder via 'View' -> 'Arrange by
  // Application Category' when viewing the Applications directory (OS X only).
  'appCategoryType': 'public.app-category.utilities',

  // // The bundle identifier to use in the application helper's plist (OS X only).
  'helperBundleId': 'wsdl.wail.cs.odu.edu-helper',

  'extraResource': [darwinBuild.archiveIconPath, darwinBuild.iconPath],

  // Application icon.
  icon: darwinBuild.iconPath
}

const windowsSpecificOpts = {
  win32metadata: {

    // Company that produced the file.
    CompanyName: 'wsdl.cs.odu.edu',

    // Name of the program, displayed to users
    FileDescription: pkg.name,

    // Original name of the file, not including a path. This information enables an
    // application to determine whether a file has been renamed by a user. The format of
    // the name depends on the file system for which the file was created.
    OriginalFilename: `${pkg.name}.exe`,

    // Name of the product with which the file is distributed.
    ProductName: pkg.name,

    // Internal name of the file, if one exists, for example, a module name if the file
    // is a dynamic-link library. If the file has no internal name, this string should be
    // the original filename, without extension. This string is required.
    InternalName: pkg.name
  },

  // Application icon.
  icon: iconPath
}

const linuxSpecificOpts = {
  icon: path.normalize(path.join(cwd, 'buildResources/linux/icon.png'))
}

function emptyRelease () {
  return new Promise((resolve, reject) => {
    fs.emptyDir(path.join(cwd, 'release'), error => {
      if (error) {
        reject(error)
      } else {
        resolve()
      }
    })
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

function zipUp (inPath, outPath) {
  return new Promise((resolve, reject) => {
    zip.zip(inPath, outPath, (error) => {
      if (error) {
        reject(error)
      } else {
        resolve()
      }
    })
  })
}

function packWindows (platform, arch) {
  return new Promise((resolve, reject) => {
    let opts = Object.assign({}, DEFAULT_OPTS, windowsSpecificOpts, {platform, arch})
    packager(opts, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

function packDarwin (platform, arch) {
  return new Promise((resolve, reject) => {
    let opts = Object.assign({}, DEFAULT_OPTS, darwinSpecificOpts, {platform, arch})
    packager(opts, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

function makeDMG (appPath) {
  return new Promise((resolve, reject) => {
    let _createDMG = require('electron-installer-dmg')
    let out = path.join(cwd, 'release', 'wail-darwin-dmg')
    fs.emptyDirSync(out)
    let dmgOpts = {
      appPath,
      debug: true,
      name: DEFAULT_OPTS.name,
      icon: darwinSpecificOpts.icon,
      overwrite: true,
      out
    }
    _createDMG(dmgOpts, error => {
      if (error) {
        reject(error)
      } else {
        resolve()
      }
    })
  })
}

function packLinux (platform, arch) {
  return new Promise((resolve, reject) => {
    let opts = Object.assign({}, DEFAULT_OPTS, linuxSpecificOpts, {platform, arch})
    packager(opts, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

async function darwinDoBuild (platform, arch) {
  if (arch === 'ia32') return
  console.log(`building the binary for ${platform}-${arch}`)
  let packagedPath = path.join(cwd, 'release', `WAIL-${platform}-${arch}`)
  let appPath = `${packagedPath}/WAIL.app`
  let moveToPath = `${appPath}/Contents/Resources/app/bundledApps`
  await packDarwin(platform, arch)
  await moveThemP({arch: `${platform}${arch}`, to: moveToPath})
  console.log('Building dmg')
  await makeDMG(appPath)
  console.log(`zipping up the release for ${platform}-${arch}`)
  await zipUp(appPath, `${packagedPath}.zip`)
  console.log(`${platform}-${arch} finished!`)
}

async function linuxDoBuild (platform, arch) {
  console.log(`building the binary for ${platform}-${arch}`)
  let packagedPath = path.join(cwd, `release/WAIL-${platform}-${arch}`)
  let moveToPath = `${packagedPath}/resources/app/bundledApps`
  await packLinux(platform, arch)
  await moveThemP({arch: `${platform}${arch}`, to: moveToPath})
  console.log(`zipping up the release for ${platform}-${arch}`)
  await zipUp(packagedPath, `${packagedPath}.zip`)
  console.log(`${platform}-${arch} finished!`)
}

async function windowsDoBuild (platform, arch) {
  console.log(`building the binary for ${platform}-${arch}`)
  let packagedPath = path.join(cwd, 'release', `WAIL-${platform}-${arch}`)
  let moveToPath = path.join(packagedPath, 'resources', 'app', 'bundledApps')
  await packWindows(platform, arch)
  await moveThemP({arch: `${platform}${arch}`, to: moveToPath})
  console.log(`zipping up the release for ${platform}-${arch}`)
  await zipUp(packagedPath, `${packagedPath}.zip`)
  console.log(`${platform}-${arch} finished!`)
}

async function buildForPlatArch (plats, archs) {
  let i = 0
  let plen = plats.length
  let alen = archs.length
  for (; i < plen; ++i) {
    let plat = plats[i]
    let j = 0
    for (; j < alen; ++j) {
      let arch = archs[j]
      if (plat === 'darwin') {
        await darwinDoBuild(plat, arch)
      } else if (plat === 'linux') {
        await linuxDoBuild(plat, arch)
      } else {
        await windowsDoBuild(plat, arch)
      }
    }
  }
}

async function doBuild () {
  console.log('Building WAIL')
  console.log('Transpiling and Creating Single File WAIL-Electron-Main')
//  await build(electronCfg)
  console.log('Transpiling and Creating Single File WAIL-UI')
//  await build(cfgUI)
  console.log('Transpiling and Creating Single File WAIL-Core')
//  await build(cfgCore)
  console.log('cleaning previous releases')
//  await emptyRelease()
  if (shouldBuildCurrent) {
    const thePlat = os.platform()
    if (thePlat === 'darwin') {
      await darwinDoBuild(thePlat, os.arch())
    } else if (thePlat === 'linux') {
      await linuxDoBuild(thePlat, os.arch())
    } else {
      await windowsDoBuild(thePlat, os.arch())
    }
  } else {
    let archs
    let platforms
    if (shouldBuildAll) {
      archs = ['ia32', 'x64']
      platforms = ['linux', 'win32', 'darwin']
    } else if (shouldBuildLinux) {
      archs = ['ia32', 'x64']
      platforms = ['linux']
    } else if (shouldBuildOSX) {
      archs = ['x64']
      platforms = ['darwin']
    } else {
      archs = ['ia32', 'x64']
      platforms = ['win32']
    }
    await buildForPlatArch(platforms, archs)
  }
}

doBuild()
  .then(() => {
    console.log('done')
  })
  .catch(error => {
    console.error('failed', error)
  })
