import NeDB from 'nedb'
import path from 'path'
import hooks from './hooks'
import nedbService from 'feathers-nedb'


export default function () {
  const app = this
  const db = new NeDB({
    filename: path.join(app.get('nedb'), 'memento.db'),
    autoload: true
  })

  let dbOptions = {
    Model: db,
    paginate: {
      default: 5,
      max: 25
    }
  }

  app.use('/memgator',nedbService(dbOptions))

  console.log('memgator')

  let memgatorService = app.service('/memgator')
  // console.log(memgatorService)


  memgatorService.before(hooks.before)
  memgatorService.after(hooks.after)

}