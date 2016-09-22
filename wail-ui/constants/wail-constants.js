import keyMirror from 'keymirror'

let defForCol = 'default'
if (process.env.NODE_ENV === 'development') {
  defForCol = 'Wail'
}

export default {
  Code: {
    which: keyMirror({
      WBC: null,
      CRAWLBEAN: null
    })
  },
  EventTypes: keyMirror({
    ADD_METADATA_TO_COLLECTION: null,
    BUILD_CRAWL_JOB: null,
    BUILT_CRAWL_CONF: null,
    BUILT_CRAWL_JOB: null,
    CHECK_URI_IN_ARCHIVE: null,
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
    WAYBACK_STATUS_UPDATE: null
  }),
  From: keyMirror({
    BASIC_ARCHIVE_NOW: null,
    NEW_CRAWL_DIALOG: null,
    MEMENTO_MENU: null
  }),
  RequestTypes: keyMirror({
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
    REQUEST_SUCCESS:null,
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
  Default_Collection: defForCol
}
