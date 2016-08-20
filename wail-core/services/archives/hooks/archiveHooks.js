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

    // update(hook) {
    //   hook.id = normalizeUrl(hook.id)
    //   return hook
    // },

    create(hook) {
      console.log('after', hook.data)
    },

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

// create(hook) {
//   console.log('before', hook.data)
//   let exec = '/home/john/my-fork-wail/bundledApps/pywb/wb-manager'
//   let {data} = hook
//   if (Reflect.has(data, 'existingWarcs')) {
//     return new Promise((resolve,reject) => {
//       let {existingWarcs} = data
//       if(Array.isArray(existingWarcs)) {
//         existingWarcs = join(...existingWarcs)
//       }
//       cp.exec(exec,['add',data.name, existingWarcs], {cwd:'/home/john/wail/archives' },(error, stdout, stderr) => {
//         _.unset(data, 'existingWarcs')
//         if(error) {
//           hook.data.addError = true
//           console.error('arhciveHooks create add warcs error')
//           console.error(error)
//           console.error(stderr)
//           reject(hook)
//         }  else {
//           console.log(stdout)
//         }
//        resolve(hook)
//       })
//     })
//   } else {
//     return hook
//   }
// },