import EventEmitter from 'eventemitter3'
import ElectronWorkers from 'electron-workers'
require('debug')('electron-workers')

class _Monitor extends EventEmitter {
  constructor () {
    super()
    this.workerMan = null
  }

  start () {
    if (!this.workerMan) {
      this.workerMan = ElectronWorkers({
        pathToElectron: '/home/john/my-fork-wail/node_modules/electron/dist/electron',
        connectionMode: 'ipc',
        pathToScript: '/home/john/my-fork-wail/wail-core/twitter/childMonitor.js',
        timeout: 5000,
        numberOfWorkers: 5
      })
    }
    this.workerMan.start(startError => {
      if (startError) {
        console.error(startError)
        this.emit('start-error', startError)
        return console.log('there was an error')
      }
      this.emit('started')
    })
  }

  doPing () {
    this.workerMan.execute({ someData: 'someData' }, function (err, data) {
      if (err) {
        return console.error(err)
      }
      console.log(JSON.stringify(data)) // { value: 'someData' }
    })
  }

  stop () {
    this.workerMan.kill()
  }

}

const Monitor = new _Monitor()
export default Monitor