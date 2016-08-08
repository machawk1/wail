import 'babel-polyfill'
import feathers from 'feathers'
import hooks from 'feathers-hooks'
import rest from 'feathers-rest'
import config from 'feathers-configuration'
import socketio from 'feathers-socketio'
import bodyParser from 'body-parser'
import path from 'path'
import Promise from 'bluebird'
import services from './services'

const app = feathers()

app.configure(config(__dirname))
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  .configure(hooks())
  .configure(rest())
  .configure(services)


app.listen(app.get('port'))

app.on('listening', () => {
  console.log(`WAIL-Core listing on ${app.get('host')}:${app.get('port')}`)
})

process.on('SIGTERM', () => {
  console.log('Stopping WAIL-Core server')
  app.close(() => {
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('Stopping WAIL-Core server')
  app.close(() => {
    process.exit(0)
  })
})
