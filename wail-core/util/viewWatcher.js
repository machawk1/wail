import EventEmitter from 'eventemitter3'

class _ViewWatcher extends EventEmitter {
  view (from, viewing) {
    this.emit(`${from}-view`, viewing)
  }

  selected (from, selected) {
    this.emit(`${from}-selected`, selected)
  }
}

const ViewWatcher = window.vw = new _ViewWatcher()

export default ViewWatcher
