const moment = require('moment')
// require('moment-precise-range-plugin')
// const EventEmitter = require('eventemitter3')
const DB = require('nedb')
const shelljs = require('shelljs')
const named = require('named-regexp')
const _ = require('lodash')
const util = require('util')
// const Immutable = require('immutable')
const path = require('path')
const Promise = require('bluebird')
const S = require('string')
const cp = require('child_process')
const fp = require('lodash/fp')
const fs = require('fs-extra')
const through2 = require('through2')
const split = require('split2')
// const prettyBytes = require('pretty-bytes')
// const path = require('path')
// const schedule = require('node-schedule')
// const Twit = require('twit')
// const request = require('request')
// const progress = require('request-progress')
// const prettyMs = require('pretty-ms')
// const prettySeconds = require('pretty-seconds')
// const Rx = require('rxjs')
// const delay = require('lodash/delay')
const madge = require('madge')
// const groups = {}
const inspect = _.partialRight(util.inspect, {depth: null, colors: true})

const tree = {
  '../wail-core/util/viewWatcher': [],
  '../wail-core/util/warcUtils': [],
  '../wail-twitter/twitterClient': [],
  '../wailPollyfil': [],
  'actions/addSeedFromFs': ['../wail-core/util/warcUtils', 'constants/wail-constants'],
  'actions/archival': ['constants/wail-constants'],
  'actions/changeLocation': ['constants/wail-constants'],
  'actions/collections': ['constants/wail-constants'],
  'actions/heritrix': ['actions/notification-actions',
    'actions/util-actions',
    'constants/wail-constants'],
  'actions/index': ['actions/archival',
    'actions/changeLocation',
    'actions/collections',
    'actions/heritrix',
    'actions/notification-actions',
    'actions/services'],
  'actions/notification-actions': ['constants/wail-constants'],
  'actions/services': ['actions/notification-actions', 'constants/wail-constants'],
  'actions/twitter': ['constants/wail-constants'],
  'actions/util-actions': [],
  'components/collections/addToCollection/fromFs/addFromFs': ['actions/addSeedFromFs',
    'actions/notification-actions',
    'components/collections/addToCollection/fromFs/seedName',
    'components/collections/addToCollection/fromFs/selectSeed'],
  'components/collections/addToCollection/fromFs/addFromFsHeader': ['actions/addSeedFromFs', 'actions/archival'],
  'components/collections/addToCollection/fromFs/configureFormPage': ['components/collections/addToCollection/fromFs/seedListFormPage',
    'components/collections/addToCollection/fromFs/seedName'],
  'components/collections/addToCollection/fromFs/displayInvalidMessage': [],
  'components/collections/addToCollection/fromFs/seedFormEntry': ['components/utilComponents/myAutoSizer'],
  'components/collections/addToCollection/fromFs/seedList': ['components/collections/addToCollection/fromFs/configureFormPage'],
  'components/collections/addToCollection/fromFs/seedListFormPage': ['components/collections/addToCollection/fromFs/seedFormEntry'],
  'components/collections/addToCollection/fromFs/seedName': [],
  'components/collections/addToCollection/fromFs/selectSeed': ['components/collections/addToCollection/fromFs/displayInvalidMessage',
    'components/collections/addToCollection/fromFs/seedList'],
  'components/collections/addToCollection/fromLiveWeb/archiveUrlForm': ['actions/archival', 'actions/notification-actions'],
  'components/collections/addToCollection/fromLiveWeb/checkResults': ['actions/util-actions',
    'components/utilComponents/myAutoSizer'],
  'components/collections/addToCollection/fromLiveWeb/checkSeed': ['actions/archival',
    'components/collections/addToCollection/fromLiveWeb/checkResults'],
  'components/collections/addToCollection/fromLiveWeb/colAddSeedHeader': ['actions/archival'],
  'components/collections/addToCollection/index': ['components/collections/addToCollection/fromFs/addFromFs',
    'components/collections/addToCollection/fromFs/addFromFsHeader',
    'components/collections/addToCollection/fromLiveWeb/archiveUrlForm',
    'components/collections/addToCollection/fromLiveWeb/checkSeed',
    'components/collections/addToCollection/fromLiveWeb/colAddSeedHeader'],
  'components/collections/selectCollection/filterSelectCol': ['components/collections/selectCollection/selectColTable',
    'components/utilComponents/Search'],
  'components/collections/selectCollection/index': ['components/collections/selectCollection/filterSelectCol',
    'components/collections/selectCollection/selectColHeader'],
  'components/collections/selectCollection/selectColHeader': ['../wail-core/util/viewWatcher'],
  'components/collections/selectCollection/selectColTable': ['components/sortDirection/sortDirection',
    'components/sortDirection/sortHeader',
    'components/utilComponents/myAutoSizer',
    'util/fuzzyFilter'],
  'components/collections/viewArchiveConfiguration/archiveConfigTable': ['components/utilComponents/myAutoSizer'],
  'components/collections/viewArchiveConfiguration/index': ['components/collections/viewArchiveConfiguration/archiveConfigTable',
    'components/collections/viewArchiveConfiguration/viewArchiveConfigHeader'],
  'components/collections/viewArchiveConfiguration/viewArchiveConfigHeader': [],
  'components/collections/viewCollection/addSeedFab': [],
  'components/collections/viewCollection/collectionViewHeader': [],
  'components/collections/viewCollection/index': ['components/collections/viewCollection/addSeedFab',
    'components/collections/viewCollection/collectionViewHeader',
    'components/collections/viewCollection/seedTable'],
  'components/collections/viewCollection/seedTable': ['components/utilComponents/myAutoSizer',
    'constants/wail-constants',
    'util/momentSort'],
  'components/dialogs/editMetaData': ['../wail-core/util/viewWatcher', 'constants/wail-constants'],
  'components/dialogs/newCollection': ['../wail-core/util/viewWatcher',
    'components/dialogs/newCollectionForm/index',
    'constants/wail-constants'],
  'components/dialogs/newCollectionForm/index': [],
  'components/heritrix/hJobItemContainer': ['actions/heritrix',
    'actions/util-actions',
    'components/heritrix/heritrixJobItem'],
  'components/heritrix/heritrixInlineStyles': [],
  'components/heritrix/heritrixJobItem': ['components/heritrix/heritrixInlineStyles'],
  'components/heritrix/heritrixToolBar': ['actions/heritrix'],
  'components/heritrix/index': ['components/heritrix/hJobItemContainer',
    'components/heritrix/heritrixInlineStyles',
    'components/utilComponents/myAutoSizer'],
  'components/informational/notifications': ['constants/wail-constants'],
  'components/layout/crawlingIndicator': [],
  'components/layout/footer': ['components/dialogs/editMetaData',
    'components/dialogs/newCollection',
    'components/informational/notifications',
    'util/recomposeHelpers'],
  'components/layout/header': ['actions/changeLocation',
    'components/layout/crawlingIndicator'],
  'components/miscellaneous/eventLog': ['components/miscellaneous/logViewer',
    'components/utilComponents/myAutoSizer',
    'util/recomposeHelpers'],
  'components/miscellaneous/logViewer': [],
  'components/miscellaneous/miscToolBar': ['actions/util-actions'],
  'components/serviceStatus/index': ['actions/services', 'records/serviceStatus'],
  'components/sortDirection/sortDirection': [],
  'components/sortDirection/sortHeader': ['components/sortDirection/sortDirection',
    'components/sortDirection/sortIndicator'],
  'components/sortDirection/sortIndicator': ['components/sortDirection/sortDirection'],
  'components/twitter/archiveConfig/aTwitterUser': ['actions/notification-actions',
    'components/twitter/archiveConfig/timeValues',
    'components/twitter/archiveConfig/twitterUser/maybeHashTags',
    'components/twitter/archiveConfig/twitterUser/userBasic'],
  'components/twitter/archiveConfig/textSearch/searchTerms': ['components/twitter/archiveConfig/textSearch/validate'],
  'components/twitter/archiveConfig/textSearch/userBasic': ['components/twitter/archiveConfig/textSearch/validate',
    'components/twitter/archiveConfig/timeValues',
    'util/fuzzyFilter'],
  'components/twitter/archiveConfig/textSearch/validate': ['components/twitter/archiveConfig/timeValues'],
  'components/twitter/archiveConfig/timeValues': [],
  'components/twitter/archiveConfig/twitterUser/maybeHashTags': ['components/twitter/archiveConfig/twitterUser/validate'],
  'components/twitter/archiveConfig/twitterUser/userBasic': ['components/twitter/archiveConfig/timeValues',
    'components/twitter/archiveConfig/twitterUser/validate',
    'util/fuzzyFilter'],
  'components/twitter/archiveConfig/twitterUser/validate': ['components/twitter/archiveConfig/timeValues'],
  'components/twitter/archiveConfig/twitterUserTextSearch': ['actions/notification-actions',
    'components/twitter/archiveConfig/textSearch/searchTerms',
    'components/twitter/archiveConfig/textSearch/userBasic',
    'components/twitter/archiveConfig/timeValues'],
  'components/twitter/signIn': ['actions/notification-actions', 'actions/twitter'],
  'components/utilComponents/Search': ['components/utilComponents/searchInput'],
  'components/utilComponents/myAutoSizer': [],
  'components/utilComponents/searchInput': [],
  'constants/wail-constants': [],
  'containers/collectionAddSeed': ['components/collections/addToCollection/index'],
  'containers/collectionAddSeedFs': ['components/collections/addToCollection/index'],
  'containers/collectionView': ['components/collections/viewCollection/index'],
  'containers/heritrixView': ['components/heritrix/heritrixToolBar',
    'components/heritrix/index',
    'util/recomposeHelpers'],
  'containers/layout': [],
  'containers/miscellaneous': ['components/miscellaneous/eventLog',
    'components/miscellaneous/miscToolBar',
    'util/recomposeHelpers'],
  'containers/selectColContainer': ['components/collections/selectCollection/index'],
  'containers/serviceStats': ['components/serviceStatus/index'],
  'containers/twitterView': ['components/twitter/archiveConfig/aTwitterUser',
    'components/twitter/archiveConfig/twitterUserTextSearch',
    'util/recomposeHelpers'],
  'containers/viewArchiveConfig': ['components/collections/viewArchiveConfiguration/index'],
  'containers/wail': ['components/layout/footer',
    'components/layout/header',
    'routes'],
  'css/wail': [],
  'middleware/heritrixRequestHandler': ['actions/heritrix',
    'actions/notification-actions',
    'constants/wail-constants'],
  'middleware/index': ['middleware/heritrixRequestHandler',
    'middleware/ipc',
    'middleware/requestHandler'],
  'middleware/ipc': ['actions/collections', 'actions/heritrix', 'actions/services'],
  'middleware/requestHandler': ['actions/archival',
    'constants/wail-constants',
    'middleware/heritrixRequestHandler',
    'util/checkSeed'],
  'records/crawlInfoRecord': ['records/runInfoRecord'],
  'records/runInfoRecord': [],
  'records/serviceStatus': [],
  'reducers/checkUrl': ['constants/wail-constants'],
  'reducers/collectionReducer': ['constants/wail-constants'],
  'reducers/crawls': ['constants/wail-constants', 'records/crawlInfoRecord'],
  'reducers/index': ['constants/wail-constants',
    'reducers/checkUrl',
    'reducers/collectionReducer',
    'reducers/crawls',
    'reducers/runningCrawls',
    'reducers/serviceStatuses',
    'reducers/twitter'],
  'reducers/runningCrawls': ['constants/wail-constants'],
  'reducers/serviceStatuses': ['constants/wail-constants', 'records/serviceStatus'],
  'reducers/twitter': ['constants/wail-constants'],
  routes: ['components/twitter/signIn',
    'containers/collectionAddSeed',
    'containers/collectionAddSeedFs',
    'containers/collectionView',
    'containers/heritrixView',
    'containers/layout',
    'containers/miscellaneous',
    'containers/selectColContainer',
    'containers/serviceStats',
    'containers/twitterView',
    'containers/viewArchiveConfig'],
  'stores/configureStore': ['stores/configureStore.dev', 'stores/configureStore.prod'],
  'stores/configureStore.dev': ['actions/index', 'middleware/index', 'reducers/index'],
  'stores/configureStore.prod': ['middleware/index', 'reducers/index'],
  'util/checkSeed': [],
  'util/fuzzyFilter': [],
  'util/momentSort': [],
  'util/recomposeHelpers': [],
  'util/ringBuffer': [],
  'vendor/detectElementResize': [],
  wail: ['../wail-twitter/twitterClient',
    '../wailPollyfil',
    'containers/wail',
    'css/wail',
    'stores/configureStore',
    'util/ringBuffer',
    'vendor/detectElementResize']
}
const paths = []
// for (let [node, edges] of _.toPairs(tree)) {
//   let parsed = path.parse(node)
//   paths.push(Object.assign({}, parsed, {node, edges}))
// }
//
// console.log(inspect(_.groupBy(paths, 'dir')))

madge('/home/john/my-fork-wail/wail-ui/wail.js').then((res) => res.dot())
  .then((output) => {
    fs.writeFile('wailDepg.dot', output, 'utf8', (err) => {
      console.log(err)
    })
  })

/*
 .then((res) => res.dot())
 .then((output) => {
 console.log(output)
 })
 */