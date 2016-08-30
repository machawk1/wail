import Promise from 'bluebird'

/*
 WAIL-Core listing on localhost:3030
 Memgator pather { query: {}, proto: 'http', url: 'cs.odu.edu', provider: 'rest' }
 { id: 'http://cs.odu.edu' } { query: {}, provider: 'rest' }
 memgator get hook before { id: 'http://cs.odu.edu' } { query: {}, provider: 'rest' }
 www.cs.odu.edu { query: {}, provider: 'rest' }
 memgator get hook before www.cs.odu.edu { query: {}, provider: 'rest' }
 memgator get hook after http://cs.odu.edu { query: {}, provider: 'rest' }
 */

export default class MemgatorPather {
  find (params, cb) {
    console.log('Memgator pather find', params)
    let url = `${params.proto}://${params.url}`
    let mp = {
      query: params.query,
      provider: 'rest'
    }
    return this.app.service('/memgator').get(url, mp, cb)
      .then(result => {
        console.log('Memgator pather find then', result)
        return Promise.resolve(result)
      }).catch(error => {
        console.error('MemgatorPather find error', error)
      })
  }

// GET /memgator
  // id cs.odu.edu params { query: {}, url: 'http:', provider: 'rest' }
  get (id, params, cb) {
    console.log('memgator pather get id', id, 'params', params)
    let url = `${params.proto}://${params.url}/${id}`
    let mp = {
      query: params.query,
      provider: 'rest'
    }
    return this.app.service('/memgator').get(url, mp, cb)
      .then(result => {
        console.log('Memgator pather get then', result)
        return Promise.resolve(result)
      }).catch(error => {
        console.error('MemgatorPather get error', error)
      })
  }

// POST /messages
  create (data, params, cb) {
    console.log('memgator pather create data', data, 'params', params)
    return this.app.service('/memgator').create(data, params, cb)
      .then(result => {
        return Promise.resolve(result)
      }).catch(error => {
        console.error('memgator pather create error', error)
      })
  }

// PUT /messages[/<id>]
  update (id, data, params, cb) {
    let url = `${params.proto}://${params.url}/${id}`
    let mp = {
      query: params.query,
      provider: 'rest'
    }
    return this.app.service('/memgator').update(url, data, mp, cb)
      .then(result => {
        console.log('Memgator pather update  then', result)
        return Promise.resolve(result)
      }).catch(error => {
        console.error('MemgatorPather update  error', error)
      })
  }

// PATCH /messages[/<id>]
  patch (id, data, params, cb) {
    let url = `${params.proto}://${params.url}/${id}`
    let mp = {
      query: params.query,
      provider: 'rest'
    }
    return this.app.service('/memgator').patch(url, data, mp, cb)
      .then(result => {
        console.log('Memgator pather patch  then', result)
        return Promise.resolve(result)
      }).catch(error => {
        console.error('MemgatorPather patch  error', error)
      })
  }

// DELETE /messages[/<id>]
  remove (id, params, cb) {
    let url = `${params.proto}://${params.url}/${id}`
    let mp = {
      query: params.query,
      provider: 'rest'
    }
    return this.app.service('/memgator').remove(url, data, mp, cb)
      .then(result => {
        console.log('Memgator pather patch  then', result)
        return Promise.resolve(result)
      }).catch(error => {
        console.error('MemgatorPather patch  error', error)
      })
  }

  setup (app, path) {
    this.app = app
  }
}
