import NeDB from 'nedb'
import path from 'path'
import hooks from './hooks/heritrixHooks'
import nedbService from 'feathers-nedb'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

export default function () {
  const app = this
  const db = new NeDB({
    filename: path.join(app.get('nedb'), 'crawls.db'),
    autoload: true
  })

  let dbOptions = {
    Model: db,
    paginate: {
      default: 5,
      max: 25
    }
  }

  app.use('/crawls', nedbService(dbOptions))

  console.log('memgator')
}
