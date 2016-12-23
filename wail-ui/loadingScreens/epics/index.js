import fs from 'fs-extra'
import request from 'request'
import progress from 'request-progress'
import prettyBytes from 'pretty-bytes'
import prettySeconds from 'pretty-seconds'
import Rx from 'rxjs'
import _ from 'lodash'
import { JDK_DOWNLOAD } from '../constants'

const {DL_JDK_PROGRESS, DL_JDK_ERROR, DL_JDK_FINISHED, DL_JDK_STARTED} = JDK_DOWNLOAD

const osxJava7DMG = 'http://matkelly.com/wail/support/jdk-7u79-macosx-x64.dmg'

const makeProgress = ({time: {elapsed, remaining}, percent, speed, size: {total, transferred}}) => ({
  type: DL_JDK_PROGRESS,
  stats: {
    elapsed: prettySeconds(elapsed),
    remaining: remaining === null ? 'infinity' : prettySeconds(remaining),
    percent: Math.round(percent * 100),
    speed: `${prettyBytes(speed === null ? 0 : speed)}/s`,
    totalSize: prettyBytes(total),
    transferred: prettyBytes(transferred)
  }
})

const DownloadJDKOb$ = Rx.Observable.create(function dlJDK (observer) {
  if (!this.dler) {
    console.log('dler not created')
    this.dler = {
      monitoring: null,
      working: false
    }
  } else {
    console.log('dler created')
  }

  if (!this.dler.working) {
    console.log('not working')
    this.dler.working = true
    this.dler.monitoring = progress(request(osxJava7DMG))
      .on('progress', (prog) => {
        observer.next(makeProgress(prog))
      })
      .on('error', (error) => {
        console.error('download error', error)
        this.dler.working = false
        observer.next({
          type: DL_JDK_ERROR,
          error
        })
      })
      .on('end', () => {
        this.dler.working = false
        observer.next({
          type: DL_JDK_FINISHED
        })
      })
      .pipe(fs.createWriteStream('/tmp/java7.dmg'))
  } else {
    console.log('were working')
  }
})

const downloadJdkEpic = action$ =>
  action$.ofType(DL_JDK_STARTED)
    .delay(1000)
    .mergeMap(
      action =>
        DownloadJDKOb$.map(_.identity)
    )

export default downloadJdkEpic