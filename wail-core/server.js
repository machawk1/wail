import 'babel-polyfill'
import feathers from 'feathers'
import hooks from 'feathers-hooks'
import rest from 'feathers-rest'
import config from 'feathers-configuration'
import errors from 'feathers-errors/handler'
import socketio from 'feathers-socketio'
import bodyParser from 'body-parser'
import path from 'path'
import Promise from 'bluebird'
import util from 'util'
import ElectronSettings from 'electron-settings'
import services from './services'

let base = path.normalize(path.join(path.resolve('./'),'waillogs'))
let settingsDir = path.join(base, 'wail-settings')
global.wailSettings = new ElectronSettings({ configDirPath: settingsDir })

process.on('unhandledRejection', (reason, p) => {
  console.log("Unhandled Rejection at: Promise ", p, " reason: ", reason);
})

const app = feathers()

app.configure(config(__dirname))
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  .configure(hooks())
  // .configure(rest())
  .configure(socketio({ pingTimeout: 120000 }))
  .configure(services)
  .use(errors())

const server = app.listen(app.get('port'))

server.on('listening', () => {
  console.log(`WAIL-Core listing on ${app.get('host')}:${app.get('port')}`)
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
