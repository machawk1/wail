import Promise from 'bluebird'
import cp from 'child_process'
import path from 'path'
import join from 'joinable'

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
        resolve(this.app.service('archives').create(toCreate))
      })
    })

  }

// PUT /messages[/<id>]
  update (id, data, params, cb) {
    console.log('archiveManager update', id, data, params)
    let opts = {
      cwd: '/home/john/my-fork-wail/archives'
    }
    if (params.query.action === 'addWarcs') {
      return new Promise((resolve, reject) => {
        let exec = `/home/john/my-fork-wail/bundledApps/pywb/wb-manager add ${id} ${data.existingWarcs}`
        cp.exec(exec, opts, (error, stdout, stderr) => {
          if (error) {
            console.error(stderr)
            return reject(error)
          }

          let c1 = ((stdout || ' ').match(/INFO/g) || []).length
          let c2 = ((stdout || ' ').match(/INFO/g) || []).length
          let count = c1 === 0 ? c2: c1

          console.log('added warcs to collection', id)
          console.log('stdout', stdout)
          console.log('stderr', stderr)
          return resolve(this.app.service('archives').update(id, { $inc: { numArchives: count } }))
        })
      })
    } else if(params.query.action === 'addMetadata') {
      return new Promise((resolve, reject) => {
        let exec = `/home/john/my-fork-wail/bundledApps/pywb/wb-manager metadata ${id} --set ${join(...data.metadata)}`
        cp.exec(exec, opts, (error, stdout, stderr) => {
          if (error) {
            console.error(stderr)
            return reject(error)
          }

          let c1 = ((stdout || ' ').match(/INFO/g) || []).length
          let c2 = ((stdout || ' ').match(/INFO/g) || []).length
          let count = c1 === 0 ? c2: c1

          console.log('added warcs to collection', id)
          console.log('stdout', stdout)
          console.log('stderr', stderr)
          return resolve(this.app.service('archives').update(id, { $inc: { numArchives: count } }))
        })
      })
    } else {
      return Promise.resolve({
        "yay": "hell yeah"
      })
    }

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