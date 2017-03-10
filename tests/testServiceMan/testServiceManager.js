import test from 'ava'
import Promise from 'bluebird'
import Path from 'path'
import tSettings from '../helpers/mockSettings'
import ServiceManager from '../../wail-core/managers/serviceManager2'

const cwd = process.cwd()
let settings, serviceMan

test.before('test setup', async t => {
  console.log(cwd)
  settings = new tSettings()
  settings.configure()
  serviceMan = new ServiceManager(settings)
  await serviceMan.init()
})

test('the service manager should be able to start the services', async t => {
  const expectedWaybackStart = {wasError: false}
  const heritrixWaybackStart = {wasError: false}

  const ftWBStartAct = await serviceMan.startWaybackLoading()
  t.deepEqual(ftWBStartAct, expectedWaybackStart, 'the service manager should be able to start wayback')
  const ftHStartedAct = await serviceMan.startHeritrixLoading()
  t.deepEqual(ftHStartedAct, heritrixWaybackStart, 'the service manager should be able to start heritrix')

  t.true(serviceMan.isServiceUp('wayback'), 'the service manager should be able to detect that wayback is up after starting')
  t.true(serviceMan.isServiceUp('heritrix'), 'the service manager should be able to detect that heritrix is up after starting')

  const waybackStartedAct = await serviceMan.startWaybackLoading()
  t.deepEqual(waybackStartedAct, expectedWaybackStart, 'the service manager should be able detect that wayback is already started and not try to restart it')
  const heritrixStartedAct = await serviceMan.startHeritrixLoading()
  t.deepEqual(heritrixStartedAct, heritrixWaybackStart, 'the service manager should be able to detect that heritrix is already started and not try to restart it')
})

test('the service manager should be able to stop the services', async t => {
  const waybackStartedAct = await serviceMan.startWaybackLoading()
  const expectedWaybackStart = {wasError: false}
  t.deepEqual(waybackStartedAct, expectedWaybackStart, 'the service manager should be able to start wayback')
  const heritrixStartedAct = await serviceMan.startHeritrixLoading()
  const heritrixWaybackStart = {wasError: false}
  t.deepEqual(heritrixStartedAct, heritrixWaybackStart, 'the service manager should be able to start heritrix')

  t.true(serviceMan.isServiceUp('wayback'), 'the service manager should be able to detect that wayback is up after starting')
  t.true(serviceMan.isServiceUp('heritrix'), 'the service manager should be able to detect that heritrix is up after starting')
})

test.after('stop services', async t => {
  await serviceMan.killAllServices()
})