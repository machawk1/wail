export default {

  before: {
    // get(hook) {
    //   console.log('memgator get hook before',hook.id,hook.params)
    //   hook.id = normalizeUrl(hook.id)
    //   return hook
    // },
    create(hook) {
      console.log('before', hook.data,hook.params)
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