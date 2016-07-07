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

const currentOSArch = `${os.platform()}${os.arch()}`
const basePath = path.join(path.resolve('.'), 'bundledApps')

const deps = Object.keys(pkg.dependencies)
const devDeps = Object.keys(pkg.devDependencies)

const shouldUseAsar = argv.asar || argv.a || false
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
  asar: shouldUseAsar,
  dir: '.',
  name: pkg.name,
  ignore: ignoreThese,
  overwrite: true,
  prune: true,
  version: require('electron-prebuilt/package.json').version
}

//OSX
const darwinSpecificOpts = {

  'app-bundle-id': 'wail.cs.odu',

  // The application category type, as shown in the Finder via "View" -> "Arrange by
  // Application Category" when viewing the Applications directory (OS X only).
  'app-category-type': 'public.app-category.utilities',

  // The bundle identifier to use in the application helper's plist (OS X only).
  'helper-bundle-id': 'wail.cs.odu-helper',

  // Application icon.
  icon: config.APP_ICON + '.icns'
}

fs.removeSync(path.join(path.resolve('.'), 'dist'))
