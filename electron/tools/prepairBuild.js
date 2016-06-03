import 'babel-polyfill'
import fsreal from 'fs'
import gracefulFs from 'graceful-fs'
gracefulFs.gracefulify(fsreal)
import fs from 'fs-extra'
import Promise from 'bluebird'
Promise.promisifyAll(fs)
import path from 'path'
import ncp from 'ncp'


const buildPath = path.join(path.resolve('../'), 'electron/build')
const basePath = path.join(path.resolve('../'), 'electron/src')
const actions = path.join(basePath, 'js/actions')
const components = path.join(basePath, 'js/components')
const constants = path.join(basePath, 'js/constants')
const dispatchers = path.join(basePath, 'js/dispatchers')
const stores = path.join(basePath, 'js/stores')
const pub = path.join(basePath, 'public')
const app = path.join(buildPath, 'app')


console.log(basePath)
fs.ensureDir(app, err => console.log(err))

ncp(basePath, app, err => console.log(err))

// dirs.forEach(dir => fs.ensureDir(dir, err => console.log(dir)))

