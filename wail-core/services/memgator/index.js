import NeDB from 'nedb'
import path from 'path'
import service from 'feathers-nedb'
import hooks from './hooks'

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

  app.use('/memgator',service(dbOptions))

  console.log('memgator')

  const memgatorService = app.service('/memgator')
  memgatorService.after(hooks.after)
  memgatorService.create({
    url: 'http://cs.odu.edu/~jberlin',
    mementos: 2
  }).then(mementos => {
    console.log('created memento',mementos)
  })
}