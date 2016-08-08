import rp from 'request-promise'
import util from 'util'
/*
 rp({
 uri: `http://localhost:3031/timemap/json/${url}`,
 method: 'HEAD'
 })
 .then(res =>{
 console.log(res)
 }).catch(error => {
 console.error(error)
 })
 */
export default {
  before: {
    create(hook) {
      console.log('before',hook.data)
      return rp({
        uri: `http://localhost:3031/timemap/json/${hook.data.url}`,
        method: 'HEAD'
      }).then(res => {
        console.log('got res',res)
        hook.data.mementos = res['x-memento-count']
        return hook
      })
    }
  },
  after: {
    create(hook) {
        console.log('after',hook.data)
    }
  }
}