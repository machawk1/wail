import 'babel-polyfill'
import feathers from 'feathers'
import hooks from 'feathers-hooks'
import rest from 'feathers-rest'
import config from 'feathers-configuration'
import errors from 'feathers-errors/handler'
import socketio from 'feathers-socketio'
import Primus from 'feathers-primus'
import primusResponder from 'primus-responder'
import primusEmitter from 'primus-emitter'
import primusMultiplex from 'primus-multiplex'
import primusResource from 'primus-resource'
import bodyParser from 'body-parser'
import path from 'path'
import Promise from 'bluebird'
import util from 'util'
import ElectronSettings from 'electron-settings'
import services from './services'



export default function configureSever (settings) {
  let app = feathers()
  /*
   "nedb": "../dbs",
   "timemaps": "../timemaps"
      */
  app.set('host',settings.get('wailCore.host'))
  app.set('port',settings.get('wailCore.port'))
  app.set('db',settings.get('wailCore.database'))
  app.set('timemaps',settings.get('wailCore.timemaps'))

  app.use(bodyParser.json())
    .use(bodyParser.urlencoded({ extended: true }))
    .configure(hooks())
    .configure(socketio((io) => {
      // console.log(io)
      let testns = io.of('/test')
      testns.on('connection',(socket) => {
        socket.emit('hi',{test: 'hello'})
      })
    },{ pingTimeout: 120000, timemout: 120000 }))
    .configure(services)
    .use(errors())


  const server = app.listen(app.get('port'))

  server.on('listening', () => {
    console.log(`WAIL-Core listing on ${app.get('host')}:${app.get('port')}`)
  })
}


let base = path.normalize(path.join(path.resolve('./'), 'waillogs'))
let settingsDir = path.join(base, 'wail-settings')
global.wailSettings = new ElectronSettings({ configDirPath: settingsDir })

process.on('unhandledRejection', (reason, p) => {
  console.log("Unhandled Rejection at: Promise ", p, " reason: ", reason);
})



process.on('SIGTERM', () => {
  console.log('Stopping WAIL-Core server')
  server.close(() => {
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('Stopping WAIL-Core server')
  server.close(() => {
    process.exit(0)
  })
})


// const primusConfig = {
//   transformer: 'engine.io',
//   timeout: 120000,
//   parser: 'JSON',
//   plugin: {
//     'multiplex': primusMultiplex,
//     'resource': primusResource,
//     'responder': primusResponder,
//   }
// }
// .configure(rest())
// .configure(Primus(primusConfig, primus => {
//   primus.save('/home/john/my-fork-wail/wail-core/primus.js')
// }))
