import EventEmitter from 'eventemitter3'
import moment from 'moment'

const levelToHuman = {
  60: 'Fatal',
  50: 'Error',
  40: 'Warning',
  30: 'Info',
  20: 'Info',
  10: 'Info'
}

export default class RingBuffer extends EventEmitter {
  constructor (limit = 100) {
    super()
    this.limit = limit
    this.writable = true
    this.records = []
    this.shoulEmit = false
  }

  write (bunyanLog) {
    if (!this.writable) {
      throw new Error('RingBuffer has been ended already')
    }
    this.records.unshift(bunyanLog)
    if (this.records.length > this.limit) {
      this.records.pop()
    }
    if (this.shoulEmit) {
      this.emit('new-record')
    }

    return true
  }

  onNewRecord (handler) {
    this.shoulEmit = true
    this.on('new-record', handler)
  }

  unListenNewRecord (handler) {
    this.shoulEmit = false
    this.addListener('new-record', handler)
  }

  momentizeRecords () {
    return this.records.map(e => ({
      lvl: levelToHuman[ e.level ],
      time: moment(e.time),
      msg: e.msg
    }))
  }

  end () {
    if (arguments.length > 0)
      this.write.apply(this, Array.prototype.slice.call(arguments))
    this.writable = false
  }

  destroy () {
    this.writable = false
    this.emit('close')
  }

  destroySoon () {
    this.destroy()
  }
}