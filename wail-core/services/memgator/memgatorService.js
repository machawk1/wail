import NeDB from 'nedb'
import path from 'path'
import hooks from './hooks/memgatorHooks'
import nedbService from 'feathers-nedb'
import DLTimemap from './downloadTimemap'
import MemgatorPather from './memgatorPather'
import rewrite from 'express-urlrewrite'
import notFound from 'feathers-errors/not-found'


export default function () {
  const app = this
  const db = new NeDB({
    filename: path.join(app.get('db'), 'memento.db'),
    autoload: true
  })

  const dbOptions = {
    Model: db,
    paginate: {
      default: 5,
      max: 100
    }
  }

  app.use('/memgator', nedbService(dbOptions))
  app.use('/memgator/:proto://:url', new MemgatorPather())
  app.use('/timemap', new DLTimemap())

  // app.use('/memgator/')


  console.log('memgator')

  const memgatorDbService = app.service('/memgator')
  memgatorDbService.before(hooks.db.before)
  memgatorDbService.after(hooks.db.after)

}