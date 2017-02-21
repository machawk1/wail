import fs from 'fs-extra'
import Promise from 'bluebird'
import _ from 'lodash'
import flow from 'lodash/fp/flow'
import groupBy from 'lodash/fp/groupBy'
import mapValues from 'lodash/fp/mapValues'
import moment from 'moment'
import S from 'string'
import path from 'path'
import through2 from 'through2'
import prettyBytes from 'pretty-bytes'
import { remote } from 'electron'
import DataStore from './dataStore'
import PyWb from '../pywb'
import { getYamlOrWriteIfAbsent, writeYaml } from '../util/yaml'
import { checkPathExists, getFsStats } from '../util/fsHelpers'

const settings = remote.getGlobal('settings')

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

class EnsureColDirError extends Error {
  constructor (oError, where) {
    super(`EnsureColDir[${where}]`)
    Object.defineProperty(this, 'name', {
      value: this.constructor.name
    })
    this.oError = oError
    this.where = where
  }
}

class ColDirExistsError extends Error {
  constructor (didNotExist) {
    super(`ColDirExistsError[${where}]`)
    Object.defineProperty(this, 'name', {
      value: this.constructor.name
    })
    this.didNotExist = didNotExist
  }
}

export default class ColSeedsDb {

  static foundSeedChecker (colSeeds) {
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

  static checkCollDirExistence = () => new Promise((resolve, reject) => {
    const managedCollections = settings.get('warcs')
    fs.access(managedCollections, fs.constants.R_OK, err => {
      if (err) {
        reject(new ColDirExistsError('warcs'))
      } else {
        fs.access(path.join(managedCollections, 'collections'), fs.constants.R_OK, err2 => {
          if (err2) {
            reject(new ColDirExistsError('collections'))
          } else {
            resolve()
          }
        })
      }
    })
  })

  static getColSize (pathToWarcs) {
    if (_.isObject(pathToWarcs)) {
      pathToWarcs = S(settings.get('collections.colWarcs')).template(pathToWarcs).s
    }
    return new Promise((resolve, reject) => {
      let size = 0
      fs.walk(pathToWarcs)
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

  static ensureColDirs (colPath, which) {
    return new Promise((resolve, reject) => {
      if (which === 'both') {
        fs.ensureDir(path.join(colPath, 'archive'), errA => {
          if (errA) {
            reject(new EnsureColDirError(errA, 'archive'))
          } else {
            fs.ensureFile(path.join(colPath, 'indexes', 'index.cdxj'), errI => {
              if (errI) {
                reject(new EnsureColDirError(errI, 'index'))
              } else {
                resolve()
              }
            })
          }
        })
      } else if (which === 'index') {
        fs.ensureFile(path.join(colPath, 'indexes', 'index.cdxj'), errI => {
          if (errI) {
            reject(new EnsureColDirError(errI, 'index'))
          } else {
            resolve()
          }
        })
      } else {
        fs.ensureDir(path.join(colPath, 'archive'), errA => {
          if (errA) {
            reject(new EnsureColDirError(errA, 'archive'))
          } else {
            resolve()
          }
        })
      }
    })
  }

  constructor (colOpts, seedOpts) {
    this._collections = new DataStore(colOpts)
    this._colSeeds = new DataStore(seedOpts)
  }

  async _handleTrackedNotExisting (cols, seeds) {
    const collsNotExisting = new DataStore({
      autoload: true,
      filename: `${new Date().getTime()}.trackedCollectionsNoLongerExisting.db`
    })
    const seedsNotExisting = new DataStore({
      autoload: true,
      filename: `${new Date().getTime()}.trackedSeedsNoLongerExisting.db`
    })
    await collsNotExisting.insert(cols)
    const colNamesWhoNoExist = []
    let seedWhoNoExist = []
    const removeFromExisting = cols.map(col => {
      colNamesWhoNoExist.push(col.name)
      seedWhoNoExist = seedWhoNoExist.concat(seeds[col.name])
      return {_id: col._id}
    })
    await seedsNotExisting.insert(seedWhoNoExist)
    await this._collections.remove(removeFromExisting, {multi: true})
    await this._colSeeds.remove(seedWhoNoExist.map(s => ({_id: s._id})), {multi: true})
  }

  async _handleAllTrackedNotExisting (cols, seeds) {
    const tempDb = new DataStore({
      autoload: true,
      filename: `${new Date().getTime()}.trackedCollectionsNoLongerExisting.db`
    })
    const insertGood = await tempDb.insert(cols)
    if (!insertGood.wasError) {
      const colNamesWhoNoExist = []
      const removeFromExisting = cols.map(col => {
        colNamesWhoNoExist.push(col.name)
        return {_id: col._id}
      })
      this._collections.remove(removeFromExisting, {multi: true})
    }
    return
  }

  async _handleColDirNoExistence (errExist) {
    let cols = await this._collections.getAll()
    let seeds = await this._colSeeds.getAll()
    if (cols.length !== 0 || seeds.length !== 0) {
      // this is not the first time for all intents and purposes
      let seedsBackup = await this._colSeeds.backUpClearDb()
      let colsBackup = await this._collections.backUpClearDb()
      //handle backup
    }
    return await this.createDefaultCol()
  }

  async _colFromSeedsColDirExists (colPath, col, seeds) {
    const aColStats = await getFsStats(colPath)
    const colCreateTime = moment(aColStats.birthtime)
    let colLastUpdated
    if (seeds.length > 0) {
      moment.max(seeds.map(s => moment(s.lastUpdated)))
    } else {
      colLastUpdated = moment().format()
    }
    let colSize = '0 B', ensures = 'index'
    const colWarcP = path.join(colPath, 'archive')
    if (await checkPathExists(colWarcP)) {
      colSize = await ColSeedsDb.getColSize(colWarcP)
    } else {
      ensures = 'both'
    }
    try {
      await ColSeedsDb.ensureColDirs(colPath, ensures)
    } catch (ensureError) {
      console.error(ensureError)
    }
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

  async _colFromSeedsNoColDir (colPath, col, seeds) {
    let createdFailed = false, createError = null
    try {
      await createCol(col)
    } catch (createFailed) {
      createdFailed = true
    }
    if (createdFailed) {
      try {
        await ColSeedsDb.ensureColDirs(colPath, 'both')
      } catch (ensureFailed) {
        createError = ensureFailed
      }
    }
    if (createdFailed) {
      throw createError
    }
    const colCreateTime = moment().format()
    let colLastUpdated
    if (seeds.length > 0) {
      moment.max(seeds.map(s => moment(s.lastUpdated)))
    } else {
      colLastUpdated = colCreateTime
    }
    let colSize = '0 B'
    const colWarcP = path.join(colPath, 'archive')
    let metadata = {description: `Recreated by WAIL after found to be not existing`, title: col}
    try {
      await writeYaml(path.join(colPath, 'metadata.yaml'), metadata)
    } catch (writeError) {
      metadata.description = `${metadata.description} but could not create file on disk.`
    }
    return {
      _id: col, name: col, colPath, size: colSize, lastUpdated: colLastUpdated.format(),
      created: colCreateTime.format(), numArchives: seeds.length, archive: path.join(colWarcP, 'archive'),
      indexes: path.join(colWarcP, 'indexes'), hasRunningCrawl: false, metadata
    }
  }

  async _recreateColsFromSeeds (seeds) {
    const collectionsPath = path.join(settings.get('warcs'), 'collections')
    let recreatedCols = []
    for (const col of Object.keys(seeds)) {
      const colPath = path.join(collectionsPath, col)
      let recreatedCol
      if (await checkPathExists(colPath)) {
        recreatedCol = await this._colFromSeedsColDirExists(colPath, col, seeds[col])
      } else {
        recreatedCol = await this._colFromSeedsNoColDir(colPath, col, seeds[col])
      }
      recreatedCols.push(recreatedCol)
    }
    return recreatedCols
  }

  async getAllCollections () {
    try {
      await ColSeedsDb.checkCollDirExistence()
    } catch (noExist) {
      console.log('no exist')
      return await this._handleColDirNoExistence(noExist)
    }
    // WAIL_ManagedCollections && WAIL_ManagedCollections/collections exist check cols
    let colSeeds, colsExistCheck
    try {
      colsExistCheck = await this._collections.getAllCheckExists('colpath')
    } catch (errFind) {
      throw errFind
    }

    try {
      colSeeds = await this._colSeeds.getAll()
    } catch (errSeedFind) {
      throw errSeedFind
    }

    let {exist, empty, doNotExist} = colsExistCheck

    if (!empty) {
      colSeeds = transSeeds(colSeeds)
      if (doNotExist.length === 0) {
        return exist.map(col => {
          col.seeds = colSeeds[col.name] || []
          return col
        })
      } else {
        await this._handleTrackedNotExisting(doNotExist, colSeeds)
        return exist.map(col => {
          col.seeds = colSeeds[col.name] || []
          return col
        })
      }
    } else {
      const colDir = await readDir(path.join(bPath, 'collections'))
      if (colDir.length === 0) {
        return await this.createDefaultCol()
      } else {
        return await this.createDefaultCol(true)
      }
    }

  }

  async addCrawlInfo (confDetails) {
    let {forCol, lastUpdated, seed} = confDetails
    let colSeedIdQ = {_id: `${forCol}-${seed.url}`}
    let updateWho = {colName: forCol}
    console.log('addCrawlInfo', confDetails)
    let theUpdateCol = {$set: {lastUpdated}}
    let findA = {
      $where () {
        return this.forCol === forCol
      }
    }
    const updatedCol = await this._collections.update(updateWho, theUpdateCol, updateSingleOpts)
    let existingSeed = await this._colSeeds.findOne(colSeedIdQ)
    if (ColSeedsDb.foundSeedChecker(existingSeed)) {
      let theUpdateColSeed = {
        $set: {lastUpdated}
      }
      if (!existingSeed.jobIds.includes(seed.jobId)) {
        theUpdateColSeed.$push = {jobIds: seed.jobId}
      }
      let updatedColSeeds = await this._collections.updateFindAll(colSeedIdQ, theUpdateColSeed, updateSingleOpts, findA)
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
      let colSeeds = await this._colSeeds.insertFindAll(seed, findA)
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

  async addInitialMData (col, mdata) {
    return await PyWb.addMetadata({col, metadata: join(...mdata)})
  }

  async addWarcsFromWCreate ({col, warcs, lastUpdated, seed}) {
    const templateArgs = {col}
    try {
      await PyWb.reindexCol(templateArgs)
    } catch (reindexError) {
      throw reindexError
    }
    const updateWho = {colName: col}, colSeedIdQ = {_id: `${col}-${seed.url}`}
    const findA = {$where () { return this.forCol === col }}
    const size = await ColSeedsDb.getColSize(templateArgs)
    const theUpdateCol = {$inc: {numArchives: 1}, $set: {size, lastUpdated}}
    let updatedCol, colSeed, colSeeds
    try {
      updatedCol = await this._collections.update(updateWho, theUpdateCol, updateSingleOpts)
    } catch (updateError) {

    }
    try {
      colSeed = await this._colSeeds.findOne(colSeedIdQ)
    } catch (findError) {

    }
    if (ColSeedsDb.foundSeedChecker(colSeed)) {
      let theUpdateColSeed = {
        $set: {lastUpdated},
        $inc: {mementos: 1}
      }
      if (!colSeed.jobIds.includes(seed.jobId)) {
        theUpdateColSeed.$push = {jobIds: seed.jobId}
      }
      colSeeds = await this._colSeeds.updateFindAll(colSeedIdQ, theUpdateColSeed, updateSingleOpts, findA)
    } else {
      seed._id = colSeedIdQ._id
      seed.mementos = 1
      seed.jobIds = [seed.jobId]
      colSeeds = await this._colSeeds.insertFindAll(seed, findA)
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
    let addedCount
    try {
      addedCount = await PyWb.addWarcsToCol({col, warcs})
    } catch (addError) {

    }
    let updateWho = {colName: col}, colSeedIdQ = {_id: `${col}-${seed.url}`}
    const findA = {$where () { return this.forCol === col}}
    const size = await ColSeedsDb.getColSize({col})
    const theUpdateCol = {$inc: {numArchives: addedCount}, $set: {size, lastUpdated}}
    let updatedCol
    try {
      updatedCol = await this._collections.update(updateWho, theUpdateCol, updateSingleOpts)
    } catch (updateError) {

    }
    let colSeed
    try {
      colSeed = await this._colSeeds.findOne(colSeedIdQ)
    } catch (findError) {

    }
    let colSeeds
    if (ColSeedsDb.foundSeedChecker(colSeed)) {
      let theUpdateColSeed = {
        $set: {lastUpdated},
        $inc: {mementos: 1}
      }
      if (!colSeed.jobIds.includes(seed.jobId)) {
        theUpdateColSeed.$push = {jobIds: seed.jobId}
      }
      colSeeds = await this._colSeeds.updateFindAll(colSeedIdQ, theUpdateColSeed, updateSingleOpts, findA)
    } else {
      seed._id = colSeedIdQ._id
      seed.mementos = 1
      seed.jobIds = [seed.jobId]
      colSeeds = await this._colSeeds.insertFindAll(seed, findA)
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
    let addedCount
    try {
      addedCount = await PyWb.addWarcsToCol({col, warcs})
    } catch (addError) {

    }
    let updateWho = {colName: col}, colSeedIdQ = {_id: `${col}-${seed.url}`}
    const findA = {$where () { return this.forCol === col}}
    const size = await ColSeedsDb.getColSize({col})
    const theUpdateCol = {$inc: {numArchives: addedCount}, $set: {size, lastUpdated}}
    let updatedCol
    try {
      updatedCol = await this._collections.update(updateWho, theUpdateCol, updateSingleOpts)
    } catch (updateError) {

    }
    let colSeed
    try {
      colSeed = await this._colSeeds.findOne(colSeedIdQ)
    } catch (findError) {

    }
    let colSeeds
    if (ColSeedsDb.foundSeedChecker(colSeed)) {
      let theUpdateColSeed = {
        $set: {lastUpdated},
        $inc: {mementos: 1}
      }
      if (!colSeed.jobIds.includes(seed.jobId)) {
        theUpdateColSeed.$push = {jobIds: seed.jobId}
      }
      colSeeds = await this._colSeeds.updateFindAll(colSeedIdQ, theUpdateColSeed, updateSingleOpts, findA)
    } else {
      seed._id = colSeedIdQ._id
      seed.mementos = 1
      seed.jobIds = [seed.jobId]
      colSeeds = await this._colSeeds.insertFindAll(seed, findA)
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
    try {
      await PyWb.createCol({col})
    } catch (createError) {

    }
    let colpath = path.join(settings.get('warcs'), 'collections', col), created = moment().format()
    try {
      await ColSeedsDb.ensureColDirs(colpath, 'index')
    } catch (ensureError) {

    }
    let toCreate = {
      _id: col, name: col, colpath, created,
      size: '0 B', lastUpdated: created,
      archive: path.join(colpath, 'archive'),
      indexes: path.join(colpath, 'indexes'),
      colName: col, numArchives: 0, metadata,
      hasRunningCrawl: false
    }

    let newCol
    try {
      newCol = await this._collections.insert(toCreate)
    } catch (insertError) {

    }
    return {
      seeds: [],
      ...newCol
    }

  }

  async createDefaultCol (ensure = false) {
    let colpath = path.join(settings.get('warcs'), 'collections', 'default')
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
    if (!ensure) {
      await execute('', {})
    } else {
      await ColSeedsDb.ensureColDirs(colpath, 'both')
    }
    const newCol = await this._collections.insert(toCreate)
    newCol.seeds = []
    return newCol
  }
}