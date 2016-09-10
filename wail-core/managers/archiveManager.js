import Db from 'nedb'
import Promise from 'bluebird'
import cp from 'child_process'
import path from 'path'
import join from 'joinable'
import S from 'string'
import { remote } from 'electron'
import util from 'util'
import fs from 'fs-extra'

S.TMPL_OPEN = '{'
S.TMPL_CLOSE = '}'

const settings = remote.getGlobal('settings')

export default class ArchiveManager {
  constructor () {
    this.db = new Db({
      filename: path.join(settings.get('wailCore.db'), 'archives.db'),
      autoload: true
    })

  }

  getAllCollections () {
    return new Promise((resolve) => {
      this.db.find({}, (err, docs)=> {
        if (err) {
          resolve({
            wasError: true,
            err
          })
        } else {
          resolve({
            wasError: false,
            docs
          })
        }
      })
    })
  }

  addCrawlInfo (colName, crawlInfo) {
    console.log('addCrawlInfo ArchiveManager ', colName, crawlInfo)
    return new Promise((resolve, reject) => {
      this.db.update({ colName }, { $push: { crawls: crawlInfo } }, {}, (error, updated) => {
        if (error) {
          console.error('addCrawlInfo error', error)
          return reject(error)
        } else {
          return resolve(updated)
        }
      })
    })
  }

  addInitialMData (col,mdata) {
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
        let metadata = []
        mdata.forEach(m => {
          let split = m.split('=')
          metadata.push({
            k: split[ 0 ],
            v: S(split[ 1 ]).replaceAll('"', '').s
          })
        })
        console.log('added metadata to collection', col)
        console.log('stdout', stdout)
        console.log('stderr', stderr)
        return resolve()
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
        let metadata = []
        mdata.forEach(m => {
          let split = m.split('=')
          metadata.push({
            k: split[ 0 ],
            v: S(split[ 1 ]).replaceAll('"', '').s
          })
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
            return resolve({
              forCol: col,
              count,
              wasError: false
            })
          }
        })
      })
    })
  }

  movePywbStuffForNewCol (col) {
    return new Promise((resolve, reject) => {
      let opts = {
        clobber: true
      }
      let colTemplate = S(settings.get('collections.colTemplate')).template({ col })
      let colStatic = S(settings.get('collections.colStatic')).template({ col })
      fs.copy(settings.get('collections.templateDir'), colTemplate, opts, (errT) => {
        if (errT) {
          console.error('moving templates failed for col',col,errT)
        }
        fs.copy(settings.get('collections.staticsDir'), colStatic, opts, (errS) => {
          if(errS) {
            if(errT) {
              reject({
                errors: 2,
                errS,
                errT
              })
            } else {
              reject({
                errors: 1,
                errS
              })
            }
          } else {
            console.log('moved pywbs stuff for a collection',col)
            resolve()
          }
        })
      })
    })
  }

  createCollection (ncol) {
    let opts = {
      cwd: settings.get('warcs')
    }
    let {
      col,
      metaData
    } = ncol
    let exec = S(settings.get('pywb.newCollection')).template({ col }).s
    return new Promise((resolve, reject) => {
      cp.exec(exec, opts, (error, stdout, stderr) => {
        if (error) {
          console.error(stderr)
          return reject(error)
        }
        console.log('created collection', stderr, stdout)
        //`${settings.get('warcs')}${path.sep}collections${path.sep}${col}`
        let colpath = path.join(settings.get('warcs'), 'collections', col)
        let toCreate = {
          _id: col,
          name: col,
          colpath,
          archive: path.join(colpath, 'archive'),
          indexes: path.join(colpath, 'indexes'),
          colName: col,
          numArchives: 0,
          metaData,
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
