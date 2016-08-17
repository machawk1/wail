import Promise from 'bluebird'
import cp from 'child_process'
import path from 'path'

export default class ArchiveManager {

  find (params, cb) {

  }

// GET /memgator
  //id cs.odu.edu params { query: {}, url: 'http:', provider: 'rest' }
  get (id, params, cb) {

  }

  createWithWarcs (warcs, name, glob = false) {
    let opts = {
      cwd: '/home/john/wail/archives'
    }
    let exec = '/home/john/my-fork-wail/bundledApps/pywb/wb-manager'
    if (glob) {

    } else {

    }
  }

// POST /messages
  create (data, params, cb) {
    console.log(data, params)

    let { name } = data
    let opts = {
      cwd: '/home/john/my-fork-wail/archives'
    }
    let exec = '/home/john/my-fork-wail/bundledApps/pywb/wb-manager'
    return new Promise((resolve, reject) => {
      cp.execFile(exec, [ 'init', name ], opts, (error, stdout, stderr) => {
        if (error) {
          console.error(stderr)
          reject(error)
        }
        console.log('created collection')
        let path = `/home/john/wail/archives/${name}`
        let toCreate = {
          _id: name,
          name,
          path,
          archive: `${path}/archive`,
          indexes: `${path}/indexes`,
          colName: name,
          numArchives: 0
        }
        if (Reflect.has(data, 'existingWarcs')) {
          let {existingWarcs} = data
          toCreate.existingWarcs = existingWarcs
          if(Reflect.has(data,'glob')) {
           toCreate.glob = true
          }
        }
        resolve(this.app.service('archives').create(toCreate))
      })
    })

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