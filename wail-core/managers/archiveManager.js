import flow from 'lodash/fp/flow'
import groupBy from 'lodash/fp/groupBy'
import mapValues from 'lodash/fp/mapValues'
import Promise from 'bluebird'
import cp from 'child_process'
import path from 'path'
import join from 'joinable'
import S from 'string'
import { ipcRenderer as ipc } from 'electron'
import fs from 'fs-extra'
import moment from 'moment'
import through2 from 'through2'
import prettyBytes from 'pretty-bytes'
import _ from 'lodash'
import { checkPathExists, readDir, getFsStats, removeFile } from '../util/fsHelpers'
import { getYamlOrWriteIfAbsent, writeYaml } from '../util/yaml'
import { execute } from '../util/childProcHelpers'
import {
  find, findOne, insert,
  inserAndFindAll, updateSingle, remove,
  updateAndFindAll, CompoundNedbError
} from '../util/nedb'
import  { mvStartingCol } from '../util/moveStartingCol'
import DataStore from '../db/dataStore'
import PyWb from '../pywb'
import CollectionsUtils from '../util/collectionsUtils'

S.TMPL_OPEN = '{'
S.TMPL_CLOSE = '}'

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

class ArchiveManError extends Error {
  constructor (oError, where, message) {
    super(`ArchiveManError[${where}]`)
    Object.defineProperty(this, 'name', {
      value: this.constructor.name
    })
    this.oError = oError
    this.where = where
    this.m = errorReport(oError, message)
    Error.captureStackTrace(this, ArchiveManError)
  }
}

const cleanSeeds = seeds =>
  seeds.map(seed => {
    delete seed._id
    delete seed.forCol
    return seed
  })

const transSeeds = flow(
  groupBy('forCol'),
  mapValues(cleanSeeds)
)

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
  constructor (settings) {
    this._dbBasePath = settings.get('wailCore.db')
    this._colsBasePath = settings.get('warcs')
    this._colsSettingsObj = settings.get('collections')
    this._pywb = new PyWb(settings)
    this._settings = settings
    this._collections = new DataStore({
      filename: path.join(this._dbBasePath, 'archives.db'),
      autoload: true
    }, this._dbBasePath)

    this._colSeeds = new DataStore({
      filename: path.join(this._dbBasePath, 'archiveSeeds.db'),
      autoload: true
    }, this._dbBasePath)
  }

  _backUpDbs () {
    const backUpTime = new Date().getTime()
    const oa = path.join(this._dbBasePath, 'archives.db')
    const oas = path.join(this._dbBasePath, 'archiveSeeds.db')
    const message = `${this._settings.get('collections.dir')} was not found on the filesystem after creating it. WAIL has backed up previous this._settings found at ${missingBackUpPath()} and recreated this directory.`
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
          this._collections.remove({}, {multi: true}, (err2, rmc) => {
            this._colSeeds.remove({}, {multi: true}, (err3, rmc2) => {
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

  async createDefaultCol () {
    let colpath = path.join(this._colsBasePath, 'collections', 'default')
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
    const updater = this._collections.wemInsert('Could not create the database entry for the default collections')
    const newCol = await updater(toCreate)
    newCol.seeds = []
    return newCol
  }

  async _handleColDirNoExistence (errExist) {
    let cols = await this._collections.getAll()
    let seeds = await this._colSeeds.getAll(), hadToBkup = false, bkupM = ''

    if (cols.length !== 0) {
      hadToBkup = true
      try {
        await this._collections.backUpClearDb()
      } catch (err) {

      }
      bkupM += 'Had to backup Collections database'
    }
    if (seeds.length !== 0) {
      if (hadToBkup) {
        bkupM += 'and backup Seeds database'
      } else {
        bkupM += 'Had tp backup Seeds database'
      }
      hadToBkup = true
      try {
        await this._colSeeds.backUpClearDb()
      } catch (err) {

      }

    }

    if (hadToBkup) {
      let what = errExist.what === 'warcs' ? 'WAIL_ManagedCollection' : `WAIL_ManagedCollection${path.sep}collections`
      ipc.send('display-message', {
        title: `${what} Did Not Exist`,
        level: 'error',
        autoDismiss: 0,
        message: bkupM,
        uid: bkupM
      })
    }

    await mvStartingCol(this._settings.get('iwarcs'), this._colsBasePath)
    return await this.createDefaultCol()
  }

  async _handleTrackedNotExisting (cols, seeds) {
    const bkTime = new Date().getTime()
    let colbkPath = path.join(this._dbBasePath, `${bkTime}.trackedCollectionsNoLongerExisting.db`)
    let seedbkPath = path.join(this._dbBasePath, `${bkTime}.trackedSeedsNoLongerExisting.db`)
    const collsNotExisting = new DataStore({
      autoload: true,
      filename: colbkPath
    })
    const seedsNotExisting = new DataStore({
      autoload: true,
      filename: seedbkPath
    })
    await collsNotExisting.nrInsert(cols)
    const colNamesWhoNoExist = []
    let seedWhoNoExist = []
    const removeFromExisting = cols.map(col => {
      colNamesWhoNoExist.push(col.name)
      seedWhoNoExist = seedWhoNoExist.concat(seeds[col.name])
      return {_id: col._id}
    })
    await seedsNotExisting.nrInsert(seedWhoNoExist)
    await this._collections.nrRemove(removeFromExisting, {multi: true})
    await this._colSeeds.nrRemove(seedWhoNoExist.map(s => ({_id: s._id})), {multi: true})
    const message = `${cols.length} tracked collections do not exist on the filesystem. WAIL has made a backup located at ${this._dbBasePath}`
    ipc.send('display-message', {
      title: 'Some Tracked Collections Do Not Exist',
      level: 'error',
      autoDismiss: 0,
      message,
      uid: message
    })
    return ''
  }

  async handleColDirsExistNoTracked () {
    const colFiles = await readDir(path.join(this._colsBasePath, 'collections'))
  }

  async _colFromSeedsColDirExists (colPath, col, seeds) {
    const aColStats = await getFsStats(colPath)
    const colCreateTime = moment(aColStats.birthtime)
    let colLastUpdated
    if (seeds.length > 0) {
      colLastUpdated = moment.max(seeds.map(s => moment(s.lastUpdated)))
    } else {
      colLastUpdated = moment().format()
    }
    let colSize = '0 B', ensures = 'index'
    const colWarcP = path.join(colPath, 'archive')
    if (await checkPathExists(colWarcP)) {
      colSize = prettyBytes(await CollectionsUtils.getColSize(colWarcP))
    } else {
      ensures = 'both'
    }
    await CollectionsUtils.ensureColDirs(colPath, ensures)
    let backUpMdata = {description: `Recreated by WAIL after found to be not existing`, title: col}
    let metadata
    try {
      metadata = await getYamlOrWriteIfAbsent(path.join(colPath, 'metadata.yaml'), backUpMdata)
    } catch (getYamlError) {
      backUpMdata.description = `${backUpMdata.description} but could not create file on disk.`
    }
    return {
      _id: col, name: col, colPath, size: colSize, lastUpdated: colLastUpdated.format(),
      created: colCreateTime.format(), numArchives: seeds.length, archive: path.join(colWarcP, 'archive'),
      indexes: path.join(colWarcP, 'indexes'), hasRunningCrawl: false, metadata
    }
  }

  async _fallBackCreateDefaultCol () {
    let defaultCol = await this.createDefaultCol()
    let createdFailed = false
    try {
      await this._pywb.createCol({col: 'default'})
    } catch (pywbCreateError) {
      createdFailed = true
    }
    if (createdFailed) {
      await CollectionsUtils.manualCreateCol(defaultCol.colpath)
    }
    return defaultCol
  }

  async _recreateColsFromSeeds (seeds) {
    const collectionsPath = path.join(this._colsBasePath, 'collections')
    const recreatedCols = [], oldColSeeds = transSeeds(seeds), couldNotRecreate = []
    for (const col of Object.keys(oldColSeeds)) {
      const colPath = path.join(collectionsPath, col)
      let recreatedCol
      try {
        if (await checkPathExists(colPath)) {
          recreatedCol = await this._colFromSeedsColDirExists(colPath, col, oldColSeeds[col])
          recreatedCols.push(recreatedCol)
        } else {
          couldNotRecreate.push(oldColSeeds[col])
        }
      } catch (createError) {
        console.error(createError)
        couldNotRecreate.push(oldColSeeds[col])
      }
    }
    if (couldNotRecreate.length > 0) {
      await this._colSeeds.remove(_.flatten(couldNotRecreate), {multi: true})
    }
    if (recreatedCols.length > 0) {
      await this._collections.insert(recreatedCols)
      return recreatedCols.map(col => {
        col.seeds = oldColSeeds[col.name]
        return col
      })
    } else {
      return await this._fallBackCreateDefaultCol()
    }
  }

  async getAllCollections () {
    try {
      await CollectionsUtils.checkCollDirExistence(this._colsBasePath)
      console.log('they do exist')
    } catch (noExist) {
      console.log('no exist')
      return await this._handleColDirNoExistence(noExist)
    }
    const colsExistCheck = await this._collections.getAllCheckExists('colpath')
    console.log(colsExistCheck)
    let colSeeds = await this._colSeeds.wemGetAll('Could not retrieve collections seeds from the database')
    let {exist, empty, doNotExist} = colsExistCheck
    if (!empty) {
      colSeeds = transSeeds(colSeeds)
      if (doNotExist.length === 0) {
        console.log(exist)
        return exist.map(col => {
          col.seeds = colSeeds[col.name] || []
          return col
        })
      } else {
        console.log('some do not exist')
        await this._handleTrackedNotExisting(doNotExist, colSeeds)
        return exist.map(col => {
          col.seeds = colSeeds[col.name] || []
          return col
        })
      }
    } else {
      if (colSeeds.length > 0) {
        return await this._recreateColsFromSeeds(colSeeds)
      } else {
        return await this._fallBackCreateDefaultCol()
      }
    }
  }

  async addCrawlInfo (confDetails) {
    let {forCol, lastUpdated, seed} = confDetails
    let colSeedIdQ = {_id: `${forCol}-${seed.url}`}
    let updateWho = {colName: forCol}
    console.log('addCrawlInfo', confDetails)
    let theUpdateCol = {$set: {lastUpdated}}
    let findA = {$where () { return this.forCol === forCol }}
    let updater = this._collections.wemUpdate(`Error updating ${forCol}'s seed ${seed.url}. It was not found for the collection`)
    let updatedCol = await updater(updateWho, theUpdateCol, updateSingleOpts)
    updater = this._colSeeds.wemFindOne(`Error updating ${forCol}'s seed ${seed.url}. It was not found for the collection`)
    let existingSeed = await updater(colSeedIdQ)
    if (foundSeedChecker(existingSeed)) {
      let theUpdateColSeed = {
        $set: {lastUpdated}
      }
      if (!existingSeed.jobIds.includes(seed.jobId)) {
        theUpdateColSeed.$push = {jobIds: seed.jobId}
      }

      updater = this._colSeeds.wemUpdateFindAll(`Error updating ${forCol}'s seed ${seed.url}. Could not add the crawl info`)
      let updatedColSeeds = await updater(colSeedIdQ, theUpdateColSeed, updateSingleOpts, findA)
      updatedCol.seeds = cleanSeeds(Array.isArray(updatedColSeeds) ? updatedColSeeds : [updatedColSeeds])
      console.log(updatedCol)
      return {
        colName: updatedCol.colName,
        numArchives: updatedCol.numArchives,
        size: updatedCol.size,
        seeds: updatedCol.seeds,
        lastUpdated: updatedCol.lastUpdated
      }
    } else {
      seed._id = colSeedIdQ._id
      updater = this._colSeeds.wemInsertFindAll(`Error updating ${forCol}'s seed ${seed.url}. Could not add a new seed entry for the crawl info`)
      let colSeeds = await updater(seed, findA)
      updatedCol.seeds = cleanSeeds(Array.isArray(colSeeds) ? colSeeds : [colSeeds])
      console.log(updatedCol)
      return {
        colName: updatedCol.colName,
        numArchives: updatedCol.numArchives,
        size: updatedCol.size,
        seeds: updatedCol.seeds,
        lastUpdated: updatedCol.lastUpdated
      }
    }
  }

  addInitialMData (col, mdata) {
    return this._pywb.addMetadata({col, metadata: join(...mdata)})
  }

  updateMetadata (update) {
    console.log('updateMetaData', update)
    let {forCol, mdata} = update
    console.log('updateMetaData', forCol, mdata)
    let opts = {
      cwd: this._colsBasePath
    }
    return new Promise((resolve, reject) => {
      let exec = S(this._settings.get('pywb.addMetadata')).template({col: forCol, metadata: update.mdataString}).s
      console.log(exec)
      cp.exec(exec, opts, (error, stdout, stderr) => {
        console.log(stdout, stderr)
        if (error) {
          console.error(stderr)
          return reject(error)
        }
        this._collections.findOne({colName: forCol}, {metadata: 1, _id: 0}, (errFind, doc) => {
          if (errFind) {
            console.log('errorfind', errFind)
            return reject(errFind)
          }
          _.toPairs(update.mdata).forEach(([mk, mv]) => {
            doc.metadata[mk] = mv
          })
          this._collections.update({colName: forCol}, {$set: {metadata: doc.metadata}}, (errUpdate, numUpdated) => {
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
      cwd: this._colsBasePath
    }
    return new Promise((resolve, reject) => {
      let exec = S(this._settings.get('pywb.addMetadata')).template({col, metadata: join(...mdata)}).s
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
        this._collections.update({colName: col}, {$set: {metadata: {...metadata}}}, {}, (err, numUpdated) => {
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
      fs.walk(S(this._settings.get('collections.colWarcs')).template({col}).s)
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
    let opts = {cwd: this._colsBasePath}
    let updateWho = {colName: col}
    let seeds = []
    let ws = []
    seedWarcs.forEach(sw => {
      seeds.push(sw.seed)
      ws.push(sw.warcs)
    })
    const addMulti = wpath => {
      let exec = S(this._settings.get('pywb.addWarcsToCol')).template({col, warcs: wpath}).s
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

  async addWarcsFromWCreate ({col, warcs, lastUpdated, seed}) {
    const templateArgs = {col}
    await this._pywb.reindexColToAddWarc(templateArgs)
    const updateWho = {colName: col}, colSeedIdQ = {_id: `${col}-${seed.url}`}
    const findA = {$where () { return this.forCol === col }}
    const size = await CollectionsUtils.getColSize(col)
    const theUpdateCol = {$inc: {numArchives: 1}, $set: {size, lastUpdated}}
    let updatedCol, colSeed, colSeeds, updater
    updater = this._collections.wemUpdate(`Unable to add warcs to non-existent collection ${col}`)
    updatedCol = await updater(updateWho, theUpdateCol, updateSingleOpts)
    updater = this._colSeeds.wemFindOne(`Error updating ${col}'s seed ${seed.url}. It was not found for the collection`)
    colSeed = await updater(colSeedIdQ)
    if (foundSeedChecker(colSeed)) {
      let theUpdateColSeed = {
        $set: {lastUpdated},
        $inc: {mementos: 1}
      }
      if (!colSeed.jobIds.includes(seed.jobId)) {
        theUpdateColSeed.$push = {jobIds: seed.jobId}
      }
      updater = this._colSeeds.wemUpdateFindAll(`Error final update to ${col}'s seed ${seed.url}`)
      colSeeds = await updater(colSeedIdQ, theUpdateColSeed, updateSingleOpts, findA)

    } else {
      seed._id = colSeedIdQ._id
      seed.mementos = 1
      seed.jobIds = [seed.jobId]
      updater = this._colSeeds.wemInsertFindAll(`Error final update to ${col}'s seed ${seed.url}`)
      colSeeds = await updater(seed, findA)

    }
    updatedCol.seeds = cleanSeeds(Array.isArray(colSeeds) ? colSeeds : [colSeeds])
    return {
      colName: updatedCol.colName,
      numArchives: updatedCol.numArchives,
      size: updatedCol.size,
      seeds: updatedCol.seeds,
      lastUpdated: updatedCol.lastUpdated
    }
  }

  async addWarcsFromFSToCol ({col, warcs, lastUpdated, seed}) {
    let addedCount = await this._pywb.addWarcsToCol({col, warcs})
    let updateWho = {colName: col}, colSeedIdQ = {_id: `${col}-${seed.url}`}
    const findA = {$where () { return this.forCol === col}}
    const size = await CollectionsUtils.getColSize({col})
    const theUpdateCol = {$inc: {numArchives: addedCount}, $set: {size, lastUpdated}}
    let updater = this._collections.wemUpdate(`Unable to add warcs to non-existent collection ${col}`)
    let updatedCol = await updater(updateWho, theUpdateCol, updateSingleOpts)
    updater = this._colSeeds.wemFindOne(`Error updating ${col}'s seed ${seed.url}. It was not found for the collection`)
    let colSeed = await updater(colSeedIdQ)
    let colSeeds
    if (foundSeedChecker(colSeed)) {
      let theUpdateColSeed = {
        $set: {lastUpdated},
        $inc: {mementos: 1}
      }
      if (!colSeed.jobIds.includes(seed.jobId)) {
        theUpdateColSeed.$push = {jobIds: seed.jobId}
      }
      updater = this._colSeeds.wemUpdateFindAll(`Error updating ${col}'s seed ${seed.url}`)
      colSeeds = await updater(colSeedIdQ, theUpdateColSeed, updateSingleOpts, findA)
    } else {
      seed._id = colSeedIdQ._id
      seed.mementos = 1
      seed.jobIds = [seed.jobId]
      updater = this._colSeeds.wemInsertFindAll(`Error updating ${col}'s seed ${seed.url}`)
      colSeeds = await updater(seed, findA)
    }
    updatedCol.seeds = cleanSeeds(Array.isArray(colSeeds) ? colSeeds : [colSeeds])
    return {
      colName: updatedCol.colName,
      numArchives: updatedCol.numArchives,
      size: updatedCol.size,
      seeds: updatedCol.seeds,
      lastUpdated: updatedCol.lastUpdated
    }
  }

  async addWarcsToCol ({col, warcs, lastUpdated, seed}) {
    let addedCount = await this._pywb.addWarcsToCol({col, warcs})
    let updateWho = {colName: col}, colSeedIdQ = {_id: `${col}-${seed.url}`}
    const findA = {$where () { return this.forCol === col}}
    const size = await CollectionsUtils.getColSize({col})
    const theUpdateCol = {$inc: {numArchives: addedCount}, $set: {size, lastUpdated}}
    let updater = this._collections.wemUpdate(`Unable to add warcs to non-existent collection ${col}`)
    let updatedCol = await updater(updateWho, theUpdateCol, updateSingleOpts)
    updater = this._colSeeds.wemFindOne(`Error updating ${col}'s seed ${seed.url}. It was not found for the collection`)
    let colSeed = await updater(colSeedIdQ)
    let colSeeds
    if (foundSeedChecker(colSeed)) {
      let theUpdateColSeed = {
        $set: {lastUpdated},
        $inc: {mementos: 1}
      }
      if (!colSeed.jobIds.includes(seed.jobId)) {
        theUpdateColSeed.$push = {jobIds: seed.jobId}
      }
      updater = this._colSeeds.wemUpdateFindAll(`Error updating ${col}'s seed ${seed.url}`)
      colSeeds = await updater(colSeedIdQ, theUpdateColSeed, updateSingleOpts, findA)
    } else {
      seed._id = colSeedIdQ._id
      seed.mementos = 1
      seed.jobIds = [seed.jobId]
      updater = this._colSeeds.wemInsertFindAll(`Error updating ${col}'s seed ${seed.url}`)
      colSeeds = await updater(seed, findA)
    }
    updatedCol.seeds = cleanSeeds(Array.isArray(colSeeds) ? colSeeds : [colSeeds])
    return {
      colName: updatedCol.colName,
      numArchives: updatedCol.numArchives,
      size: updatedCol.size,
      seeds: updatedCol.seeds,
      lastUpdated: updatedCol.lastUpdated
    }
  }

  async createCollection (ncol) {
    let {col, metadata} = ncol
    await this._pywb.createCol({col})
    let colpath = path.join(this._colsBasePath, 'collections', col), created = moment().format()
    await CollectionsUtils.ensureColDirsNR(colpath, 'index')
    let toCreate = {
      _id: col, name: col, colpath, created,
      size: '0 B', lastUpdated: created,
      archive: path.join(colpath, 'archive'),
      indexes: path.join(colpath, 'indexes'),
      colName: col, numArchives: 0, metadata,
      hasRunningCrawl: false
    }
    const updater = this._collections.wemInsert(`Could not add the created collection ${col} to database`)
    let newCol = await updater(toCreate)
    return {
      seeds: [],
      ...newCol
    }
  }
}
