const webpack = require('webpack')
const path = require('path')
const pkg = require('../package.json')
const electronCfg = require('../webpackConfigs/test/webpack.config.electron')
const coreCfg = require('../webpackConfigs/test/webpack.config.production')
const uiCfg = require('../webpackConfigs/test/webpack.config.ui')
const Promise = require('bluebird')
const cp = require('child_process')

const build = cfg => new Promise((resolve, reject) => {
  webpack(cfg, (err, stats) => {
    if (err) return reject(err)
    resolve(stats)
  })
})

const doBuild = async () => {
  console.log('Building WAIL for testing')
  console.log('Setting up WAIL Electron main for testing')
  const mainStats = await build(electronCfg)
  console.log(mainStats)
  console.log('Setting up WAIL Core for testing')
  const coreStats = await build(coreCfg)
  console.log(coreStats)
  console.log('Setting up WAIL UI for testing')
  const uiStats = await build(uiCfg)
  console.log(uiStats)
  cp.exec('cp dist/*.js /home/john/my-fork-wail/release/WAIL-linux-x64/resources/app/dist', (err, stdout, stderr) => {
    console.log(err, stderr, stdout)
    console.log('Done Test Away')
  })
}

doBuild()
