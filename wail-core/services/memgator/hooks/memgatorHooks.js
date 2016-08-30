import rp from 'request-promise'
import util from 'util'
import normalizeUrl from 'normalize-url'
import _ from 'lodash'
import S from 'string'
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
  db: {
    before: {
      // get(hook) {
      //   console.log('memgator get hook before',hook.id,hook.params)
      //   hook.id = normalizeUrl(hook.id)
      //   return hook
      // },
      create (hook) {
        console.log('before', hook.data)
        if (hook.data.gotten) {
          delete hook.data.gotten
          return hook
        } else {
          return rp({
            method: 'HEAD',
            uri: `http://localhost:3031/timemap/json/${hook.data.url}`
          }).then(res => {
            console.log('got res', res)
            hook.data._id = hook.data.url
            hook.data.mementos = res[ 'x-memento-count' ]
            hook.data.dlTM = false
            hook.data.tmPath = ''
            hook.data.archived = false
            return hook
          }).catch(error => {
            console.error('memgator create hook error', error)
          })
        }
      }
      // update(hook) {
      //   hook.id = normalizeUrl(hook.id)
      //   return hook
      // },

    },
    after: {
      create (hook) {
        console.log('after', hook.data)
      }
      // update(hook) {
      //
      // }
    }
  }

}
