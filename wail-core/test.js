import 'babel-polyfill'
import feathers from 'feathers/client'
import hooks from 'feathers-hooks'
import primus from 'feathers-primus/client'

const p = new Primus('http://localhost:3030',{
  timeout: 120000
})


const app = feathers()
  .configure(hooks())
  .configure(primus(p))

window.app = app



const memgator = app.service('/memgator')
const archives = app.service('/archivesManager')
memgator.find({})
  .then(data => {
    console.log(data)
    archives.find({})
      .then(aData => {
        console.log(aData)
      })
      .catch(aError => {
        console.log(aError)
      })
    // process.exit(0)
  })
  .catch(error => {
    console.error(error)
    // process.exit(0)
  })