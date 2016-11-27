import Db from 'nedb'
import Promise from 'bluebird'
import cp from 'child_process'
import path from 'path'
import join from 'joinable'
import S from 'string'
import {remote} from 'electron'
import fs from 'fs-extra'
import moment from 'moment'
import through2 from 'through2'
import prettyBytes from 'pretty-bytes'
import _ from 'lodash'
import {execute} from '../util/childProcHelpers'
import {
  find, findOne, findOneFromBoth,
  inserAndFindAll, updateSingle,
  updateAndFindAll, CompoundNedbError
} from '../util/nedb'

S.TMPL_OPEN = '{'
S.TMPL_CLOSE = '}'

const settings = remote.getGlobal('settings')

const errorReport = (error, m) => ({
  wasError: true,
  err: error,
  message: {
    title: 'Error',
    level: 'error',
    autoDismiss: 0,
    message: m,
    uid: m
  }
})

const cleanSeeds = seeds =>
  seeds.map(seed => {
    delete seed._id
    delete seed.forCol
    return seed
  })

const transformSeeds = seedDocs =>
  _.chain(seedDocs)
    .groupBy(seed => seed.forCol)
    .mapValues(cleanSeeds)
    .value()

const joinColsSeeds = (cols, cSeeds) => {
  let colSeeds = transformSeeds(cSeeds)
  return cols.map(col => {
    if (colSeeds [ col.colName ]) {
      col.seeds = colSeeds[ col.colName ]
    } else {
      col.seeds = []
    }
    return col
  })
}

const forColWhereQ = (col) => {
  return {
    $where() {
      return this.forCol === col
    }
  }
}

const updateSingleOpts = {
  returnUpdatedDocs: true,
  multi: false
}

export default class ArchiveManager {
  constructor () {
    this.collections = new Db({
      filename: path.join(settings.get('wailCore.db'), 'archives.db'),
      autoload: true
    })

    this.colSeeds = new Db({
      filename: path.join(settings.get('wailCore.db'), 'archiveSeeds.db'),
      autoload: true
    })
  }

  initialLoad () {
    return this.getAllCollections()
  }

  createDefaultCol () {
    return new Promise((resolve, reject) => {
      // `${settings.get('warcs')}${path.sep}collections${path.sep}${col}`
      let colpath = path.join(settings.get('warcs'), 'collections', 'default')
      // description: Default Collection
      // title: Default
      let created = moment().format()
      let toCreate = {
        _id: 'default',
        name: 'default',
        colpath,
        archive: path.join(colpath, 'archive'),
        indexes: path.join(colpath, 'indexes'),
        colName: 'default',
        numArchives: 0,
        metadata: { title: 'Default', description: 'Default Collection' },
        size: '0 B',
        created,
        lastUpdated: created,
        hasRunningCrawl: false
      }
      this.collections.insert(toCreate, (err, doc) => {
        if (err) {
          reject(err)
        } else {
          resolve([ doc ])
        }
      })
    })
  }

  getAllCollections () {
    return new Promise((resolve, reject) =>
      find(this.collections, {})
        .then(cols =>
          find(this.colSeeds, {})
            .then(seeds => {
              let docs = joinColsSeeds(cols, seeds)
              if (docs.length === 0) {
                return this.createDefaultCol()
                  .then(defaultCol => {
                    resolve(defaultCol)
                  })
                  .catch(errCreateD => {
                    reject(errCreateD)
                  })
              } else {
                resolve(docs)
              }
            })
            .catch(errSeeds => {
              console.error(`Error in getAllCollections getting seeds`, errSeeds)
              return reject(errSeeds)
            })
        )
        .catch(errCol => {
          console.error(`Error in getAllCollections getting cols`, errCol)
          return reject(errCol)
        })
    )
  }

  /*
   this.db.update({ colName: forCol }, theUpdate, {}, (error, updated) => {
   if (error) {
   console.error('addCrawlInfo error', error)
   return reject(errorReport(error, `Unable to associate crawl to collection ${forCol}`))
   } else {
   return resolve(updated)
   }
   })
   */

  addCrawlInfo (confDetails) {
    let { forCol, lastUpdated, seed } = confDetails
    let colSeedIdQ = { _id: `${forCol}-${seed.url}` }
    let updateWho = { colName: forCol }
    console.log('addCrawlInfo ArchiveManager ', confDetails)
    let theUpdateCol = { $set: { lastUpdated } }
    return new Promise((resolve, reject) =>
      updateSingle(this.collections, updateWho, theUpdateCol, updateSingleOpts).then((updatedCol) =>
        findOne(this.colSeeds, colSeedIdQ)
          .then((colSeed) => {
            let findA = {
              $where() {
                return this.forCol === forCol
              }
            }
            let theUpdateColSeed
            if (colSeed) {
              theUpdateColSeed = {
                $set: { lastUpdated },
              }
              if (!colSeed.jobIds.includes(seed.jobId)) {
                theUpdateColSeed.$push = { jobIds: seed.jobId }
              }
              return updateAndFindAll(this.colSeeds, colSeedIdQ, theUpdateColSeed, updateSingleOpts, findA)
                .then((colSeeds) => {
                  console.log(colSeeds)
                  updatedCol.seeds = cleanSeeds(Array.isArray(colSeeds) ? colSeeds : [ colSeeds ])
                  console.log(updatedCol)
                  resolve({
                    colName: updatedCol.colName,
                    numArchives: updatedCol.numArchives,
                    size: updatedCol.size,
                    seeds: updatedCol.seeds,
                    lastUpdated: updatedCol.lastUpdated
                  })
                })
                .catch(CompoundNedbError, erUFA => {
                  console.error(`Error updateAndFindAll for ${forCol} seed ${seed.url}`, erUFA, erUFA.where)
                  erUFA.m = errorReport(erUFA.oError, `Error updating ${forCol}'s seed ${seed.url}`)
                  reject(erUFA)
                })
                .catch(erUFA => {
                  console.error(`Error updateAndFindAll for ${forCol} seed ${seed.url}`, erUFA)
                  erUFA.m = errorReport(erUFA, `Error updating ${forCol}'s seed ${seed.url}`)
                  reject(erUFA)
                })
            } else {
              theUpdateColSeed = {
                _id: colSeedIdQ._id,
                ...seed
              }
              return inserAndFindAll(this.colSeeds, theUpdateColSeed, findA)
                .then((colSeeds) => {
                  updatedCol.seeds = cleanSeeds(Array.isArray(colSeeds) ? colSeeds : [ colSeeds ])
                  console.log(updatedCol)
                  resolve({
                    colName: updatedCol.colName,
                    numArchives: updatedCol.numArchives,
                    size: updatedCol.size,
                    seeds: updatedCol.seeds,
                    lastUpdated: updatedCol.lastUpdated
                  })
                })
                .catch(CompoundNedbError, erUFA => {
                  console.error(`Error updateAndFindAll for ${forCol} seed ${seed.url}`, erUFA, erUFA.where)
                  erUFA.m = errorReport(erUFA.oError, `Error updating ${forCol}'s seed ${seed.url}`)
                  reject(erUFA)
                })

                .catch(erUFA => {
                  console.error(`Error updateAndFindAll for ${forCol} seed ${seed.url}`, erUFA)
                  erUFA.m = errorReport(erUFA, `Error updating ${forCol}'s seed ${seed.url}`)
                  reject(erUFA)
                })
            }
          })
          .catch(errFindCs => {
            console.error(`Error findOne for ${forCol} seed ${seed.url}`, errFindCs)
            errFindCs.m = errorReport(errFindCs, `Error updating ${forCol}'s seed ${seed.url}. It was not found for the collection`)
            reject(errFindCs)
          })
      ).catch(errUC => {
        console.error(`Error updateSingle for ${forCol} seed ${seed.url}`, errUC)
        errUC.m = errorReport(errUC.err, `Error updating ${forCol}'s seed ${seed.url}. It was not found for the collection`)
        reject(errUC)
      })
    )
  }

  addInitialMData (col, mdata) {
    let opts = {
      cwd: settings.get('warcs')
    }
    let exec = S(settings.get('pywb.addMetadata')).template({ col, metadata: join(...mdata) }).s
    return new Promise((resolve, reject) =>
      execute(exec, opts)
        .then(({ stdout, stderr }) => {
          console.log('added metadata to collection', col)
          console.log('stdout', stdout)
          console.log('stderr', stderr)
          return resolve()
        })
        .catch(({ error, stdout, stderr }) => {
          console.error(stderr)
          return reject(error)
        })
    )
  }

  updateMetadata (update) {
    console.log('updateMetaData', update)
    let { forCol, mdata } = update
    console.log('updateMetaData', forCol, mdata)
    let opts = {
      cwd: settings.get('warcs')
    }
    return new Promise((resolve, reject) => {
      let wasArray = false
      let exec = ''
      if (Array.isArray(mdata)) {
        wasArray = true
        exec = S(settings.get('pywb.addMetadata')).template({ col: forCol, metadata: update.mdataString }).s
      } else {
        exec = S(settings.get('pywb.addMetadata')).template({ col: forCol, metadata: `${mdata.k}="${mdata.v}"` }).s
      }
      console.log(exec)
      cp.exec(exec, opts, (error, stdout, stderr) => {
        console.log(stdout, stderr)
        if (error) {
          console.error(stderr)
          return reject(error)
        }
        this.collections.findOne({ colName: forCol }, { metadata: 1, _id: 0 }, (errFind, doc) => {
          if (errFind) {
            console.log('errorfind', errFind)
            return reject(errFind)
          }
          if (wasArray) {
            mdata.forEach(m => {
              let didFind = false
              let len = doc.metadata.length
              for (let i = 0; i < len; ++i) {
                if (doc.metadata[ i ].k === m.k) {
                  doc.metadata[ i ].v = m.v
                  didFind = true
                  break
                }
              }
              if (!didFind) {
                doc.metadata.push(mdata)
              }
            })
          } else {
            let didFind = false
            let len = doc.metadata.length
            for (let i = 0; i < len; ++i) {
              if (doc.metadata[ i ].k === mdata.k) {
                doc.metadata[ i ].v = mdata.v
                didFind = true
                break
              }
            }
            if (!didFind) {
              doc.metadata.push(mdata)
            }
          }

          this.collections.update({ colName: forCol }, { $set: { metadata: doc.metadata } }, (errUpdate, numUpdated) => {
            if (errUpdate) {
              console.log('errorUpdate', errFind)
              return reject(errUpdate)
            } else {
              return resolve(doc.metadata)
            }
          })
        })
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
        // { $push: { metadata: { $each: mdata } } }
        this.collections.update({ colName: col }, { $push: { metadata: { $each: mdata } } }, {}, (err, numUpdated) => {
          if (err) {
            return reject(err)
          } else {
            return resolve(numUpdated)
          }
        })
      })
    })
  }

  getColSize (col) {
    return new Promise((resolve, reject) => {
      let size = 0
      fs.walk(S(settings.get('collections.colWarcs')).template({ col }).s)
        .pipe(through2.obj(function (item, enc, next) {
          if (!item.stats.isDirectory()) this.push(item)
          next()
        }))
        .on('data', item => {
          size += item.stats.size
        })
        .on('end', () => {
          resolve(prettyBytes(size))
        })
    })
  }

  addWarcsToCol ({ col, warcs, lastUpdated, seed }) {
    console.log('add warcs to col', col, warcs, lastUpdated, seed)
    let opts = {
      cwd: settings.get('warcs')
    }
    let exec = S(settings.get('pywb.addWarcsToCol')).template({ col, warcs }).s
    let updateWho = { colName: col }
    const countAdded = (stdout, stderr) => {
      let c1 = ((stdout || ' ').match(/INFO/g) || []).length
      let c2 = ((stderr || ' ').match(/INFO/g) || []).length
      let count = c1 === 0 ? c2 : c1
      console.log('added warcs to collection', col, count)
      console.log('stdout', stdout)
      console.log('stderr', stderr)
      return count
    }
    let colSeedIdQ = { _id: `${col}-${seed.url}` }
    return new Promise((resolve, reject) =>
      execute(exec, opts, countAdded)
        .then(count =>
          this.getColSize(col).then(size => {
            let theUpdateCol = { $inc: { numArchives: count }, $set: { size, lastUpdated } }
            return updateSingle(this.collections, updateWho, theUpdateCol, updateSingleOpts)
              .then((updatedCol) =>
                findOne(this.colSeeds, colSeedIdQ)
                  .then(colSeed => {
                    let findA = {
                      $where() {
                        return this.forCol === col
                      }
                    }
                    let theUpdateColSeed
                    if (colSeed) {
                      theUpdateColSeed = {
                        $set: { lastUpdated },
                        $inc: { mementos: 1 }
                      }
                      if (!colSeed.jobIds.includes(seed.jobId)) {
                        theUpdateColSeed.$push = { jobIds: seed.jobId }
                      }
                      return updateAndFindAll(this.colSeeds, colSeedIdQ, theUpdateColSeed, updateSingleOpts, findA)
                        .then((colSeeds) => {
                          console.log(colSeeds)
                          updatedCol.seeds = cleanSeeds(Array.isArray(colSeeds) ? colSeeds : [ colSeeds ])
                          console.log(updatedCol)
                          resolve({
                            colName: updatedCol.colName,
                            numArchives: updatedCol.numArchives,
                            size: updatedCol.size,
                            seeds: updatedCol.seeds,
                            lastUpdated: updatedCol.lastUpdated
                          })
                        })
                        .catch(CompoundNedbError, erUFA => {
                          console.error(`Error updateAndFindAll for ${col} seed ${seed.url}`, erUFA, erUFA.where)
                          erUFA.m = errorReport(erUFA.oError, `Error updating ${col}'s seed ${seed.url}`)
                          reject(erUFA)
                        })
                        .catch(erUFA => {
                          console.error(`Error updateAndFindAll for ${col} seed ${seed.url}`, erUFA)
                          erUFA.m = errorReport(erUFA, `Error updating ${col}'s seed ${seed.url}`)
                          reject(erUFA)
                        })

                    } else {
                      console.error(`Error finding seed ${seed.url} for ${col} it should have been in there`)
                      let e = new Error()
                      e.m = errorReport(new Error(`Error finding seed ${seed.url} for ${col} it should have been in there`), 'Severe')
                      reject(e)
                    }
                  })
                  .catch(errFindCs => {
                    console.error(`Error findOne for ${col} seed ${seed.url}`, errFindCs)
                    errFindCs.m = errorReport(errFindCs, `Error updating ${col}'s seed ${seed.url}. It was not found for the collection`)
                    reject(errFindCs)
                  })
              )
              .catch(errorUpdateCol => {
                console.error(`Error updating ${col}`, errorUpdateCol)
                errorUpdateCol.m = errorReport(errorUpdateCol, `Unable to add warcs to non-existent collection ${col}`)
                reject(errorUpdateCol)
              })
          })
        )
        .catch(errorExecute => {
          errorExecute.m = errorReport(errorExecute, `Unable to add warcs to the collection ${col} because ${errorExecute}`)
          reject(errorExecute)
        })
    )
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
          console.error('moving templates failed for col', col, errT)
        }
        fs.copy(settings.get('collections.staticsDir'), colStatic, opts, (errS) => {
          if (errS) {
            if (errT) {
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
            console.log('moved pywbs stuff for a collection', col)
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
    let { col, metadata } = ncol
    let exec = S(settings.get('pywb.newCollection')).template({ col }).s

    return new Promise((resolve, reject) =>
      execute(exec, opts)
        .then(({ stdout, stderr }) => {
          console.log('created collection', stderr, stdout)
          // `${settings.get('warcs')}${path.sep}collections${path.sep}${col}`
          let colpath = path.join(settings.get('warcs'), 'collections', col)
          let created = moment().format()
          let toCreate = {
            _id: col, name: col, colpath, created,
            size: '0 B', lastUpdated: created,
            archive: path.join(colpath, 'archive'),
            indexes: path.join(colpath, 'indexes'),
            colName: col, numArchives: 0, metadata,
            hasRunningCrawl: false
          }
          this.collections.insert(toCreate, (err, doc) => {
            if (err) {
              reject(err)
            } else {
              resolve({
                seeds: [],
                ...doc
              })
            }
          })
        })
        .catch(({ error, stdout, stderr }) => {
          console.error(stderr, error, stdout)
          reject(error)
        })
    )
  }

  checkWarcsAndReport (forCol) {
    return new Promise((resolve, reject) => {
      this.db.findOne({ _id: forCol }, { archive: 1 }, (err, document) => {
        console.log(document)
      })
    })
  }
}
