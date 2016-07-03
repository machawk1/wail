import keyMirror from "keymirror"

const consts = {
  From: keyMirror({
    BASIC_ARCHIVE_NOW: null,
    NEW_CRAWL_DIALOG: null,
  }),
  EventTypes: keyMirror({
    HAS_VAILD_URI: null,
    GOT_MEMENTO_COUNT: null,
    GET_MEMENTO_COUNT: null,
    BUILD_CRAWL_JOB: null,
    BUILT_CRAWL_CONF: null,
    BUILT_CRAWL_JOB: null,
    LAUNCHED_CRAWL_JOB: null,
    CRAWL_JOB_DELETED: null,
    HERITRIX_STATUS_UPDATE: null,
    WAYBACK_STATUS_UPDATE: null,
    FETCH_CODE: null,
    SAVE_CODE: null,
    HERITRIX_CRAWL_ALL_STATUS: null,
    VIEW_HERITRIX_JOB: null,
    STORE_HERITRIX_JOB_CONFS: null,
    GET_HERITRIX_JOB_CONF: null,
    CHECK_URI_IN_ARCHIVE: null,
    VIEW_ARCHIVED_URI: null,
  }),
  Code: {
    which: keyMirror({
      WBC: null,
      CRAWLBEAN: null,
    }),
  }
}

export default consts
