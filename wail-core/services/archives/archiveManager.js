import Promise from 'bluebird'
import cp from 'child_process'

export default class ArchiveManager {

  find (params, cb) {

  }

// GET /memgator
  //id cs.odu.edu params { query: {}, url: 'http:', provider: 'rest' }
  get (id, params, cb) {

  }

// POST /messages
  create (data, params, cb) {
    console.log(data, params)
    return Promise.resolve({
      yay: 'yes!'
    })
    // let opts = {
    //   cwd: '/home/john/wail/archives'
    // }
    //
    // let exec = '/home/john/wail/bundledApps/pywb/wbManager'
    // return new Promise((resolve, reject) => {
    //   cp.execFile(exec, [ 'init', data.name ], opts, (error, stdout, stderr) => {
    //     if (error) {
    //       console.error(stderr)
    //       reject(error)
    //     }
    //
    //     console.log(stdout)
    //     resolve(this.app.service('archives').create({
    //       path: `/home/john/wail/archives/collections/${data.name}`,
    //       colName: data.name,
    //       numArchives: 0
    //     }))
    //   })
    // })
  }

// PUT /messages[/<id>]
  update (id, data, params, cb) {

  }

// PATCH /messages[/<id>]
  patch (id, data, params, cb) {

  }

// DELETE /messages[/<id>]
  remove (id, params, cb) {

  }

  setup (app, path) {
    this.app = app
  }
}