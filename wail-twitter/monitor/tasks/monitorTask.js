import EventEmitter from 'eventemitter3'
import moment from '../../../wail-core/util/momentWplugins'

export default class MonitorTask extends EventEmitter {
  constructor (dur) {
    super()
    this.stopWhen = moment().add(dur.val, dur.what).startOf('minute')
    this.task = null
  }

  poll () {

  }

  wasError (error) {
    this.stop()
    this.emit('error', error)
  }

  checkForStop () {
    if (moment().isSameOrAfter(this.stopWhen)) {
      this.stop()
    }
  }

  start (scheduler, rule = '*/5 * * * *') {
    this.task = scheduler.scheduleJob(rule, () => {
      this.poll()
    })
  }

  stop () {
    this.task.cancel()
    this.emit('done')
  }
}
