import Immutable from 'immutable'

class OsCheckRecord extends Immutable.Record({ checkDone: false, os: '', arch: '' }) {
  updateFromAction (action) {
    let { os, arch } = action
    return this.merge({ checkDone: true, os, arch })
  }
}

class JavaCheckRecord extends Immutable.Record({
  checkDone: false,
  haveJava: false,
  haveCorrectJava: false,
  download: false
}) {
  updateFromAction (action) {
    let { haveJava, haveCorrectJava, download } = action
    return this.merge({ checkDone: true, haveJava, haveCorrectJava, download })
  }

  haveReport () {
    return `Have Java: ${this.get('haveJava') ? 'Yes' : 'No'}`
  }

  haveCorrectReport () {
    return `Using 1.7: ${this.get('haveCorrectJava') ? 'Yes' : 'No'}`
  }

  downloadReport () {
    if (process.platform !== 'darwin') {
      if (!this.get('haveCorrectJava') || !this.get('haveJava')) {
        return `Need To Download 1.7: Yes But WAIL Can Use The Packaged OpenJDK`
      } else {
        return `Need To Download 1.7: No`
      }

    } else {
      return `Need To Download 1.7: ${this.get('download') ? 'Yes' : 'No'}`
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
      return this.merge({ ...stats, running: true })
    }
    return this.merge(stats)
  }

  finishedNoError () {
    return this.merge({ finished: true, error: false })
  }

  finishedError () {
    return this.merge({ finished: true, error: true })
  }
}

class SSRecord extends Immutable.Record({
  hStarted: false,
  hStartErReport: {},
  wStarted: false,
  wStartErReport: {},
  bothStarted: false,
  hError: false,
  wError: false,
}) {

  startStatus () {
    return { bothStarted: this.get('bothStarted'), hStarted: this.get('hStarted'), wStarted: this.get('wStarted') }
  }

  wasError () {
    return this.get('hError') || this.get('wError')
  }

  heritrixStarted () {
    if (this.get('wStarted' && !this.get('bothStarted'))) {
      return this.merge({ hStarted: true, bothStarted: true })
    }
    return this.set('hStarted', true)
  }

  heritrixStartedError (hStartErReport) {
    return this.merge({ hError: true, hStartErReport })
  }

  waybackStarted () {
    if (this.get('hStarted' && !this.get('bothStarted'))) {
      return this.merge({ wStarted: true, bothStarted: true })
    }
    return this.set('wStarted', true)
  }

  waybackStartedError (wStartErReport) {
    return this.merge({ wError: true, wStartErReport })
  }

  waybackStatusMessage () {
    if (!this.get('hStarted')) {
      return 'Wayback is waiting to be started'
    } else {
      if (this.get('wStarted')) {
        return 'Wayback was started'
      } else {
        return 'Wayback was not started'
      }
    }
  }

  heritrixStatusMessage () {
    if (!this.get('hStarted')) {
      return 'Heritrix is being started'
    } else {
      if (!this.get('hError')) {
        return 'Heritrix was started'
      } else {
        return 'Heritrix was not started'
      }
    }
  }
}

export {
  OsCheckRecord,
  JavaCheckRecord,
  JdkDlRecord,
  SSRecord
}