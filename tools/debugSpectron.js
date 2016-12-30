const Application = require('spectron').Application
const path = require('path')
const util = require('util')
const _ = require('lodash')
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

let fullLoadTo
console.log(wailApp.getSettings())
wailApp.start()
  .then(async () => {
    console.log('running app')
    await wailApp.client.waitUntilWindowLoaded()

    const beforeLoadCount = await wailApp.client.getWindowCount()
    // exspected 2
    console.log(`initial open windows ${beforeLoadCount}`)

    // switch to wail-ui window
    await wailApp.client.windowByIndex(1)

    const afterLoadCount = await Promise.delay(3000).then(async () => await wailApp.client.getWindowCount())
    // exspected 4
    console.log(`after full load window count ${afterLoadCount}`)

    const title = await wailApp.webContents.getTitle()
    // exspected Web Archiving Integration Layer
    console.log(`the current windows title is ${title}`)

    // exspected {open: false, location: 'WAIL'}
    let {value} = await wailApp.client.execute(function () {
      return window.___header.curState()
    })
    const {location, open} = value
    console.log(`after loading the header is open? ${open} and we are at ${location}`)
    // wailApp.webContents.executeJavaScript('', false)
    //   .then((result) => {
    //     console.log(result)
    //   }, (err) => console.error(err))
    // console.log(`after loading the header is open? ${open} and we are at ${location}`)

    // let ussText = await wailApp.client.getText('#UIStateStep')
    // console.log(ussText)
    // console.log(await wailApp.client.getText('#UIStateStep'))
    // count = await wailApp.client.getWindowCount()
    // console.log(`open windows ${count}`)

    // console.log(inspect(wailApp.electron))
    // .ipcMain.on('loading-finished', (e, loadState) => {
    //   console.log('got intial load')
    //   console.log(inspect(loadState))
    // })
  })
  .catch((error) => {
    console.error(error)
    wailApp.stop()
  })

