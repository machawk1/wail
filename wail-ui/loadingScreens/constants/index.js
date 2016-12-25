import keymirror from 'keymirror'

export default {
  OS_CHECK: keymirror({
    CHECK_OS: null,
    CHECKED_OS: null,
  }),
  JAVA_CHECK: keymirror({
    CHECK_JAVA: null,
    CHECKED_JAVA: null,
    CHECK_JAVA_ON_PATH: null,
    CHECKED_JAVA_ON_PATH: null,
    CHECK_JAVA_OSX: null,
    CHECKED_JAVA_OSX: null,
    EXECUTE_JAVA_VERSION: null,
    EXECUTED_JAVA_VERSION: null,
  }),
  JDK_DOWNLOAD: keymirror({
    DL_JDK: null,
    DL_JDK_STARTED: null,
    DL_JDK_PROGRESS: null,
    DL_JDK_ERROR: null,
    DL_JDK_FINISHED: null,
  }),
  JDK_INSTALL: keymirror({
    START_INSTALL: null,
    INSTALL_PROCESS_ERROR: null,
  }),
  STEP: keymirror({
    NEXT_LOADING_STEP: null,
    PREV_LOADING_STEP: null,
  }),
  SERVICES: keymirror({
    HERITRIX_STARTED: null,
    HERITRIX_STARTED_ERROR: null,
    WAYBACK_STARTED: null,
    WAYBACK_STARTED_ERROR: null,
  }),
  INITIAL_LOAD: keymirror({
    HAVE_UI_STATE: null
  })
}
