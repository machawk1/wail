import 'babel-polyfill'
import feathers from 'feathers/client'
import hooks from 'feathers-hooks'
import primus from 'feathers-primus/client'
import engineio from 'engine.io-client'

const p = new Primus('http://localhost:3030',{
  transformer: 'engine.io',
  timeout: 120000,
  parser: 'JSON'
})


const app = feathers()
  .configure(hooks())
  .configure(primus(p))

const memgator = app.service('/archivesManager')
memgator.find({})
  .then(data => {
    console.log(data)
    // process.exit(0)
  })
  .catch(error => {
    console.error(error)
    // process.exit(0)
  })