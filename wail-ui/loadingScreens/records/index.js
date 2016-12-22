import Immutable from 'immutable'

class OsCheckRecord extends Immutable.Record({checkDone: false, os: '', arch: ''}) {
  updateFromAction (action) {
    let {os, arch} = action
    return this.merge({checkDone: true, os, arch})
  }
}

class JavaCheckRecord extends Immutable.Record({
  checkDone: false,
  haveJava: false,
  haveCorrectJava: false,
  download: false
}) {
  updateFromAction (action) {
    let {haveJava, haveCorrectJava, download} = action
    return this.merge({checkDone: true, haveJava, haveCorrectJava, download})
  }

  haveReport () {
    return `Have Java: ${this.get('haveJava') ? 'Yes' : 'No'}`
  }

  haveCorrectReport () {
    return `Using 1.7: ${this.get('haveCorrectJava') ? 'Yes' : 'No'}`
  }

  downloadReport () {
    return `Need To Download 1.7: ${this.get('download') ? 'Yes' : 'No'}`
  }

}

export {
  OsCheckRecord,
  JavaCheckRecord
}