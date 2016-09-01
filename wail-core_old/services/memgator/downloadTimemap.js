import rp from 'request-promise'
import Promise from 'bluebird'
import fs from 'fs-extra'
import md5 from 'md5'

export default class DownloadTimemap {

  updateOrNew (what, newone) {
    console.log('dl timemap updateOrNew', what, newone)
    return rp({
      method: 'GET',
      uri: what.urlm,
      strictSSL: false,
      rejectUnauthorized: false,
      resolveWithFullResponse: true
    }).then(res => {
      console.log(res.headers)
      let tmPath = `${this.app.get('timemaps')}/${md5(what.url)}.timemap.${what.format}`
      fs.writeFile(tmPath, res.body, 'utf8', err => {
        if (err) {
          console.error(`writting timemap for ${what.url} as ${what.format} error`, err)
        }
      })
      let url = what.url
      let data = {
        _id: what.url,
        url,
        mementos: res.headers[ 'x-memento-count' ],
        dlTM: true,
        tmPath,
        archived: false,
        gotten: true
      }
      let p = { query: {}, provider: 'socketio' }
      if (newone) {
        return this.app.service('/memgator').create(data, p)
          .then(result => Promise.resolve(result))
          .catch(er => console.error('dl Timemap make new one', er))
      } else {
        _.unset(data, ['gotten', 'archived', '_id', 'url'])
        return this.app.service('/memgator').patch({url}, data, p)
          .then(result => Promise.resolve(result))
          .catch(er => console.error('dl Timemap update', er))
      }
    }).catch(error => {
      console.error('DownloadTimemap create error', error)
    })
  }

// POST /timemaps
  create (data, params, cb) {
    console.log('download timemaps create', data, params)
    let url = data.url
    return this.app.service('/memgator').find({ query: {url}, provider: 'socketio' })
      .then(result => {
        console.log('download timemaps create find result', result)
        let what = {
          urlm: `http://localhost:3031/timemap/${data.format}/${url}`,
          url,
          format: data.format
        }
        if (result.data.length === 0) {
          console.log('download timemaps create find result length is zero')
          return this.updateOrNew(what, true)
        } else {
          console.log('download timemaps create find result length is not zero')
          let data = result.data[ 0 ]
          if (!data.dlTM) {
            console.log('download timemaps create find result tm not downloaded already')
            return this.updateOrNew(what, false)
          } else {
            console.log('download timemaps create find result tm downloaded already')
            return Promise.resolve(result)
          }
        }
      }).catch(error => {
        console.error('download timemaps create find error', error)
      })
  }

  get (id, params) {

  }

  setup (app, path) {
    this.app = app
  }
}
