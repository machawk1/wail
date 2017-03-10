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
  return await serviceMan.init()
})

test.serial('the service manager should be able to start the services', async t => {
  const expectedWaybackStart = {wasError: false}
  const heritrixWaybackStart = {wasError: false}

  const ftWBStartAct = await serviceMan.startWaybackLoading()
  t.deepEqual(ftWBStartAct, expectedWaybackStart, 'the service manager should be able to start wayback')
  const ftHStartedAct = await serviceMan.startHeritrixLoading()
  t.deepEqual(ftHStartedAct, heritrixWaybackStart, 'the service manager should be able to start heritrix')

  t.true(serviceMan.isServiceUp('wayback'), 'the service manager should be able to detect that wayback is up after starting')
  t.true(serviceMan.isServiceUp('heritrix'), 'the service manager should be able to detect that heritrix is up after starting')

  t.notThrows(serviceMan.startWayback(), 'the service manager should be able detect that wayback is already started and not try to restart it')
  t.notThrows(serviceMan.startHeritrix(), 'the service manager should be able to detect that heritrix is already started and not try to restart it')
})

test.serial('the service manager should be able to stop each service individually', async t => {
  t.notThrows(serviceMan.killService('wayback'), 'the service manager should be able to kill wayback without throwing an error')
  await Promise.delay(2000)
  t.notThrows(serviceMan.killService('heritrix'), 'the service manager should be able to kill wayback without throwing an error')
  await Promise.delay(2000)
  t.false(serviceMan.isServiceUp('wayback'), 'the service manager should be able to detect that wayback is down after killing it')
  t.false(serviceMan.isServiceUp('heritrix'), 'the service manager should be able to detect that heritrix is down after killing it')
})

test.serial('the service manager should be able to restart each service after killing it', async t => {
  t.notThrows(serviceMan.startWayback(), 'the service manager should be able to start wayback after it was killed previously')
  t.true(serviceMan.isServiceUp('wayback'), 'the service manager should be able to detect that wayback is up after starting')
  t.notThrows(serviceMan.startHeritrix(), 'the service manager should be able to start heritrix after it was killed previously')
  // await Promise.delay(3000)
  t.true(serviceMan.isServiceUp('heritrix'), 'the service manager should be able to detect that heritrix is up after starting')
})

// test.serial('the service manager should be able to stop all services at once', async t => {
//   t.notThrows(serviceMan.killService('all'), 'the service manager should be able to kill all services without throwing an error')
//   await Promise.delay(3000)
//   t.false(serviceMan.isServiceUp('wayback'), 'the service manager should be able to detect that wayback is down after killing all services')
//   t.false(serviceMan.isServiceUp('heritrix'), 'the service manager should be able to detect that heritrix is down after killing all services')
// })

// test.serial('the service manager should be able to restart each service after killing all of them', async t => {
//   t.notThrows(serviceMan.startWayback(), 'the service manager should be able to start wayback after it was killed previously')
//   t.notThrows(serviceMan.startHeritrix(), 'the service manager should be able to start heritrix after it was killed previously')
//   await Promise.delay(2000)
//   t.true(serviceMan.isServiceUp('wayback'), 'the service manager should be able to detect that wayback is down after killing it')
//   t.true(serviceMan.isServiceUp('heritrix'), 'the service manager should be able to detect that heritrix is down after killing it')
// })

test.after.always('stop services', async t => {
  await serviceMan.killAllServices()
})