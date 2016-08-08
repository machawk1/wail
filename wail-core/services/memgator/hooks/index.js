import rp from 'request-promise'
import util from 'util'

export default {
  after: {
    create(hook) {
      console.log(util.inspect(hook,{depth: null, colors: true}))
    }
  }
}