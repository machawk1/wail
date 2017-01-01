import { Application } from 'spectron'
import Promise from 'bluebird'
import path from 'path'
import fs from 'fs-extra'
import { PNG } from 'pngjs'
import loadSettings from './loadSettings'

const screenShotBasePath = path.join(process.cwd(), 'tests', 'screenshots')

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

const readFile = fpath => new Promise((resolve, reject) => {
  fs.readFile(fpath, (err, data) => {
    if (err) {
      resolve(Buffer.alloc(0))
    } else {
      resolve(data)
    }
  })
})

const compareScreenShots = (act, expt) => {
  fs.writeFileSync('/home/john/my-fork-wail/tests/screenshots/linux/archiveConfig2.png', expt)
  // thank you https://github.com/feross/webtorrent-desktop/blob/master/test/setup.js#L109
  if (Buffer.compare(act, expt) === 0) {
    return true
  }
  let sumSquareDiff = 0
  let numDiff = 0
  const pngA = PNG.sync.read(act)
  const pngE = PNG.sync.read(expt)
  if (pngA.width !== pngE.width || pngA.height !== pngE.height) return false
  const w = pngA.width
  const h = pngE.height
  const da = pngA.data
  const de = pngE.data
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
      if (de[i + 3] === 0) continue // Skip transparent pixels
      const ca = (da[i] << 16) | (da[i + 1] << 8) | da[i + 2]
      const ce = (de[i] << 16) | (de[i + 1] << 8) | de[i + 2]
      if (ca === ce) continue

      // Add pixel diff to running sum
      // This is necessary on Windows, where rendering apparently isn't quite deterministic
      // and a few pixels in the screenshot will sometimes be off by 1. (Visually identical.)
      numDiff++
      sumSquareDiff += (da[i] - de[i]) * (da[i] - de[i])
      sumSquareDiff += (da[i + 1] - de[i + 1]) * (da[i + 1] - de[i + 1])
      sumSquareDiff += (da[i + 2] - de[i + 2]) * (da[i + 2] - de[i + 2])
    }
  }
  const rms = Math.sqrt(sumSquareDiff / (numDiff + 1))
  const l2Distance = Math.round(Math.sqrt(sumSquareDiff))
  console.log('screenshot diff l2 distance: ' + l2Distance + ', rms: ' + rms)
  return l2Distance < 5000 && rms < 101.0
}

export default class WailApp {
  constructor () {
    this._app = new Application({
      path: wailReleasePath(),
    })
    this._settings = null
  }

  start () {
    return this._app.start()
  }

  stop () {
    return this._app.stop()
  }

  click (where) {
    return this._app.client.click(where)
  }

  delayClick (where, dt) {
    return Promise.delay(dt).then(() => this._app.client.click(where))
  }

  async clickAndWait (where, dt) {
    await this._app.client.click(where)
    return Promise.delay(dt)
  }

  clickSeries (series) {
    return Promise.map(series, where => this._app.client.click(where), {concurrency: 1})
  }

  clickSeriesWDelay (series, dt) {
    return Promise.map(series,
      where => Promise.delay(dt).then(() => this._app.client.click(where)),
      {concurrency: 1}
    )
  }

  async takeScreenShotAndCompare (name) {
    const ssPath = path.join(screenShotBasePath, process.platform, `${name}.png`)
    let capture = await Promise.delay(1000).then(() => this._app.browserWindow.capturePage())
    return readFile(ssPath)
      .then(buf => compareScreenShots(buf, capture))
  }

  waitTillLoaded () {
    return this._app.client.waitUntilWindowLoaded()
  }

  windowCount () {
    return this._app.client.getWindowCount()
  }

  switchToWindow (idx) {
    return this._app.client.windowByIndex(idx)
  }

  windowTitle () {
    return this._app.webContents.getTitle()
  }

  async executeJs (toExecute) {
    let {value} = await this._app.client.execute(toExecute)
    return value
  }

  delayExecuteJs (dt, toExecute) {
    return Promise.delay(dt).then(async () => await this.executeJs(toExecute))
  }

  async executeJsAndWait (dt, toExecute) {
    let val = await this.executeJs(toExecute)
    return Promise.delay(dt).then(() => val)
  }

  afterLoadWinCount () {
    return Promise.delay(3000).then(async () => await this._app.client.getWindowCount())
  }

  loadSettings () {
    if (!this._settings) {
      this._settings = loadSettings()
    }
    return this._settings
  }

  setInputValue (who, value) {
    return this._app.client.setValue(who, value)
  }

  getInputValue (who) {
    return this._app.client.getValue(who)
  }

  getText (who) {
    return this._app.client.getText(who)
  }

  getTextWithDelay (who, dt) {
    return Promise.delay(dt).then(async () => await this._app.client.getText(who))
  }

  getUiLocationFromHeaderState () {
    return this.executeJs(function () {
      return window.___header.curState()
    })
  }

  getUiLocationFromReactRouter () {
    return this.executeJs(function () {
      return window.___getTrueLoc()
    })
  }

  getUiLoaction () {
    return this.executeJs(function () {
      return {
        header: window.___header.curState(),
        hist: window.___getTrueLoc()
      }
    })
  }

  async gotTo (where) {
    await this.executeJs(function () {
      return window.___header.toggle()
    })

    return this.delayClick(where, 2000)
  }

  get app () {
    return this._app
  }

  get settings () {
    return this._settings
  }
}

module.exports = WailApp
