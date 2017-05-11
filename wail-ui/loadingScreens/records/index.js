import Immutable from 'immutable'
import { loadingRecords as lrec } from '../../constants/uiStrings'

class OsCheckRecord extends Immutable.Record({checkDone: false, os: '', arch: ''}) {
  updateFromAction (action) {
    let {os, arch} = action
    return this.merge({checkDone: true, os, arch})
  }
}

class JavaCheckRecord extends Immutable.Record({
  checkDone: false,
  haveJava: false,
  javaV: '',
  haveCorrectJava: false,
  download: false
}) {
  updateFromAction (action) {
    let {haveJava, haveCorrectJava, download, javaV} = action
    return this.merge({checkDone: true, javaV, haveJava, haveCorrectJava, download})
  }

  haveReport () {
    return lrec.youHaveJavaReport(this.get('haveJava'), this.get('javaV'))
  }

  haveCorrectReport () {
    return lrec.youHaveCorrectJavaReport(this.get('haveCorrectJava'))
  }

  downloadReport () {
    if (process.platform !== 'darwin') {
      if (!this.get('haveCorrectJava') || !this.get('haveJava')) {
        return lrec.needDLJavaNoUseOpenJdk
      } else {
        return lrec.needDLJavaNo
      }
    } else {
      return lrec.needDLJavaDarwin(this.get('download'))
    }
  }
}

class JdkDlRecord extends Immutable.Record({
  elapsed: 'Starting',
  remaining: 'infinity',
  percent: 0,
  speed: '0 MB/s',
  totalSize: 0,
  transferred: 0,
  started: false,
  running: false,
  finished: false,
  error: false
}) {
  started () {
    return this.set('started', true)
  }

  progressUpdate (stats) {
    if (!this.get('running')) {
      return this.merge({...stats, running: true})
    }
    return this.merge(stats)
  }

  finishedNoError () {
    return this.merge({finished: true, error: false})
  }

  finishedError () {
    return this.merge({finished: true, error: true})
  }
}

class SSRecord extends Immutable.Record({
  hStarted: false,
  hStartErReport: {},
  wStarted: false,
  wStartErReport: {},
  bothStarted: false,
  hError: false,
  wError: false
}) {
  getHeritrixErrorReport () {
    let er = this.get('hStartErReport')
    return {where: er.get('where'), message: er.get('error')}
  }

  getWaybackErrorReport () {
    let er = this.get('wStartErReport')
    return {where: er.get('where'), message: er.get('error')}
  }

  startStatus () {
    return {bothStarted: this.get('bothStarted'), hStarted: this.get('hStarted'), wStarted: this.get('wStarted')}
  }

  wasError () {
    return this.get('hError') || this.get('wError')
  }

  heritrixStarted () {
    return this.set('hStarted', true)
  }

  heritrixStartedError (hStartErReport) {
    return this.merge({hError: true, hStartErReport})
  }

  waybackStarted () {
    if (this.get('hStarted')) {
      return this.merge({wStarted: true, bothStarted: true})
    }
    return this.set('wStarted', true)
  }

  waybackStartedError (wStartErReport) {
    return this.merge({wError: true, wStartErReport})
  }

  waybackStatusMessage () {
    if (!this.get('hStarted')) {
      return lrec.waybackWaitingToStart
    } else {
      if (this.get('wStarted')) {
        return lrec.waybackWasStarted
      } else {
        return lrec.waybackWasNotStarted
      }
    }
  }

  heritrixStatusMessage () {
    if (!this.get('hStarted')) {
      return lrec.heritrixWaitingToStart
    } else {
      if (!this.get('hError')) {
        return lrec.heritrixWasStarted
      } else {
        return lrec.heritrixWasNotStarted
      }
    }
  }
}

class UIStateRecord extends Immutable.Record({archivesLoaded: false, crawlsLoaded: false}) {
  progress (action) {
    if (action.whichOne === 'Archives have loaded') {
      return this.set('archivesLoaded', true)
    } else if (action.whichOne === 'both-loaded') {
      return this.merge({
        archivesLoaded: true,
        crawlsLoaded: true
      })
    } else {
      return this.set('crawlsLoaded', true)
    }
  }

  bothLoaded () {
    return this.get('archivesLoaded') && this.get('crawlsLoaded')
  }

  archiveMessage () {
    if (this.get('archivesLoaded')) {
      return lrec.archivesLoaded
    } else {
      return lrec.archivesNotLoaded
    }
  }

  crawlMessage () {
    if (this.get('crawlsLoaded')) {
      return lrec.crawlsLoaded
    } else {
      return lrec.crawlsNotLoaded
    }
  }
}

export {
  OsCheckRecord,
  JavaCheckRecord,
  JdkDlRecord,
  SSRecord,
  UIStateRecord
}
