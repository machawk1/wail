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

const exec = require('child_process').exec
const argv = require('minimist')(process.argv.slice(2))

const cwd = path.resolve('.')
const currentOSArch = `${os.platform()}${os.arch()}`
const bApps = path.join(cwd, 'bundledApps')


const iconPath = path.normalize(path.join(cwd, 'build/icons/whale.ico'))

const darwinBuild = {
  iconPath:  path.normalize(path.join(cwd, 'buildResources/osx/whale_1024.icns')),
  archiveIconPath:  path.normalize(path.join(cwd, 'buildResources/osx/archive.icns')),
  extendPlist: path.normalize(path.join(cwd, 'buildResources/osx/Extended-Info.plist')),
}


const deps = Object.keys(pkg.dependencies)
const devDeps = Object.keys(pkg.devDependencies)

const shouldBuildAll = argv.all || false
const shouldBuildWindows = argv.win || false
const shouldBuildOSX = argv.osx || false
const shouldBuildLinux = argv.linux || false

const ignoreThese = [
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

const DEFAULT_OPTS = {
  'app-version': pkg.version,
  asar: false,
  dir: cwd,
  name: pkg.name,
  ignore: ignoreThese,
  overwrite: true,
  prune: true,
  version: require('electron-prebuilt/package.json').version
}

//OSX
const darwinSpecificOpts = {

  'app-bundle-id': 'wail.cs.odu.edu',

  // The application category type, as shown in the Finder via "View" -> "Arrange by
  // Application Category" when viewing the Applications directory (OS X only).
  'app-category-type': 'public.app-category.utilities',

  // The bundle identifier to use in the application helper's plist (OS X only).
  'helper-bundle-id': 'wail.cs.odu.edu-helper',

  // Application icon.
  icon: darwinBuild.iconPath
}

const windowsSpecificOpts = {
  'version-string': {

    // Company that produced the file.
    CompanyName: pkg.name,

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

fs.removeSync(path.join(path.resolve('.'), 'dist'))
