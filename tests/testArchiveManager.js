import test from 'ava'
import Promise from 'bluebird'
import Path from 'path'
import ElectronSettings from 'electron-settings'

const cwd = process.cwd()
let settings

test.before('test setup', t => {
  console.log(cwd)
})

test('blah', async t => {
  t.is(cwd, '/home/john/my-fork-wail')
})