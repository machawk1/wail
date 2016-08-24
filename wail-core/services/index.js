import memgator from './memgator/memgatorService'
import archives from './archives/archiveService'
import util from 'util'
export default function () {
  const app = this
  console.log(util.inspect(app,{depth: null, colors: true}))
  app.configure(memgator)
  app.configure(archives)
}