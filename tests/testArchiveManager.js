import test from 'ava'
import Promise from 'bluebird'
import Path from 'path'
import tSettings from './helpers/mockSettings'

const cwd = process.cwd()
let settings = new tSettings()

test.before('test setup', t => {
  console.log(cwd)
  settings.configure()
})

test('blah', async t => {
  console.log(settings.get())
  t.pass()
})