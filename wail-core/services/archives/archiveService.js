import NeDB from 'nedb'
import path from 'path'
import nedbService from 'feathers-nedb'


export default function () {
  const app = this
  const db = new NeDB({
    filename: path.join(app.get('nedb'), 'archives.db'),
    autoload: true
  })

  const dbOptions = {
    Model: db,
    paginate: {
      default: 5,
      max: 100
    }
  }

  app.use('/archives', nedbService(dbOptions))

  // app.use('/memgator/')


  console.log('memgator')

  const memgatorDbService = app.service('/archives')
  memgatorDbService.before(hooks.db.before)
  memgatorDbService.after(hooks.db.after)

}