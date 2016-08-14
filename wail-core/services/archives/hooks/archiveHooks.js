import cp from 'child_process'
import join from 'joinable'
import path from 'path'
import _ from 'lodash'
import Promise from 'bluebird'

export default {

  before: {
    // get(hook) {
    //   console.log('memgator get hook before',hook.id,hook.params)
    //   hook.id = normalizeUrl(hook.id)
    //   return hook
    // },
    create(hook) {
      console.log('before', hook.data)
      let opts = {
        cwd: '/home/john/my-fork-wail/archives'
      }
      let exec = '/home/john/my-fork-wail/bundledApps/pywb/wbManager'
      let {data} = hook
      if (Reflect.has(data, 'existingWarcs')) {
        return new Promise((resolve,reject) => {
          let {existingWarcs} = data
          if(Array.isArray(existingWarcs)) {
            existingWarcs = join(...existingWarcs)
          }
          cp.execFile(exec,['add',data.name, existingWarcs], opts, (error, stdout, stderr) => {
            _.unset(data, 'existingWarcs')
            if(error) {
              data.addError = true
              reject(error)
            }  else {
              console.log(stdout)
            }
           resolve(hook)
          })
        })
      } else {
        return hook
      }
    },
    // update(hook) {
    //   hook.id = normalizeUrl(hook.id)
    //   return hook
    // },

  },
  after: {
    create(hook) {
      console.log('after', hook.data)

    },
    // update(hook) {
    //
    // }
  }

}