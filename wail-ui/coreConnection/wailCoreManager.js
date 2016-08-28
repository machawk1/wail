import feathers from 'feathers/client'
import socketio from 'feathers-socketio/client'
import hooks from 'feathers-hooks'
import io from 'socket.io-client'

class _WailCoreManager {
  constructor () {
    this._io = io('http://localhost:3030', { pingTimeout: 120000,timeout: 120000  })
    this._app = feathers()
      .configure(hooks())
      .configure(socketio(this._io, { pingTimeout: 120000,timeout: 120000  }))
  }

  get io () {
    return this._io
  }

  get app () {
    return this._app
  }

  getService(whichOne) {
    return this._app.service(whichOne)
  }
}

const WailCoreManager = new _WailCoreManager()

window.wcm = WailCoreManager

export default WailCoreManager
