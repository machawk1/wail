import test from 'ava'
import Promise from 'bluebird'
import Path from 'path'
import tSettings from '../helpers/mockSettings'
import ServiceManager from '../../wail-core/managers/serviceManager/index'
import processStates from '../../wail-core/managers/serviceManager/processControlers/processStates'

const cwd = process.cwd()
let settings, serviceMan
let wbSub, hSub, wbStateTrans, hStateTrans

test.before('test setup', t => {
  console.log(cwd)
  settings = new tSettings()
  settings.configure(Path.join(process.cwd(), 'tests',
    'testServiceMan', 'settings.json'))
  serviceMan = new ServiceManager(settings)
  wbSub = serviceMan.observeWayback((stateTransition) => {
    console.log('wayback state transition', stateTransition)
    wbStateTrans = stateTransition
  })
  hSub = serviceMan.observeHeritrix((stateTransition) => {
    console.log('heritrix state transition', stateTransition)
    hStateTrans = stateTransition
  })
})

test.serial('the service manager should be able to start the services', async t => {
  t.is(await serviceMan.startWayback(), processStates.started, 'the service manager should be able to start wayback')
  t.is(await serviceMan.startHeritrix(), processStates.started, 'the service manager should be able to start heritrix')

  t.true(serviceMan.isServiceUp('wayback'), 'the service manager should be able to detect that wayback is up after starting')
  t.true(serviceMan.isServiceUp('heritrix'), 'the service manager should be able to detect that heritrix is up after starting')

  t.is(await serviceMan.startWayback(), processStates.started, 'the service manager should be able detect that wayback is already started and not try to restart it')
  t.is(await serviceMan.startHeritrix(), processStates.started, 'the service manager should be able to detect that heritrix is already started and not try to restart it')
  t.deepEqual(wbStateTrans, {
    prev: 'starting',
    cur: 'started'
  }, 'the wayback overservable should have emitted we went from starting to started')
  t.deepEqual(hStateTrans, {
    prev: 'starting',
    cur: 'started'
  }, 'the heritrix overservable should have emitted we went from starting to started')
})

test.serial('the service manager should be able to stop each service individually', async t => {
  t.notThrows(serviceMan.killService('wayback'), 'the service manager should be able to kill wayback without throwing an error')
  await Promise.delay(2000)
  t.notThrows(serviceMan.killService('heritrix'), 'the service manager should be able to kill wayback without throwing an error')
  await Promise.delay(2000)
  t.false(serviceMan.isServiceUp('wayback'), 'the service manager should be able to detect that wayback is down after killing it')
  t.false(serviceMan.isServiceUp('heritrix'), 'the service manager should be able to detect that heritrix is down after killing it')
  t.deepEqual(wbStateTrans, {
    prev: 'started',
    cur: 'not_started',
    code: null
  }, 'the wayback overservable should have emitted we went from starting to started')
  t.deepEqual(hStateTrans, {
    prev: 'started',
    cur: 'not_started',
    code: 137
  }, 'the heritrix overservable should have emitted we went from starting to started')
})

test.serial('the service manager should be able to restart each service after killing it', async t => {
  t.is(await serviceMan.startWayback(), processStates.started, 'the service manager should be able to start wayback after it was killed previously')
  t.is(await serviceMan.startHeritrix(), processStates.started, 'the service manager should be able to start heritrix after it was killed previously')
  // await Promise.delay(3000)
  t.true(serviceMan.isServiceUp('wayback'), 'the service manager should be able to detect that wayback is up after starting')
  t.true(serviceMan.isServiceUp('heritrix'), 'the service manager should be able to detect that heritrix is up after starting')
  t.deepEqual(wbStateTrans, {
    prev: 'starting',
    cur: 'started'
  }, 'the wayback overservable should have emitted we went from starting to started after restarting each service')
  t.deepEqual(hStateTrans, {
    prev: 'starting',
    cur: 'started'
  }, 'the heritrix overservable should have emitted we went from starting to started after restarting each service')
})

test.serial('the service manager should be able to stop all services at once', async t => {
  t.notThrows(serviceMan.killService('all'), 'the service manager should be able to kill all services without throwing an error')
  await Promise.delay(3000)
  t.false(serviceMan.isServiceUp('wayback'), 'the service manager should be able to detect that wayback is down after killing all services')
  t.false(serviceMan.isServiceUp('heritrix'), 'the service manager should be able to detect that heritrix is down after killing all services')
  t.deepEqual(wbStateTrans, {
    prev: 'started',
    cur: 'not_started',
    code: null
  }, 'the wayback overservable should have emitted we went from starting to started after killing them all')
  t.deepEqual(hStateTrans, {
    prev: 'started',
    cur: 'not_started',
    code: 137
  }, 'the heritrix overservable should have emitted we went from starting to started after killing them all')
})

test.serial('the service manager should be able to restart each service after killing all of them', async t => {
  t.is(await serviceMan.startWayback(), processStates.started, 'the service manager should be able to start wayback after it was killed previously')
  t.is(await serviceMan.startHeritrix(), processStates.started, 'the service manager should be able to start heritrix after it was killed previously')
  t.true(serviceMan.isServiceUp('wayback'), 'the service manager should be able to detect that wayback is down after killing them all')
  t.true(serviceMan.isServiceUp('heritrix'), 'the service manager should be able to detect that heritrix is down after killing them all')

  t.deepEqual(wbStateTrans, {
    prev: 'starting',
    cur: 'started'
  }, 'the wayback overservable should have emitted we went from starting to started after restarting each service')
  t.deepEqual(hStateTrans, {
    prev: 'starting',
    cur: 'started'
  }, 'the heritrix overservable should have emitted we went from starting to started after restarting each service')
})

test.after.always('stop services', async t => {
  await serviceMan.killAllServices()
})
