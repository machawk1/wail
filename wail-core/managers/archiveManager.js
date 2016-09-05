import Db from 'nedb'
import Promise from 'bluebird'
import cp from 'child_process'
import path from 'path'
import join from 'joinable'
import S from 'string'
import {remote} from 'electron'
import util from 'util'

S.TMPL_OPEN = '{'
S.TMPL_CLOSE = '}'


const settings = remote.getGlobal('settings')


export default class ArchiveManager {
  constructor () {
    this.db = new Db({
      filename: path.join(settings.get('wailCore.db'),'archives.db'),
      autoload: true
    })

  }

  addCrawlInfo (col, crawlInfo) {
    return new Promise((resolve, reject) => {
      this.db.update({ col }, { $push: { crawls: crawlInfo } },{}, (error,updated) => {
        if (error) {
          reject(error)
        } else {
          resolve(updated)
        }
      })
    })
  }

  addMetadata (col, mdata) {
    let opts = {
      cwd: settings.get('warcs')
    }
    return new Promise((resolve, reject) => {
      let exec = S(settings.get('pywb.addMetadata')).template({ col, metadata: join(...mdata) }).s
      cp.exec(exec, opts, (error, stdout, stderr) => {
        if (error) {
          console.error(stderr)
          return reject(error)
        }
        let metadata = {}
        mdata.forEach(m => {
          let split = m.split('=')
          metadata[ split[ 0 ] ] = S(split[ 1 ]).replaceAll('"', '').s
        })
        console.log('added metadata to collection', col)
        console.log('stdout', stdout)
        console.log('stderr', stderr)
        //{ $push: { metadata: { $each: mdata } } }
        this.db.update({ col }, { $push: { metadata: { $each: mdata } } }, {}, (err, numUpdated) => {
          if (err) {
            return reject(err)
          } else {
            return resolve(numUpdated)
          }
        })
      })
    })
  }

  addWarcsToCol (col, warcs) {
    let opts = {
      cwd: settings.get('warcs')
    }

    return new Promise((resolve, reject) => {
      // `/home/john/my-fork-wail/bundledApps/pywb/wb-manager add ${id} ${data.existingWarcs}`
      let exec = S(settings.get('pywb.addWarcsToCol')).template({ col, warcs }).s
      cp.exec(exec, opts, (error, stdout, stderr) => {
        if (error) {
          console.error(stderr)
          return reject(error)
        }

        let c1 = ((stdout || ' ').match(/INFO/g) || []).length
        let c2 = ((stderr || ' ').match(/INFO/g) || []).length
        let count = c1 === 0 ? c2 : c1

        console.log('added warcs to collection', col)
        console.log('stdout', stdout)
        console.log('stderr', stderr)
        this.db.update({ col }, { $inc: { numArchives: count } }, {}, (err, numUpdated) => {
          if (err) {
            return reject(err)
          } else {
            return resolve(count)
          }
        })
      })
    })

  }

  createCollection (col) {
    let opts = {
      cwd: settings.get('warcs')
    }
    let exec = S(settings.get('pywb.newCollection')).template({ col }).s
    return new Promise((resolve, reject) => {
      cp.exec(exec, opts, (error, stdout, stderr) => {
        if (error) {
          console.error(stderr)
          return reject(error)
        }
        console.log('created collection')
        //`${settings.get('warcs')}${path.sep}collections${path.sep}${col}`
        let colpath = path.join(settings.get('warcs'),'collections',col)
        let toCreate = {
          _id: col,
          colpath,
          archive: path.join(colpath,'archive'),
          indexes: path.join(colpath,'indexes'),
          col,
          numArchives: 0,
          metadata: [],
          crawls: [],
          hasRunningCrawl: false
        }
        this.db.insert(toCreate, (err, doc) => {
          if (err) {
            reject(err)
          } else {
            resolve(doc)
          }
        })
      })
    })
  }

  find (query) {
    return new Promise((resolve, reject) => {
      this.db.find(query, (err, docs) => {
        if (err) {
          reject(err)
        } else {
          resolve(docs)
        }
      })
    })
  }

  findSelect (query, select) {
    return new Promise((resolve, reject) => {
      this.db.find(query, select, (err, docs) => {
        if (err) {
          reject(err)
        } else {
          resolve(docs)
        }
      })
    })
  }

  get (col) {
    return new Promise((resolve, reject) => {
      this.db.findOne(col, (err, doc) => {
        if (err) {
          reject(err)
        } else {
          resolve(doc)
        }
      })
    })
  }

  getSelect (col, select) {
    return new Promise((resolve, reject) => {
      this.db.findOne(col, select, (err, docs) => {
        if (err) {
          reject(err)
        } else {
          resolve(docs)
        }
      })
    })
  }
}
