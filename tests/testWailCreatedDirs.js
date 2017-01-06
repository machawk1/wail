import test from 'ava'
import pathExists from 'path-exists'
import path from 'path'
import loadSettings from './helpers/loadSettings'

let settings = null

test.before('setup', t => {
  if (!settings) {
    settings = loadSettings()
  }
})

test('WAIL created the managed directories', async t => {
  let crawlPath = settings.get('heritrix.jobsDir')
  t.true(await pathExists(crawlPath), 'the directory WAIL_Managed_Crawls must exist')

  let warcsPath = settings.get('warcs')
  t.true(await pathExists(warcsPath), 'the directory WAIL_ManagedCollections must exist')

  let colPath = settings.get('collections.dir')
  t.true(await pathExists(colPath), 'the directory WAIL_ManagedCollections/collections must exist')

  let templateDir = settings.get('collections.templateDir')
  t.true(await pathExists(templateDir), 'the template directory required by pywb must exist')

  let staticDir = settings.get('collections.staticsDir')
  t.true(await pathExists(staticDir), 'the static directory required by pywb must exist')
})

test('WAIL created the default collection', async t => {
  let defaultColPath = settings.get('collections.defaultCol')
  t.true(await pathExists(defaultColPath), 'the directory WAIL_ManagedCollections/collection/default must exist')

  let dColStaticPath = path.join(defaultColPath, 'static')
  t.true(await pathExists(dColStaticPath), 'the directory WAIL_ManagedCollections/collection/static must exist')

  let dColTemplatePath = path.join(defaultColPath, 'templates')
  t.true(await pathExists(dColTemplatePath), 'the directory WAIL_ManagedCollections/collection/templates must exist')

  let dColArchivePath = path.join(defaultColPath, 'archive')
  t.true(await pathExists(dColArchivePath), 'the directory WAIL_ManagedCollections/collection/archive must exist')

  let dColIndexesPath = path.join(defaultColPath, 'indexes')
  t.true(await pathExists(dColIndexesPath), 'the directory WAIL_ManagedCollections/collection/indexes must exist')
})