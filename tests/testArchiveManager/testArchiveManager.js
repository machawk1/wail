import test from 'ava'
import Promise from 'bluebird'
import Path from 'path'
import tSettings from '../helpers/mockSettings'
import ArchiveManager from '../../wail-core/managers/archiveManager'

const cwd = process.cwd()
let settings = new tSettings()
let aMan, notifs

test.before('test setup', t => {
  console.log(cwd)
  settings.configure()
  aMan = new ArchiveManager(settings)
  notifs = aMan.subscribeToNotifications((notif) => {
    console.log(notif)
  })
})

test('the archive manager should be able to get all collections', async t => {

})
