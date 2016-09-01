import EventEmitter from 'eventemitter3'

class _ViewWatcher extends EventEmitter {
  view (from, viewing) {
    this.emit(`${from}-view`, viewing)
  }
}

const ViewWatcher = new _ViewWatcher()

export default ViewWatcher
