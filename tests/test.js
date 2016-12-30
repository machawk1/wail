const path = require('path')
const Promise = require('bluebird')
const test = require('ava')
const Application = require('spectron').Application

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

test.beforeEach(async t => {
  t.context.app = new Application({
    path: wailReleasePath(),
  })
  await t.context.app.start()
})

test.afterEach.always('cleanup', async t => {
  await t.context.app.stop()
})

test('wail loads properly', async t => {
  const wailApp = t.context.app

  await wailApp.client.waitUntilWindowLoaded()

  t.is(await wailApp.client.getWindowCount(), 2, 'at first start there should only be two windows')

  // switch to wail-ui window
  await wailApp.client.windowByIndex(1)

  const afterLoadWinCount = () => Promise.delay(3000).then(async () => await wailApp.client.getWindowCount())
  t.is(await afterLoadWinCount(), 4, 'after fully loading there should only be four windows')

  const expectedTitle = 'Web Archiving Integration Layer'
  t.is(await wailApp.webContents.getTitle(), expectedTitle, 'the title of the main window should be the expansion of WAIL')

  const uiStateLocation = async () => {
    let {value} = await wailApp.client.execute(function () {
      return window.___header.curState()
    })
    return value
  }
  const expectedUiLoc = {open: false, location: 'WAIL'}
  t.deepEqual(await uiStateLocation(), expectedUiLoc, 'the ui should be at WAIL and side bar not open')
})
