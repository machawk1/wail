import test from 'ava'
import Promise from 'bluebird'
import _ from 'lodash'
import WailApp from './helpers/wailApp'
import DbChecker from './helpers/dbChecker'
import { startedCrawlNotifsExpected, startStopServicesExpected } from './helpers/exspectedUiValues'

let wailApp = null
let dbChecker = null

test.before('setup tests', async t => {
  if (!wailApp) {
    wailApp = new WailApp()
  }
  if (!dbChecker) {
    dbChecker = new DbChecker()
  }
  await wailApp.start()
})

test.after.always('cleanup after tests', async t => {
  await wailApp.stop()
})

test.serial('WAIL loads properly', async t => {
  await wailApp.waitTillLoaded()

  t.is(await wailApp.windowCount(), 2, 'at first start there should only be two windows')

  // switch to wail-ui window
  await wailApp.switchToWindow(1)

  t.is(await wailApp.afterLoadWinCount(), 4, 'after fully loading there should only be four windows')

  const expectedTitle = 'Web Archiving Integration Layer'
  t.is(await wailApp.windowTitle(), expectedTitle, 'the title of the main window should be the expansion of WAIL')

  const uiStateLocation = await wailApp.executeJs(function () {
    return window.___header.curState()
  })
  const expectedUiLoc = {open: false, location: 'WAIL'}
  t.deepEqual(uiStateLocation, expectedUiLoc, 'the ui should be at WAIL and side bar not open')
})

test.serial('WAIL started services on start', async t => {
  let dbPids = await dbChecker.readPids()
  if (dbPids.wasError || dbPids.empty) {
    let report = dbPids.wasError ? 'we hit a case not accounted for' : 'the pid db was empty'
    t.fail(report)
  }
  let hpid = dbPids.heritrix.pid, wpid = dbPids.wayback.pid
  t.true(dbChecker.isPidRunning(hpid), 'the pid for heritrix in the database should be tied to a running instance')
  t.true(dbChecker.isPidRunning(wpid), 'the pid for wayback in the database should be tied to a running instance')

  let {found, pid, isWails} = await dbChecker.determinIfSpawnedHeritrixIsWails()
  t.true(hpid == pid, 'the pid for heritrix in the database should match the pid retrieved by querying the local system')

  let waybackPTree = await dbChecker.getProcessTreeForPid(wpid)
  t.true(waybackPTree.length === 2, 'there should be two process associated with wayback')
})

test.serial('WAIL can start and stop a crawl', async t => {
  await wailApp.clickSeries(['#linkTo-default', '#addSeedFab'])
  await wailApp.setInputValue('#urlInput', 'http://example.com')
  t.is(await wailApp.getInputValue('#urlInput'), 'http://example.com', 'the uri-r must be http://example.com')

  await wailApp.clickSeriesWDelay(['#archiveConfig', '#ponly'], 1000)

  t.true(await wailApp.takeScreenShotAndCompare('archiveConfig'), 'the crawl configuration picture must be similar to the one taken that is correct')

  await wailApp.click('#archiveNowButton')

  const jobConf = await wailApp.delayExecuteJs(10000, function () {
    return window.___getHConfig()
  })

  t.truthy(jobConf, 'the job conf for the newly created crawl must not be null')

  let crawlCountRunning = await wailApp.delayExecuteJs(15000, function () {
    return window.___getRunningCrawlCount()
  })

  t.is(crawlCountRunning, 1, 'the ui state must have a running crawl count of 1 after crawl start')

  await wailApp.executeJs(function () {
    return window.___terminateCrawl()
  })

  const notifsUiDisplayed = await wailApp.delayExecuteJs(20000, function () {
    return window.___getNotifsUi()
  })

  t.deepEqual(notifsUiDisplayed, startedCrawlNotifsExpected, 'the notifications the ui displayed must be exactly equal to the expected sequence')

  crawlCountRunning = await wailApp.executeJs(function () {
    return window.___getRunningCrawlCount()
  })

  t.is(crawlCountRunning, 0, 'the ui state must have a running crawl count of 0 after crawl termination')
})

test.serial('WAIL can start and stop the services', async t => {
  let dbPids = await dbChecker.readPids()
  if (dbPids.wasError || dbPids.empty) {
    let report = dbPids.wasError ? 'we hit a case not accounted for' : 'the pid db was empty'
    t.fail(report)
  }
  let hpid = dbPids.heritrix.pid, wpid = dbPids.wayback.pid
  t.true(dbChecker.isPidRunning(hpid), 'the pid for heritrix in the database should be tied to a running instance before testing start stop')
  t.true(dbChecker.isPidRunning(wpid), 'the pid for wayback in the database should be tied to a running instance before testing start stop')

  await wailApp.goTo('#sidebarServices')

  let heritrixStatus = await wailApp.getText('#heritrixStatus')
  t.is(heritrixStatus, 'Running', 'heritrix status as indicated by the ui should be Running')

  await wailApp.clickAndWait('#stopHeritrix', 3000)
  heritrixStatus = await wailApp.getText('#heritrixStatus')
  t.is(heritrixStatus, 'X', 'heritrix status after stopping as indicated by the ui should be X')
  t.false(dbChecker.isPidRunning(hpid), 'the pid for heritrix in the database after stopping should not be running')

  await wailApp.delayClick('#startHeritrix', 2000)
  heritrixStatus = await wailApp.getText('#heritrixStatus')
  t.is(heritrixStatus, 'Running', 'heritrix status after starting from a stopped state should be Running')

  await Promise.delay(3000)
  let hprocess = await dbChecker.findProcessBy('name', 'heritrix')
  t.true(hprocess.length === 1, 'after restarting heritrix it should be running as indicated by the host system')

  let waybackStatus = await wailApp.getText('#waybackStatus')
  t.is(waybackStatus, 'Running', 'wayback status as indicated by the ui should be Running')

  await wailApp.clickAndWait('#stopWayback', 3000)
  waybackStatus = await wailApp.getText('#waybackStatus')
  t.is(waybackStatus, 'X', 'wayback status after stopping as indicated by the ui should be X')
  t.false(dbChecker.isPidRunning(wpid, 'the pid for wayback in the database after stopping should not be running'))

  await wailApp.clickAndWait('#startWayback', 3000)
  waybackStatus = await wailApp.getText('#waybackStatus')
  t.is(waybackStatus, 'Running', 'wayback status after restarting as indicated by the ui should be Running')

  let wprocess = await dbChecker.findProcessBy('name', 'wayback')
  t.true(wprocess.length >= 2, 'after restarting wayback it should be running as indicated by the host system')

  const uiNotifs = await wailApp.executeJs(function () {
    return window.___getNotifsUi()
  })
  const startStopNotifs = _.takeRight(uiNotifs, 6)
  t.deepEqual(startStopNotifs, startStopServicesExpected, 'the notifications displayed by the ui should match the expected series exactly')
})

test.serial('Visiting different parts of the ui does not fail', async t => {
  await wailApp.goTo('#sidebarHeritrix')
  t.deepEqual(await wailApp.getUiLoaction(), {header: {open: false, location: 'Heritrix'}, hist: '/heritrix'},
    'after clicking the nav drawer heritrix entry the ui should be at heritrix'
  )

  await wailApp.goTo('#sidebarServices')
  t.deepEqual(await wailApp.getUiLoaction(), {header: {open: false, location: 'Services'}, hist: '/services'},
    'after clicking the nav drawer services entry the ui should be at services'
  )

  await wailApp.goTo('#sidebarMisc')
  t.deepEqual(await wailApp.getUiLoaction(), {header: {open: false, location: 'Miscellaneous'}, hist: '/misc'},
    'after clicking the nav drawer miscellaneous entry the ui should be at miscellaneous'
  )

  await wailApp.goTo('#sidebarTwitter')
  t.deepEqual(await wailApp.getUiLoaction(), {
    header: {open: false, location: 'Twitter Archive'},
    hist: '/twitter-signin'
  },
    'after clicking the nav drawer twitter entry the ui should be at twitter'
  )

  await wailApp.goTo('#sidebarWail')
  t.deepEqual(await wailApp.getUiLoaction(), {header: {open: false, location: 'WAIL'}, hist: '/'},
    'after clicking the nav drawer wail entry the ui should be at wail'
  )
})
