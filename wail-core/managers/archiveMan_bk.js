import Db from 'nedb'
import Promise from 'bluebird'
import cp from 'child_process'
import path from 'path'
import join from 'joinable'
import S from 'string'
import { remote, ipcRenderer as ipc } from 'electron'
import fs from 'fs-extra'
import moment from 'moment'
import through2 from 'through2'
import prettyBytes from 'pretty-bytes'
import _ from 'lodash'
import { execute } from '../util/childProcHelpers'
import {
  find, findOne, insert,
  inserAndFindAll, updateSingle, remove,
  updateAndFindAll, CompoundNedbError
} from '../util/nedb'
import moveStartingCol from '../util/moveStartingCol'

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
    if (colSeeds[col.colName]) {
      col.seeds = colSeeds[col.colName]
    } else {
      col.seeds = []
    }
    return col
  })
}

const foundSeedChecker = (colSeeds) => {
  if (colSeeds) {
    if (Array.isArray(colSeeds)) {
      return colSeeds.length > 0
    } else {
      return true
    }
  } else {
    return false
  }
}

const updateSingleOpts = {
  returnUpdatedDocs: true,
  multi: false
}

const firstTimeMoveCollectionsPath = () => {
  if (process.platform === 'win32') {
    return settings.get('iwarcs')
  } else {
    return `${settings.get('iwarcs')}`
  }
}

const checkCollExistence = () => new Promise((resolve, reject) => {
  fs.stat(settings.get('warcs'), (err, stats) => {
    if (err) {
      resolve(false)
    } else {
      fs.stat(path.join(settings.get('warcs'), 'collections'), (err2, stats) => {
        if (err2) {
          resolve(false)
        } else {
          resolve(true)
        }
      })
    }
  })
})

const missingBackUpPath = () => {
  switch (process.platform) {
    case 'darwin':
      return '~/Library/Application Support/WAIL/database'
    case 'linux':
      return '~/.config/WAIL/database'
    default:
      return '%APPDATA%/WAIL/database'
  }
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

  _backUpDbs () {
    const backUpTime = new Date().getTime()
    const oa = path.join(settings.get('wailCore.db'), 'archives.db')
    const oas = path.join(settings.get('wailCore.db'), 'archiveSeeds.db')
    const message = `${settings.get('collections.dir')} was not found on the filesystem after creating it. WAIL has backed up previous settings found at ${missingBackUpPath()} and recreated this directory.`
    ipc.send('display-message', {
      title: 'Collections directory no longer exists',
      level: 'error',
      autoDismiss: 0,
      message,
      uid: message
    })
    return new Promise((resolve, reject) => {
      fs.copy(oa, `${oa}.${backUpTime}.bk`, (err1) => {
        fs.copy(oas, `${oas}.${backUpTime}.bk`, (err) => {
          this.collections.remove({}, {multi: true}, (err2, rmc) => {
            this.colSeeds.remove({}, {multi: true}, (err3, rmc2) => {
              resolve(rmc + rmc)
            })
          })
        })
      })
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
        metadata: {title: 'Default', description: 'Default Collection'},
        size: '0 B',
        created,
        lastUpdated: created,
        hasRunningCrawl: false
      }
      this.collections.insert(toCreate, (err, doc) => {
        if (err) {
          reject(err)
        } else {
          doc.seeds = []
          resolve([doc])
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
                  .then(defaultCol =>
                    moveStartingCol(firstTimeMoveCollectionsPath(), settings.get('warcs'))
                      .then(() => {
                        resolve(defaultCol)
                      })
                      .catch(errMove => {
                        if (errMove.where === 1) {
                          console.error('big fail', errMove)
                          reject(errMove)
                        } else if (errMove.where === 2) {
                          console.error('even bigger fail', errMove)
                          reject(errMove)
                        } else {
                          resolve(defaultCol)
                        }
                      }))
                  .catch(errCreateD => {
                    reject(errCreateD)
                  })
              } else {
                return checkCollExistence().then(exists => {
                  if (exists) {
                    resolve(docs)
                  } else {
                    return this._backUpDbs().then(() =>
                      this.createDefaultCol().then(defaultCol =>
                        moveStartingCol(firstTimeMoveCollectionsPath(), settings.get('warcs'))
                          .then(() => { resolve(defaultCol) })
                          .catch(errMove => {
                            if (errMove.where === 1) {
                              console.error('big fail', errMove)
                              reject(errMove)
                            } else if (errMove.where === 2) {
                              console.error('even bigger fail', errMove)
                              reject(errMove)
                            } else {
                              resolve(defaultCol)
                            }
                          })
                      )
                    )
                  }
                })
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

  addCrawlInfo (confDetails) {
    let {forCol, lastUpdated, seed} = confDetails
    let colSeedIdQ = {_id: `${forCol}-${seed.url}`}
    let updateWho = {colName: forCol}
    console.log('addCrawlInfo ArchiveManager ', confDetails)
    let theUpdateCol = {$set: {lastUpdated}}
    return new Promise((resolve, reject) =>
      updateSingle(this.collections, updateWho, theUpdateCol, updateSingleOpts).then((updatedCol) =>
        findOne(this.colSeeds, colSeedIdQ)
          .then((colSeed) => {
            let findA = {
              $where () {
                return this.forCol === forCol
              }
            }
            let theUpdateColSeed
            if (foundSeedChecker(colSeed)) {
              console.log('the seed was present')
              theUpdateColSeed = {
                $set: {lastUpdated}
              }
              if (!colSeed.jobIds.includes(seed.jobId)) {
                theUpdateColSeed.$push = {jobIds: seed.jobId}
              }
              return updateAndFindAll(this.colSeeds, colSeedIdQ, theUpdateColSeed, updateSingleOpts, findA)
                .then((colSeeds) => {
                  console.log(colSeeds)
                  updatedCol.seeds = cleanSeeds(Array.isArray(colSeeds) ? colSeeds : [colSeeds])
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
              console.log('the seed was not present')
              seed._id = colSeedIdQ._id
              return inserAndFindAll(this.colSeeds, seed, findA)
                .then((colSeeds) => {
                  console.log(`the new seeds for col ${forCol}`, colSeeds)
                  updatedCol.seeds = cleanSeeds(Array.isArray(colSeeds) ? colSeeds : [colSeeds])
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
    let exec = S(settings.get('pywb.addMetadata')).template({col, metadata: join(...mdata)}).s
    return new Promise((resolve, reject) =>
      execute(exec, opts)
        .then(({stdout, stderr}) => {
          console.log('added metadata to collection', col)
          console.log('stdout', stdout)
          console.log('stderr', stderr)
          return resolve()
        })
        .catch(({error, stdout, stderr}) => {
          console.error(stderr)
          return reject(error)
        })
    )
  }

  updateMetadata (update) {
    console.log('updateMetaData', update)
    let {forCol, mdata} = update
    console.log('updateMetaData', forCol, mdata)
    let opts = {
      cwd: settings.get('warcs')
    }
    return new Promise((resolve, reject) => {
      let exec = S(settings.get('pywb.addMetadata')).template({col: forCol, metadata: update.mdataString}).s
      console.log(exec)
      cp.exec(exec, opts, (error, stdout, stderr) => {
        console.log(stdout, stderr)
        if (error) {
          console.error(stderr)
          return reject(error)
        }
        this.collections.findOne({colName: forCol}, {metadata: 1, _id: 0}, (errFind, doc) => {
          if (errFind) {
            console.log('errorfind', errFind)
            return reject(errFind)
          }
          _.toPairs(update.mdata).forEach(([mk, mv]) => {
            doc.metadata[mk] = mv
          })
          this.collections.update({colName: forCol}, {$set: {metadata: doc.metadata}}, (errUpdate, numUpdated) => {
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
      let exec = S(settings.get('pywb.addMetadata')).template({col, metadata: join(...mdata)}).s
      cp.exec(exec, opts, (error, stdout, stderr) => {
        if (error) {
          console.error(stderr)
          return reject(error)
        }
        let metadata = {}
        let swapper = S('')
        mdata.forEach(m => {
          let [mk, mv] = m.split('=')
          metadata[mk] = swapper.setValue(mv).replaceAll('"', '').s
        })
        console.log('added metadata to collection', col)
        console.log('stdout', stdout)
        console.log('stderr', stderr)
        // { $push: { metadata: { $each: mdata } } }
        this.collections.update({colName: col}, {$set: {metadata: {...metadata}}}, {}, (err, numUpdated) => {
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
      fs.walk(S(settings.get('collections.colWarcs')).template({col}).s)
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

  addMultiWarcToCol (multi) {
    console.log('adding multi seeds to col', multi)
    let {lastUpdated, col, seedWarcs} = multi
    let opts = {cwd: settings.get('warcs')}
    let updateWho = {colName: col}
    let seeds = []
    let ws = []
    seedWarcs.forEach(sw => {
      seeds.push(sw.seed)
      ws.push(sw.warcs)
    })
    const addMulti = wpath => {
      let exec = S(settings.get('pywb.addWarcsToCol')).template({col, warcs: wpath}).s
      console.log('adding the warc at path to col', wpath)
      return execute(exec, opts)
    }
    const updateSeedMulti = seed => {
      console.log('updating seed', seed)
      let colSeedIdQ = {_id: `${col}-${seed.url}`}
      return findOne(this.colSeeds, colSeedIdQ)
        .then(colSeed => {
          let theUpdateColSeed
          if (foundSeedChecker(colSeed)) {
            console.log('it existed')
            theUpdateColSeed = {
              $set: {lastUpdated},
              $inc: {mementos: 1}
            }
            if (!colSeed.jobIds.includes(seed.jobId)) {
              theUpdateColSeed.$push = {jobIds: seed.jobId}
            }
            return updateSingle(this.collections, colSeedIdQ, theUpdateColSeed, updateSingleOpts)
          } else {
            console.log('it did not exist')
            seed._id = colSeedIdQ._id
            return insert(this.collections, seed)
          }
        })
    }
    let findA = {
      $where () {
        return this.forCol === col
      }
    }
    return new Promise((resolve, reject) =>
      Promise.map(ws, addMulti, {concurrency: 1})
        .then(allAdded => this.getColSize(col)
          .then(size => {
            let theUpdateCol = {$inc: {numArchives: ws.length}, $set: {size, lastUpdated}}
            return updateSingle(this.collections, updateWho, theUpdateCol, updateSingleOpts)
              .then((updatedCol) => Promise.map(seeds, updateSeedMulti, {concurrency: 1})
                .then(allSeedUpdated => find(this.collections, findA)
                  .then(allColSeeds => {
                    updatedCol.seeds = cleanSeeds(Array.isArray(allColSeeds) ? allColSeeds : [allColSeeds])
                    console.log(updatedCol)
                    resolve({
                      colName: updatedCol.colName,
                      numArchives: updatedCol.numArchives,
                      size: updatedCol.size,
                      seeds: updatedCol.seeds,
                      lastUpdated: updatedCol.lastUpdated
                    })
                  })
                  .catch(errorfa => {
                    console.error(errorfa)
                    console.log('finding all cols seeds')
                    errorfa.m = 'Update multi failed at finding all cols seeds'
                    reject(errorfa)
                  })
                )
                .catch(errorusm => {
                  console.error(errorusm)
                  console.log('error updating multi seeds')
                  errorusm.m = 'Update multi failed at updating multi seeds'
                  reject(errorusm)
                })
              )
              .catch(errorUC => {
                console.error(errorUC)
                console.log('error updating the col', col)
                errorUC.m = 'Update multi failed at updating the col'
                reject(errorUC)
              })
          })
        )
        .catch(error => {
          error.m = 'Adding multi failed'
          reject(error)
        })
    )
  }

  addWarcsFromWCreate ({col, warcs, lastUpdated, seed}) {
    console.log('addfs warcs to col', col, warcs, lastUpdated, seed)
    let opts = {
      cwd: settings.get('warcs')
    }
    let exec = S(settings.get('pywb.reindexCol')).template({col}).s
    let updateWho = {colName: col}
    let colSeedIdQ = {_id: `${col}-${seed.url}`}
    return new Promise((resolve, reject) =>
      execute(exec, opts).then(({stdout, stderr}) =>
        this.getColSize(col).then(size => {
          console.log(stdout, stderr)
          let theUpdateCol = {$inc: {numArchives: 1}, $set: {size, lastUpdated}}
          console.log(theUpdateCol)
          return updateSingle(this.collections, updateWho, theUpdateCol, updateSingleOpts).then((updatedCol) =>
            findOne(this.colSeeds, colSeedIdQ).then(colSeed => {
              let findA = {
                $where () {
                  return this.forCol === col
                }
              }
              let theUpdateColSeed
              if (foundSeedChecker(colSeed)) {
                theUpdateColSeed = {
                  $set: {lastUpdated},
                  $inc: {mementos: 1}
                }
                if (!colSeed.jobIds.includes(seed.jobId)) {
                  theUpdateColSeed.$push = {jobIds: seed.jobId}
                }
                return updateAndFindAll(this.colSeeds, colSeedIdQ, theUpdateColSeed, updateSingleOpts, findA)
                  .then((colSeeds) => {
                    console.log(colSeeds)
                    updatedCol.seeds = cleanSeeds(Array.isArray(colSeeds) ? colSeeds : [colSeeds])
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
                    erUFA.oError.m = errorReport(erUFA.oError, `Error updating ${col}'s seed ${seed.url}`)
                    reject(erUFA.oError)
                  })
                  .catch(erUFA => {
                    console.error(`Error updateAndFindAll for ${col} seed ${seed.url}`, erUFA)
                    erUFA.m = errorReport(erUFA, `Error updating ${col}'s seed ${seed.url}`)
                    reject(erUFA)
                  })
              } else {
                console.log('the seed was not present')
                seed._id = colSeedIdQ._id
                seed.mementos = 1
                seed.jobIds = [seed.jobId]
                return inserAndFindAll(this.colSeeds, seed, findA)
                  .then((colSeeds) => {
                    console.log(`the new seeds for col ${col}`, colSeeds)
                    updatedCol.seeds = cleanSeeds(Array.isArray(colSeeds) ? colSeeds : [colSeeds])
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
                    erUFA.oError.m = errorReport(erUFA.oError, `Error updating ${col}'s seed ${seed.url}`)
                    reject(erUFA.oError)
                  })
                  .catch(erUFA => {
                    console.error(`Error updateAndFindAll for ${col} seed ${seed.url}`, erUFA)
                    erUFA.m = errorReport(erUFA, `Error updating ${col}'s seed ${seed.url}`)
                    reject(erUFA)
                  })
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
        .catch(({ error, stdout, stderr }) => {
          error.m = errorReport(error, `Unable to add warcs to the collection ${col} because ${stdout + stderr}`)
          reject(error)
        })
    )
  }

  addWarcsFromFSToCol ({col, warcs, lastUpdated, seed}) {
    console.log('addfs warcs to col', col, warcs, lastUpdated, seed)
    let opts = {
      cwd: settings.get('warcs')
    }
    let exec = S(settings.get('pywb.addWarcsToCol')).template({col, warcs}).s
    let updateWho = {colName: col}
    const countAdded = (stdout, stderr) => {
      let c1 = ((stdout || ' ').match(/INFO/g) || []).length
      let c2 = ((stderr || ' ').match(/INFO/g) || []).length
      let count = c1 === 0 ? c2 : c1
      console.log('added warcs to collection', col, count)
      console.log('stdout', stdout)
      console.log('stderr', stderr)
      return count
    }
    let colSeedIdQ = {_id: `${col}-${seed.url}`}
    return new Promise((resolve, reject) =>
      execute(exec, opts, countAdded)
        .then(count =>
          this.getColSize(col).then(size => {
            let theUpdateCol = {$inc: {numArchives: count}, $set: {size, lastUpdated}}
            return updateSingle(this.collections, updateWho, theUpdateCol, updateSingleOpts)
              .then((updatedCol) =>
                findOne(this.colSeeds, colSeedIdQ)
                  .then(colSeed => {
                    let findA = {
                      $where () {
                        return this.forCol === col
                      }
                    }
                    let theUpdateColSeed
                    if (foundSeedChecker(colSeed)) {
                      theUpdateColSeed = {
                        $set: {lastUpdated},
                        $inc: {mementos: 1}
                      }
                      if (!colSeed.jobIds.includes(seed.jobId)) {
                        theUpdateColSeed.$push = {jobIds: seed.jobId}
                      }
                      return updateAndFindAll(this.colSeeds, colSeedIdQ, theUpdateColSeed, updateSingleOpts, findA)
                        .then((colSeeds) => {
                          console.log(colSeeds)
                          updatedCol.seeds = cleanSeeds(Array.isArray(colSeeds) ? colSeeds : [colSeeds])
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
                          erUFA.oError.m = errorReport(erUFA.oError, `Error updating ${col}'s seed ${seed.url}`)
                          reject(erUFA.oError)
                        })
                        .catch(erUFA => {
                          console.error(`Error updateAndFindAll for ${col} seed ${seed.url}`, erUFA)
                          erUFA.m = errorReport(erUFA, `Error updating ${col}'s seed ${seed.url}`)
                          reject(erUFA)
                        })
                    } else {
                      console.log('the seed was not present')
                      seed._id = colSeedIdQ._id
                      seed.jobIds = [seed.jobId]
                      return inserAndFindAll(this.colSeeds, seed, findA)
                        .then((colSeeds) => {
                          console.log(`the new seeds for col ${col}`, colSeeds)
                          updatedCol.seeds = cleanSeeds(Array.isArray(colSeeds) ? colSeeds : [colSeeds])
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
                          erUFA.oError.m = errorReport(erUFA.oError, `Error updating ${col}'s seed ${seed.url}`)
                          reject(erUFA.oError)
                        })
                        .catch(erUFA => {
                          console.error(`Error updateAndFindAll for ${col} seed ${seed.url}`, erUFA)
                          erUFA.m = errorReport(erUFA, `Error updating ${col}'s seed ${seed.url}`)
                          reject(erUFA)
                        })
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
        .catch(({ error, stdout, stderr }) => {
          error.m = errorReport(error, `Unable to add warcs to the collection ${col} because ${stdout + stderr}`)
          reject(error)
        })
    )
  }

  addWarcsToCol ({col, warcs, lastUpdated, seed}) {
    console.log('add warcs to col', col, warcs, lastUpdated, seed)
    let opts = { cwd: settings.get('warcs')}
    let exec = S(settings.get('pywb.addWarcsToCol')).template({col, warcs}).s
    let updateWho = {colName: col}
    const countAdded = (stdout, stderr) => {
      let c1 = ((stdout || ' ').match(/INFO/g) || []).length
      let c2 = ((stderr || ' ').match(/INFO/g) || []).length
      let count = c1 === 0 ? c2 : c1
      console.log('added warcs to collection', col, count)
      console.log('stdout', stdout)
      console.log('stderr', stderr)
      return count
    }
    let colSeedIdQ = {_id: `${col}-${seed.url}`}
    return new Promise((resolve, reject) =>
      execute(exec, opts, countAdded)
        .then(count =>
          this.getColSize(col).then(size => {
            let theUpdateCol = {$inc: {numArchives: count}, $set: {size, lastUpdated}}
            return updateSingle(this.collections, updateWho, theUpdateCol, updateSingleOpts)
              .then((updatedCol) =>
                findOne(this.colSeeds, colSeedIdQ)
                  .then(colSeed => {
                    let findA = {
                      $where () {
                        return this.forCol === col
                      }
                    }
                    let theUpdateColSeed
                    if (foundSeedChecker(colSeed)) {
                      theUpdateColSeed = {
                        $set: {lastUpdated},
                        $inc: {mementos: 1}
                      }
                      if (!colSeed.jobIds.includes(seed.jobId)) {
                        theUpdateColSeed.$push = {jobIds: seed.jobId}
                      }
                      return updateAndFindAll(this.colSeeds, colSeedIdQ, theUpdateColSeed, updateSingleOpts, findA)
                        .then((colSeeds) => {
                          console.log(colSeeds)
                          updatedCol.seeds = cleanSeeds(Array.isArray(colSeeds) ? colSeeds : [colSeeds])
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
        .catch(({ error, stdout, stderr }) => {
          error.m = errorReport(error, `Unable to add warcs to the collection ${col} because ${stdout + stderr}`)
          reject(error)
        })
    )
  }

  movePywbStuffForNewCol (col) {
    return new Promise((resolve, reject) => {
      let opts = {
        clobber: true
      }
      let colTemplate = S(settings.get('collections.colTemplate')).template({col})
      let colStatic = S(settings.get('collections.colStatic')).template({col})
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
    let {col, metadata} = ncol
    let exec = S(settings.get('pywb.newCollection')).template({col}).s

    return new Promise((resolve, reject) =>
      execute(exec, opts)
        .then(({stdout, stderr}) => {
          console.log('created collection', stderr, stdout)
          // `${settings.get('warcs')}${path.sep}collections${path.sep}${col}`
          let colpath = path.join(settings.get('warcs'), 'collections', col)
          let created = moment().format()
          fs.ensureFile(path.join(colpath, 'indexes', 'index.cdxj'), () => {
            let toCreate = {
              _id: col,
              name: col,
              colpath,
              created,
              size: '0 B',
              lastUpdated: created,
              archive: path.join(colpath, 'archive'),
              indexes: path.join(colpath, 'indexes'),
              colName: col,
              numArchives: 0,
              metadata,
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
        })
        .catch(({error, stdout, stderr}) => {
          console.error(stderr, error, stdout)
          reject(error)
        })
    )
  }
}
