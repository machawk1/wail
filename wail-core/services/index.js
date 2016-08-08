import memgator from './memgator'

export default function () {
  const app = this
  app.configure(memgator)
}