import memgator from './memgator/memgatorService'

export default function () {
  const app = this
  app.configure(memgator)
}