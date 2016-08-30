import feathers from 'feathers/client'
import socketio from 'feathers-socketio/client'
import hooks from 'feathers-hooks'
import io from 'socket.io-client'

export function makeConnection (settings) {
  const socket = global.io = io('http://localhost:3030', { pingTimeout: 120000, timeout: 120000 })
  const app = global.app = feathers()
  .configure(hooks())
  .configure(socketio(socket, { pingTimeout: 120000, timeout: 120000 }))
}

