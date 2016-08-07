import feathers from 'feathers'
import hooks from 'feathers-hooks'
import rest from 'feathers-rest'
import config from 'feathers-configuration'
import socketio from 'feathers-socketio'
import bodyParser from 'body-parser'
import path from 'path'
import Promise from 'bluebird'

const app = feathers()

app.configure(config(path.join(__dirname,'..')))
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  .configure(rest())


app.use('/test',{
  get(id,params) {
    console.log(`got request ${id}`,params)
    return Promise.resolve({
      id,
      read: false,
      test: 'yo',
      createdAt: new Date().getTime()
    })
  }
})

app.listen(3030)


process.on('SIGTERM',() => {
  console.log('Stopping WAIL-Core server')
  app.close(() => {
    process.exit(0)
  })
})

process.on('SIGINT',() => {
  console.log('Stopping WAIL-Core server')
  app.close(() => {
    process.exit(0)
  })
})
