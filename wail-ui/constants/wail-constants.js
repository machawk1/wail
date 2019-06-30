import keyMirror from 'keymirror'

export default {
  Code: {
    which: keyMirror({
      WBC: null,
      CRAWLBEAN: null
    })
  },
  Closing: keyMirror({
    CLOSING: null,
    CLOSING_MESSAGE: null
  }),
  RunningCrawlCounter: keyMirror({
    INCREMENT: null,
    DECREMENT: null
  }),
  LocationChange: keyMirror({
    CHECK_TWITTER: null
  }),
  Twitter: keyMirror({
    SIGNED_IN: null
  }),
  Header: keyMirror({
    HEADER_OPEN_CLOSE: null,
    HEADER_TOGGLE: null,
    HEADER_LOCATION: null
  }),
  HeritrixRequestTypes: keyMirror({
    BUILD_LAUNCH_JOB: null,
    STOP_JOB: null,
    TERMINATE_RESTART_JOB: null,
    TERMINATE_JOB: null,
    RESCAN_JOB_DIR: null,
    PERMANENT_DELETE_JOB: null
  }),
  REMOVE_RUN: keyMirror({
    REMOVE_RUN: null
  }),
  AddSeedFromFsEvents: keyMirror({
    SEED_CHECKED: null,
    ADD_SEED: null,
    ADDING_SEED: null,
    ADDING_SEED_DONE: null,
    ADDING_SEED_DONE_ERROR: null,
    RESET_ADD_SEED_MESSAGE: null
  }),
  CheckUrlEvents: keyMirror({
    CHECK_URL: null,
    CHECKING_URL: null,
    CHECKING_DONE: null,
    CHECKING_DONE_ERROR: null,
    RESET_CHECK_MESSAGE: null
  }),
  JobActionEvents: keyMirror({
    START_JOB: null,
    RESTART_JOB: null,
    REMOVE_JOB: null,
    DELETE_JOB: null,
    TERMINATE_JOB: null
  }),
  RequestActions: keyMirror({
    MAKE_REQUEST: null,
    HANDLED_REQUEST: null
  }),
  JobIdActions: keyMirror({
    ADD_ID: null,
    REMOVE_ID: null
  }),
  CrawlEvents: keyMirror({
    GOT_ALL_RUNS: null,
    CRAWLJOB_STATUS_UPDATE: null,
    BUILD_CRAWL_JOB: null,
    BUILT_CRAWL_CONF: null,
    CREATE_JOB: null,
    CRAWL_JOB_DELETED: null
  }),
  CollectionEvents: keyMirror({
    GOT_ALL_COLLECTIONS: null,
    CREATED_COLLECTION: null,
    ADD_METADATA_TO_COLLECTION: null,
    ADDED_WARCS_TO_COLL: null,
    CRAWL_TO_COLLECTION: null
  }),
  ServiceEvents: keyMirror({
    HERITRIX_STATUS_UPDATE: null,
    WAYBACK_STATUS_UPDATE: null,
    WAYBACK_RESTART: null
  }),
  EventTypes: keyMirror({
    RNS_SHOW_NOTIFICATION: null,
    RNS_HIDE_NOTIFICATION: null,
    EDIT_METADATA: null,
    ADD_METADATA_TO_COLLECTION: null,
    BUILD_CRAWL_JOB: null,
    BUILT_CRAWL_CONF: null,
    BUILT_CRAWL_JOB: null,
    CHECK_URI_IN_ARCHIVE: null,
    CREATE_JOB: null,
    CRAWL_JOB_DELETED: null,
    CREATE_NEW_COLLECTION: null,
    EMPTY_URL: null,
    FETCH_CODE: null,
    FORCE_CRAWL_FINISH: null,
    GET_COLLECTION_NAMES: null,
    GET_COLLECTIONS: null,
    GET_HERITRIX_JOB_CONF: null,
    GET_MEMENTO_COUNT: null,
    GOT_MEMENTO_COUNT: null,
    HAS_VAILD_URI: null,
    HERITRIX_CRAWL_ALL_STATUS: null,
    HERITRIX_STATUS_UPDATE: null,
    LAUNCHED_CRAWL_JOB: null,
    NEW_CRAWL_COL_SELECTED: null,
    NEW_CRAWL_ADD_DEPTH: null,
    NEW_CRAWL_ADD_URL: null,
    NEW_CRAWL_EDITED_URL: null,
    NEW_CRAWL_REMOVE_URL: null,
    QUEUE_MESSAGE: null,
    REQUEST_HERITRIX: null,
    REQUEST_WAYBACK: null,
    SAVE_CODE: null,
    STORE_HERITRIX_JOB_CONFS: null,
    TEARDOWN_CRAWL: null,
    VIEW_ARCHIVED_URI: null,
    VIEW_HERITRIX_JOB: null,
    WAYBACK_RESTART: null,
    WAYBACK_STATUS_UPDATE: null
  }),
  From: keyMirror({
    BASIC_ARCHIVE_NOW: null,
    NEW_CRAWL_DIALOG: null,
    MEMENTO_MENU: null
  }),
  RequestTypes: keyMirror({
    BUILD_CRAWL_JOB: null,
    BUILT_CRAWL_CONF: null,
    BUILT_CRAWL_JOB: null,
    ACCESSIBILITY: null,
    ADD_HERITRIX_JOB_DIRECTORY: null,
    BUILD_HERITIX_JOB: null,
    FORCE_CRAWL_FINISH: null,
    TERMINATE_CRAWL: null,
    TEARDOWN_CRAWL: null,
    RESCAN_JOB_DIR: null,
    KILL_HERITRIX: null,
    LAUNCH_HERITRIX_JOB: null,
    SEND_HERITRIX_ACTION: null,
    REQUEST_SUCCESS: null,
    LAUNCHED_CRAWL_JOB: null,
    REQUEST_FAILURE: null
  }),
  Loading: keyMirror({
    JAVA_CHECK_DONE: null,
    DOWNLOAD_JAVA: null,
    JDK_DOWNLOADING: null,
    JDK_DOWNLOADED: null,
    SERVICE_HW_UP: null,
    SERVICE_HW_DOWN: null,
    SERVICE_CHECK_DONE: null,
    MIGRATION_DONE: null
  }),
  Default_Collection: process.env.NODE_ENV === 'development' ? 'Wail' : 'default'
}
