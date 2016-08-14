import memgator from './memgator/memgatorService'
import archives from './archives/archiveService'

export default function () {
  const app = this
  app.configure(memgator)
  app.configure(archives)
}