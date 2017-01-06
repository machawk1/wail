import fs from 'fs-extra'
import Promise from 'bluebird'
import cp from 'child_process'
import path from 'path'
import os from 'os'
import del from 'del'
import _ from 'lodash'
import webpack from 'webpack'
import electronCfg from './webpackConfigs/ui/webpack.config.electron.js'
import cfgUI from './webpackConfigs/ui/webpack.config.production.js'
import cfgCore from './webpackConfigs/core/webpack.config.production.js'
import packager from 'electron-packager'
import pkg from './package.json'
import moveTo from './tools/moveJDKMemgator'
Promise.promisifyAll(fs)

const argv = require('minimist')(process.argv.slice(2))
const cwd = path.resolve('.')
fs.emptyDirSync(path.join(cwd, 'dist'))
const iconPath = path.normalize(path.join(cwd, 'build/icons/whale.ico'))

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
const shouldBuildWithExtra = argv.we || false
const shouldBuildCurrent = !shouldBuildAll && !shouldBuildLinux && !shouldBuildOSX && !shouldBuildWindows

// /Users/jberlin/WebstormProjects/wail/archives/collections/Wail/archive
const ignore = [
  '^/archiveIndexes($|/)',
  '^/archives2($|/)',
  '^/.babelrc($|/)',
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
  '^/bundledApps/openjdk($|/)',
  '^/bundledApps/wailpy($|/)',
  '^/bundledApps/tomcat($|/)',
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
  'app-copyright':  'Copyright © 2016-2017 Web Science And Digital Libraries Research Group ODU CS',
  'app-version': pkg.version,
  asar: false,
  prune: true,
  dir: cwd,
  name: pkg.name,
  ignore,
  overwrite: true,
  out: path.normalize(path.join(cwd, 'release')),
  version: require('electron/package.json').version
}

// OSX
const darwinSpecificOpts = {

  'app-bundle-id': 'wsdl.cs.odu.edu.wail',

  // The application category type, as shown in the Finder via 'View' -> 'Arrange by
  // Application Category' when viewing the Applications directory (OS X only).
  'app-category-type': 'public.app-category.utilities',

  // // The bundle identifier to use in the application helper's plist (OS X only).
  'helper-bundle-id': 'wsdl.wail.cs.odu.edu-helper',

  'extend-info': darwinBuild.extendPlist,

  'extra-resource': [ darwinBuild.archiveIconPath, darwinBuild.iconPath ],

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

function build (cfg) {
  return new Promise((resolve, reject) => {
    webpack(cfg, (err, stats) => {
      if (err) return reject(err)
      resolve(stats)
    })
  })
}

function pack (plat, arch, cb) {
  // there is no darwin ia32 electron
  if (plat === 'darwin' && arch === 'ia32') return

  let opts
  if (plat === 'darwin') {
    opts = Object.assign({}, DEFAULT_OPTS, darwinSpecificOpts, {
      platform: plat,
      arch
    })
  } else if (plat === 'win32') {
    opts = Object.assign({}, DEFAULT_OPTS, windowsSpecificOpts, {
      platform: plat,
      arch
    })
  } else {
    /* linux */
    opts = Object.assign({}, DEFAULT_OPTS, linuxSpecificOpts, {
      platform: plat,
      arch
    })
  }

  packager(opts, cb)
}

function createDMG (appPath, cb) {
  let _createDMG = require('electron-installer-dmg')
  let out = path.normalize(path.join(cwd, 'release/wail-darwin-dmg'))
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
      console.error('There was an error in creating the dmg file', error)
    } else {
      if (cb) {
        cb()
      }
    }
  })
}

function createWindowsInstallers (plat, arch, cb) {
  let winInstaller = require('electron-winstaller')
  let outputDirectory = path.normalize(path.join(cwd, `release/wail-${plat}-${arch}-installer`))
  fs.emptyDirSync(outputDirectory)
  let winInstallerOpts = {
    appDirectory: path.normalize(path.join(cwd, `release/wail-${plat}-${arch}`)),
    authors: pkg.contributors,
    description: pkg.description,
    exe: `${DEFAULT_OPTS.name}.exe`,
    iconUrl: iconPath,
    loadingGif: path.normalize(path.join(cwd, 'buildResources/winLinux/mLogo_animated.gif')),
    name: DEFAULT_OPTS.name,
    noMsi: true,
    outputDirectory,
    productName: DEFAULT_OPTS.name,
    setupExe: `${DEFAULT_OPTS.name}Setup.exe`,
    setupIcon: iconPath,
    title: DEFAULT_OPTS.name,
    usePackageJson: false,
    version: pkg.version
  }

  console.log(`Creating windows installer for ${arch}. This could take some time`)
  winInstaller.createWindowsInstaller(winInstallerOpts)
    .then(() => cb())
    .catch(error => console.error(`There was an error in creating the windows installer for ${arch}`, error))
}

function createDeb_redHat (arc, cb) {
  let deb = require('electron-installer-debian')
  let deb2 = require('nobin-debian-installer')
  let redHat = require('electron-installer-redhat')
  let arch = arc === 'x64' ? 'amd64' : 'i386'
  let debOptions = {
    name: DEFAULT_OPTS.name,
    productName: DEFAULT_OPTS.name,
    genericName: DEFAULT_OPTS.name,
    maintainer: 'John Berlin(jberlin@cs.odu.edu)',
    arch,
    productDescription: pkg.description,
    src: `release/wail-linux-${arc}`,
    dest: 'release/installers/',
    version: pkg.version,
    revision: pkg.revision,
    icon: {
      '32x32': path.normalize(path.join(cwd, 'build/icons/whale_32.png')),
      '64x64': path.normalize(path.join(cwd, 'build/icons/whale_64.png')),
      '128x128': path.normalize(path.join(cwd, 'build/icons/whale_128.png')),
      '256x256': path.normalize(path.join(cwd, 'build/icons/whale_256.png'))
    },
    section: 'utils',
    depends: [
      'gconf2',
      'libxss1',
      'gconf-service',
      'gvfs-bin',
      'libc6',
      'libcap2',
      'libgtk2.0-0',
      'libudev0 | libudev1',
      'libgcrypt11 | libgcrypt20',
      'libnotify4',
      'libnss3',
      'libxtst6',
      'python',
      'xdg-utils'
    ],
    recommends: [
      'lsb-release'
    ],
    suggests: [
      'gir1.2-gnomekeyring-1.0',
      'libgnome-keyring0'
    ],
    lintianOverrides: [
      'changelog-file-missing-in-native-package'
    ]
  }

  let redOpts = {
    name: DEFAULT_OPTS.name,
    productName: DEFAULT_OPTS.name,
    genericName: DEFAULT_OPTS.name,
    maintainer: 'John Berlin(jberlin@cs.odu.edu)',
    arch,
    productDescription: pkg.description,
    src: `release/wail-linux-${arc}`,
    dest: 'release/installers/',
    version: pkg.version,
    revision: pkg.revision,
    icon: {
      '32x32': path.normalize(path.join(cwd, 'build/icons/whale_32.png')),
      '64x64': path.normalize(path.join(cwd, 'build/icons/whale_64.png')),
      '128x128': path.normalize(path.join(cwd, 'build/icons/whale_128.png')),
      '256x256': path.normalize(path.join(cwd, 'build/icons/whale_256.png'))
    },
    description: pkg.description,
    license: pkg.license,

    group: undefined,
    requires: [
      'lsb'
    ],
    bin: pkg.name,
    categories: [
      'GNOME',
      'GTK',
      'Utility'
    ]
  }

  deb(debOptions, err => {
    if (err) {
      console.log(`There was an error in creating debian package for ${arc}`)
      console.log(`Attempting to create red-hat package for ${arc}`)
      console.error(err)
    } else {
      console.log(`Created debian package for ${arc}`)
      console.log(`Creating red-hat package for ${arc}`)
    }
    redHat(debOptions, rhErr => {
      if (err) {
        console.log(`There was an error in creating redHat package for ${arc}`)
        console.error(rhErr)
        cb()
      } else {
        console.log(`Created redHat package for ${arc}`)
      }
    })
  })
}

const log = (plat, arch) => (err, filepath) => {
  if (err) return console.error(err)
  let moveToPath
  let cb
  if (plat === 'darwin') {
    let appPath = `release/WAIL-${plat}-${arch}/WAIL.app`
    moveToPath = `${appPath}/Contents/Resources/app/bundledApps`
    let aIconPath = `${appPath}/Contents/Resources/${darwinBuild.archiveIcon}`
    cb = () => {
      // fs.copySync(darwinBuild.archiveIconPath, path.normalize(path.join(cwd, aIconPath)))
      if (process.platform === 'darwin') {
        console.log('Building dmg')
        createDMG(appPath, () => console.log(`${plat}-${arch} finished!`))
        // console.log(`${plat}-${arch} finished!`)
      } else {
        console.error(`Can not build dmg file on this operating system [${plat}-${arch}]. It must be done on OSX`)
        console.log(`${plat}-${arch} finished!`)
      }
    }
  } else {
    if (plat === 'win32') {
      cb = () => {
        console.log(`${plat}-${arch} finished!`)
        // createWindowsInstallers(plat, arch, () => console.log(`${plat}-${arch} finished!`))
      }
    } else {
      // cb = () => {
      //   createDeb_redHat(arch, () => console.log(`${plat}-${arch} finished!`))
      // }
      console.log(`${plat}-${arch} finished!`)
    }
    moveToPath = `release/WAIL-${plat}-${arch}/resources/app/bundledApps`
  }
  let releasePath = path.normalize(path.join(cwd, moveToPath))
  moveTo({ arch: `${plat}${arch}`, to: releasePath }, cb)
}

const doBuild = () => {
  console.log('Building WAIL')
  return new Promise((resolve, reject) => {
    console.log('Transpiling and Creating Single File WAIL-Electron-Main')
    build(electronCfg)
      .then((stats) => {
        console.log('Transpiling and Creating Single File WAIL-UI')
        return build(cfgUI)
          .then((nstats) => {
            console.log('Transpiling and Creating Single File WAIL-Core')
            return build(cfgCore)
              .then((nnstats) => {
                return del('release')
                  .then((paths) => {
                    if (shouldBuildCurrent) {
                      console.log(`building the binary for ${os.platform()}-${os.arch()}`)
                      pack(os.platform(), os.arch(), log(os.platform(), os.arch()))
                    } else {
                      let buildFor
                      let archs
                      let platforms
                      if (shouldBuildAll) {
                        buildFor = 'building for all platforms'
                        archs = [ 'ia32', 'x64' ]
                        platforms = [ 'linux', 'win32', 'darwin' ]
                      } else if (shouldBuildLinux) {
                        buildFor = 'building for linux'
                        archs = [ 'ia32', 'x64' ]
                        platforms = [ 'linux' ]
                      } else if (shouldBuildOSX) {
                        buildFor = 'building for OSX'
                        archs = [ 'x64' ]
                        platforms = [ 'darwin' ]
                      } else {
                        buildFor = 'building for Windows'
                        archs = [ 'ia32', 'x64' ]
                        platforms = [ 'win32' ]
                      }
                      console.log(buildFor)
                      platforms.forEach(plat => {
                        archs.forEach(arch => {
                          console.log(`building the binary for ${plat}-${arch}`)
                          pack(plat, arch, log(plat, arch))
                        })
                      })
                    }
                    resolve()
                  })
                  .catch(error => {
                    console.error('del', error)
                    reject(error)
                  })
              }).catch(error => {
                console.error('building core', error)
                reject(error)
              })
          }).catch(error => {
            console.error('building ui', error)
            reject(error)
          })
      }).catch(error => {
      console.error('building electron main', error)
      reject(error)
    })
  })
}

doBuild()
  .then(() => {

  })
  .catch(error => {
    console.error('failed', error)
  })
