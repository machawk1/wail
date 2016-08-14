import NeDB from 'nedb'
import path from 'path'
import nedbService from 'feathers-nedb'
import hooks from './hooks/archiveHooks'
import ArchiveManager from './archiveManager'


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
  app.use('/archivesManager', new ArchiveManager())

  // app.use('/memgator/')


  console.log('archives')

  const archives = app.service('/archives')
  archives.before(hooks.before)
  archives.after(hooks.after)
}