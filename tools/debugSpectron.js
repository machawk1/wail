const Application = require('spectron').Application
const path = require('path')
const util = require('util')
const _ = require('lodash')
const fs = require('fs-extra')
const Promise = require('bluebird')

const inspect = _.partialRight(util.inspect, {depth: null, colors: true})

process.on('SIGTERM', () => {
  wailApp.stop()
  process.exit(0)
})

process.on('SIGINT', () => {
  wailApp.stop()
  process.exit(0)
})

process.once('SIGUSR2', () => {
  wailApp.stop()
  process.exit(0)
})

const wailReleasePath = () => {
  const plat = process.platform
  const cwd = process.cwd()
  const arch = process.arch
  if (plat === 'darwin') {
    return path.join(cwd, `release/WAIL-${plat}-${arch}/Contents/MacOS/WAIL`)
  } else {
    return path.join(cwd, `release/WAIL-${plat}-${arch}/WAIL`)
  }
}

const wailApp = new Application({
  path: wailReleasePath(),
  quitTimeout: 0,
  connectionRetryCount: 50,
  waitTimeout: 60000,
  startTimeout: 10000,
  chromeDriverLogPath: '/home/john/my-fork-wail/chromDLogs/logs.txt'
})

const executeJs = async (toExecute) => {
  let {value} = await wailApp.client.execute(toExecute)
  return value
}

console.log(wailApp.getSettings())
wailApp.start()
  .then(async () => {
    console.log('running app')
    await wailApp.client.waitUntilWindowLoaded()

    const beforeLoadCount = await wailApp.client.getWindowCount()
    // switch to wail-ui window
    await wailApp.client.windowByIndex(1)

    const afterLoadCount = await Promise.delay(3000).then(async () => await wailApp.client.getWindowCount())
    await wailApp.client.execute(function () {
      return window.___header.toggle()
    })
    await Promise.delay(2000).then(async () => await wailApp.client.click('#sidebarServices'))
    let rr = await executeJs(function () {
      return window.___getTrueLoc()
    })
    console.log(rr)
  })
  .catch((error) => {
    console.error(error)
    wailApp.stop()
  })

