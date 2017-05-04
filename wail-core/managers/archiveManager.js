import flow from 'lodash/fp/flow'
import groupBy from 'lodash/fp/groupBy'
import mapValues from 'lodash/fp/mapValues'
import Promise from 'bluebird'
import cp from 'child_process'
import path from 'path'
import join from 'joinable'
import S from 'string'
import split2 from 'split2'
import through2 from 'through2'
import fs from '../fs'
import moment from 'moment'
import prettyBytes from 'pretty-bytes'
import _ from 'lodash'
import EventEmitter from 'eventemitter3'
import { Observable } from 'rxjs'
import { checkPathExists, readDir, getFsStats, removeFile } from '../util/fsHelpers'
import { getYamlOrWriteIfAbsent, writeYaml } from '../util/yaml'
import { execute } from '../util/childProcHelpers'
import { mvStartingCol } from '../util/moveStartingCol'
import { FatalDBError } from '../db/dbErrors'
import PyWb from '../pywb'
import CollectionsUtils from '../util/collectionsUtils'
import Db from '../db/db'

const updateSingleOpts = {
  returnUpdatedDocs: true,
  multi: false
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

export default class ArchiveManager extends EventEmitter {
  constructor (settings) {
    super()
    this._dbBasePath = settings.get('wailCore.db')
    this._colsBasePath = settings.get('warcs')
    this._colsSettingsObj = settings.get('collections')
    this._pywb = new PyWb(settings)
    this._settings = settings
    this._collections = new Db({
      filename: path.join(this._dbBasePath, 'archives.db'),
      autoload: false,
      dbHumanName: 'Collections Database',
      corruptAlertThreshold: 0
    }, this._dbBasePath)
    this._colSeeds = new Db({
      filename: path.join(this._dbBasePath, 'archiveSeeds.db'),
      autoload: false,
      dbHumanName: 'Seeds Database',
      corruptAlertThreshold: 0
    }, this._dbBasePath)
    this._didLoad = false
    this._notificationObserver = null
  }

  subscribeToNotifications (handler) {
    if (!this._notificationObserver) {
      this._notificationObserver = Observable.fromEventPattern(
        (handler) => {
          // add
          this.on('notification', handler)
        },
        (handler) => {
          // remove
          this.removeListener('notification', handler)
        }
      )
    }
    return this._notificationObserver.subscribe(handler)
  }

  tryNormalizeDb (readFrom, writeTo) {
    return new Promise(function (resolve, reject) {
      const readStream = fs.createReadStream(readFrom)
      let end = process.platform === 'win32' ? '\r\n' : '\n'
      readStream
        .pipe(split2())
        .pipe(through2(function (item, enc, next) {
          let s = item.toString()
          let wasError = false
          try {
            JSON.parse(s)
          } catch (err) {
            wasError = true
          }
          if (!wasError) {
            this.push(`${s}${end}`)
          }
          next()
        }))
        .pipe(fs.createWriteStream(writeTo))
        .on('error', (err) => {
          readStream.destroy()
          reject(err)
        })
        .on('finish', () => {
          readStream.destroy()
          resolve()
        })
    })
  }

  async init () {
    let colLoadRet, seedsLoadRet
    try {
      colLoadRet = await this._loadCols()
    } catch (errLoadCols) {
      throw new FatalDBError(errLoadCols, 'Attempting to load the database after corruption was detected', 'Collections')
    }
    if (colLoadRet.backUpCols) {
      if (colLoadRet.wasHardColsBk) {
        let seedBkName = await this._backupColSeedsLoad(true)
        // notify seedbackup due to hard
        let message = `Corruption correction failed to Collections database. The seeds database was backed up successfully to ${seedBkName}`
        this.emit('notification', {
          title: 'Corruption to Collections database caused reset to tracked Seeds',
          level: 'warning',
          autoDismiss: 0,
          message,
          uid: message
        })
      } else {
        // notify cols backup normalization due to corruption
        try {
          seedsLoadRet = await this._loadSeeds()
        } catch (errLoadSeeds) {
          throw new FatalDBError(errLoadSeeds, 'Attempting to load the database after corruption was detected to the Collections db', 'Collection Seeds')
        }
        if (seedsLoadRet.backUpSeeds) {
          if (seedsLoadRet.wasHardSeedsBk) {
            let message = `Correction failed to the Seeds database but not the Collections. The Seeds database had to be reset. Collections backup made to ${colLoadRet.backupName}`
            this.emit('notification', {
              title: 'Corruption to the Collections and Seeds databases occurred',
              level: 'warning',
              autoDismiss: 0,
              message,
              uid: message
            })
          } else {
            let message = `Back ups were made to ${colLoadRet.backupName} and ${seedsLoadRet.backupName}`
            this.emit('notification', {
              title: 'Corruption to the Collections and Seeds databases occurred but was corrected',
              level: 'warning',
              autoDismiss: 0,
              message,
              uid: message
            })
          }
        } else {
          // notify
          let message = `The database was backed up successfully to ${colLoadRet.backupName}`
          this.emit('notification', {
            title: 'Corruption to Collections database and was corrected',
            level: 'warning',
            autoDismiss: 0,
            message,
            uid: message
          })
        }
      }
    } else {
      try {
        seedsLoadRet = await this._loadSeeds()
      } catch (errLoadSeeds) {
        throw new FatalDBError(errLoadSeeds, 'Attempting to load the database after corruption was detected', 'Tracked Seeds')
      }
      if (seedsLoadRet.backUpSeeds) {
        if (seedsLoadRet.wasHardSeedsBk) {
          let message = 'Corruption correction failed to the tracked Seeds database. The seeds database had to be reset'
          this.emit('notification', {
            title: 'Corruption occurred to the Seeds database',
            level: 'warning',
            autoDismiss: 0,
            message,
            uid: message
          })
        } else {
          // notify had to backup seeds
          let message = `The seeds database was backed up successfully to ${seedsLoadRet.backupName}`
          this.emit('notification', {
            title: 'Corruption to the tracked Seeds database occurred and was corrected',
            level: 'warning',
            autoDismiss: 0,
            message,
            uid: message
          })
        }
      }
    }
    this._didLoad = true
  }

  initialLoad () {
    return this.getAllCollections()
  }

  addInitialMData (col, mdata) {
    return this._pywb.addMetadata({col, metadata: join(...mdata)})
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
        .on('error', err => {
          err.m = {
            wasError: true,
            err: err,
            message: {
              title: 'Could not get collection size',
              level: 'error',
              autoDismiss: 0,
              message: `Failed to get the size for collection ${col}`,
              uid: `Failed to get the size for collection ${col}`
            }
          }
          reject(err)
        })
    })
  }

  async createDefaultCol () {
    if (!this._didLoad) {
      await this.init()
    }
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

    let newCol
    try {
      newCol = await this._collections.insert(toCreate)
    } catch (error) {
      error.m = error.errorReport('Could not create the database entry for the default collections')
      throw error
    }
    newCol.seeds = []
    return newCol
  }

  async createCollection (ncol) {
    if (!this._didLoad) {
      await this.init()
    }
    let {col, metadata} = ncol
    await this._pywb.createCol({col})
    let colpath = path.join(this._colsBasePath, 'collections', col), created = moment().format()
    await CollectionsUtils.ensureColDirsNR(colpath, 'index')
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
    let newCol
    try {
      newCol = await this._collections.insert(toCreate)
    } catch (error) {
      error.m = error.errorReport(`Could not add the created collection ${col} to database`)
      throw error
    }
    return {
      seeds: [],
      ...newCol
    }
  }

  async getAllCollections () {
    if (!this._didLoad) {
      await this.init()
    }
    try {
      await CollectionsUtils.checkCollDirExistence(this._colsBasePath)
    } catch (noExist) {
      console.log('no exist')
      return await this._handleColDirNoExistence(noExist)
    }
    let {exist, empty, doNotExist} = await this._getAllColsWithExistCheck()
    let colSeeds = await this._colSeeds.wemFindAll('Could not retrieve the seeds from the database')
    if (empty) {
      if (colSeeds.length > 0) {
        console.log('recreate cols from seeds')
        return await this._recreateColsFromSeeds(colSeeds)
      } else {
        console.log('fall back created default col')
        return await this._fallBackCreateDefaultCol()
      }
    } else {
      colSeeds = transSeeds(colSeeds)
      console.log(colSeeds)
      if (doNotExist.length === 0) {
        console.log('donot exist len 0')
        return exist.map(col => {
          col.seeds = colSeeds[col.name] || []
          return col
        })
      } else {
        console.log('handle tracked not existing')
        await this._handleTrackedNotExisting(doNotExist, colSeeds)
        return exist.map(col => {
          col.seeds = colSeeds[col.name] || []
          return col
        })
      }
    }
  }

  async addCrawlInfo (confDetails) {
    if (!this._didLoad) {
      await this.init()
    }
    let {forCol, lastUpdated, seed} = confDetails
    const findSeed = {q: {_id: `${forCol}-${seed.url}`}, doUpdate: foundSeedChecker}
    const seedUpdate = {
      who: {_id: `${forCol}-${seed.url}`, url: seed.url},
      theUpdate (existingSeed) {
        let theUpdateColSeed = {$set: {lastUpdated}}
        if (!existingSeed.jobIds.includes(seed.jobId)) {
          theUpdateColSeed.$push = {jobIds: seed.jobId}
        }
        return theUpdateColSeed
      },
      opts: updateSingleOpts
    }
    const findAllSeeds = {$where () { return this.forCol === forCol }}
    seed._id = findSeed.q._id
    let colSeeds
    try {
      colSeeds = await this._colSeeds.findAndUpdateOrInsertThenFindAll(findSeed, seedUpdate, findAllSeeds, seed)
    } catch (err) {
      console.error(err)
      let errorMessage
      if (err.where === 'finding') {
        errorMessage = `Error updating ${forCol}'s seed ${seed.url}. A critical error occurred`
      } else if (err.where === 'inserting') {
        errorMessage = `Error updating ${forCol}'s seed ${seed.url}. Could not add a new seed entry for the crawl info due to critical error`
      } else if (err.where === 'find all after insert') {
        errorMessage = `Error updating ${forCol}'s seed ${seed.url}. Adding a new seed entry caused a critical error when retrieving the others`
      } else if (err.where === 'update after find') {
        errorMessage = `Error updating ${forCol}'s seed ${seed.url}. A caused a critical error during the update`
      } else if (err.where === 'find all after find and update') {
        errorMessage = `Error updating ${forCol}'s seed ${seed.url}. A caused a critical error during the update`
      }
      err.m = err.errorReport(errorMessage)
      throw err
    }
    let updateWho = {colName: forCol}, theUpdateCol = {$set: {lastUpdated}}, updatedCol
    try {
      updatedCol = await this._collections.update(updateWho, theUpdateCol, updateSingleOpts)
    } catch (err) {
      err.m = err.errorReport(`Error updating ${forCol}. A caused a critical error during the update for adding crawl info`)
      throw err
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

  async addWarcsFromWCreate ({col, warcs, lastUpdated, seed}) {
    if (!this._didLoad) {
      await this.init()
    }
    const templateArgs = {col}
    await this._pywb.reindexColToAddWarc(templateArgs)
    const size = await this.getColSize(col)
    const findSeed = {q: {_id: `${col}-${seed.url}`, url: seed.url}, doUpdate: foundSeedChecker}
    const seedUpdate = {
      who: {_id: `${col}-${seed.url}`, url: seed.url},
      theUpdate (existingSeed) {
        let theUpdateColSeed = {$set: {lastUpdated}, $inc: {mementos: 1}}
        if (!existingSeed.jobIds.includes(seed.jobId)) {
          theUpdateColSeed.$push = {jobIds: seed.jobId}
        }
        return theUpdateColSeed
      },
      opts: updateSingleOpts
    }
    const findAllSeeds = {$where () { return this.forCol === col }}
    seed._id = findSeed.q._id
    seed.mementos = 1
    seed.jobIds = [seed.jobId]

    let colSeeds
    try {
      colSeeds = await this._colSeeds.findAndUpdateOrInsertThenFindAll(findSeed, seedUpdate, findAllSeeds, seed)
    } catch (err) {
      console.error(err)
      let errorMessage
      if (err.where === 'finding') {
        errorMessage = `Error updating ${col}'s seed ${seed.url} after page only crawl. A critical error occurred`
      } else if (err.where === 'inserting') {
        errorMessage = `Error updating ${col}'s seed ${seed.url} after page only crawl. Could not add a new seed entry for the crawl info due to critical error`
      } else if (err.where === 'find all after insert') {
        errorMessage = `Error updating ${col}'s seed ${seed.url} after page only crawl. Adding a new seed entry caused a critical error when retrieving the others`
      } else if (err.where === 'update after find') {
        errorMessage = `Error updating ${col}'s seed ${seed.url} after page only crawl. A caused a critical error during the update`
      } else if (err.where === 'find all after find and update') {
        errorMessage = `Error updating ${col}'s seed ${seed.url} after page only crawl. A caused a critical error during the update`
      }
      err.m = err.errorReport(errorMessage)
      throw err
    }
    let updateWho = {colName: col}, theUpdateCol = {$inc: {numArchives: 1}, $set: {size, lastUpdated}}
    let updatedCol
    try {
      updatedCol = await this._collections.update(updateWho, theUpdateCol, updateSingleOpts)
    } catch (err) {
      err.m = err.errorReport(`Error updating ${col}. A caused a critical error during the update for adding crawl info`)
      throw err
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
    if (!this._didLoad) {
      await this.init()
    }
    const addedCount = await this._pywb.addWarcsToCol({col, warcs})
    const size = await this.getColSize(col)
    const findSeed = {q: {_id: `${col}-${seed.url}`, url: seed.url}, doUpdate: foundSeedChecker}
    const seedUpdate = {
      who: {_id: `${col}-${seed.url}`, url: seed.url},
      theUpdate (existingSeed) {
        let theUpdateColSeed = {$set: {lastUpdated}, $inc: {mementos: 1}}
        if (!existingSeed.jobIds.includes(seed.jobId)) {
          theUpdateColSeed.$push = {jobIds: seed.jobId}
        }
        return theUpdateColSeed
      },
      opts: updateSingleOpts
    }
    const findAllSeeds = {$where () { return this.forCol === col }}
    seed._id = findSeed.q._id
    seed.mementos = 1
    seed.jobIds = [seed.jobId]

    let colSeeds
    try {
      colSeeds = await this._colSeeds.findAndUpdateOrInsertThenFindAll(findSeed, seedUpdate, findAllSeeds, seed)
    } catch (err) {
      console.error(err)
      let errorMessage
      if (err.where === 'finding') {
        errorMessage = `Error updating ${col}'s seed ${seed.url} after adding a warc from the filesystem. A critical error occurred`
      } else if (err.where === 'inserting') {
        errorMessage = `Error updating ${col}'s seed ${seed.url} after adding a warc from the filesystem. Could not add a new seed entry for the crawl info due to critical error`
      } else if (err.where === 'find all after insert') {
        errorMessage = `Error updating ${col}'s seed ${seed.url} after adding a warc from the filesystem. Adding a new seed entry caused a critical error when retrieving the others`
      } else if (err.where === 'update after find') {
        errorMessage = `Error updating ${col}'s seed ${seed.url} after adding a warc from the filesystem. A caused a critical error during the update`
      } else if (err.where === 'find all after find and update') {
        errorMessage = `Error updating ${col}'s seed ${seed.url} after adding a warc from the filesystem. A caused a critical error during the update`
      }
      err.m = err.errorReport(errorMessage)
      throw err
    }
    let updateWho = {colName: col}, theUpdateCol = {$inc: {numArchives: addedCount}, $set: {size, lastUpdated}}
    let updatedCol
    try {
      updatedCol = await this._collections.update(updateWho, theUpdateCol, updateSingleOpts)
    } catch (err) {
      err.m = err.errorReport(`Error updating ${col} adding a warc from the filesystem.`)
      throw err
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
    if (!this._didLoad) {
      await this.init()
    }
    const addedCount = await this._pywb.addWarcsToCol({col, warcs})
    const size = await this.getColSize(col)
    const findSeed = {q: {_id: `${col}-${seed.url}`, url: seed.url}, doUpdate: foundSeedChecker}
    const seedUpdate = {
      who: {_id: `${col}-${seed.url}`, url: seed.url},
      theUpdate (existingSeed) {
        let theUpdateColSeed = {$set: {lastUpdated}, $inc: {mementos: 1}}
        if (!existingSeed.jobIds.includes(seed.jobId)) {
          theUpdateColSeed.$push = {jobIds: seed.jobId}
        }
        return theUpdateColSeed
      },
      opts: updateSingleOpts
    }
    const findAllSeeds = {$where () { return this.forCol === col }}
    seed._id = findSeed.q._id
    seed.mementos = 1
    seed.jobIds = [seed.jobId]

    let colSeeds
    try {
      colSeeds = await this._colSeeds.findAndUpdateOrInsertThenFindAll(findSeed, seedUpdate, findAllSeeds, seed)
    } catch (err) {
      console.error(err)
      let errorMessage
      if (err.where === 'finding') {
        errorMessage = `Error updating ${col}'s seed ${seed.url} after adding a warc from the filesystem. A critical error occurred`
      } else if (err.where === 'inserting') {
        errorMessage = `Error updating ${col}'s seed ${seed.url} after adding a warc from the filesystem. Could not add a new seed entry for the crawl info due to critical error`
      } else if (err.where === 'find all after insert') {
        errorMessage = `Error updating ${col}'s seed ${seed.url} after adding a warc from the filesystem. Adding a new seed entry caused a critical error when retrieving the others`
      } else if (err.where === 'update after find') {
        errorMessage = `Error updating ${col}'s seed ${seed.url} after adding a warc from the filesystem. A caused a critical error during the update`
      } else if (err.where === 'find all after find and update') {
        errorMessage = `Error updating ${col}'s seed ${seed.url} after adding a warc from the filesystem. A caused a critical error during the update`
      }
      err.m = err.errorReport(errorMessage)
      throw err
    }
    let updateWho = {colName: col}, theUpdateCol = {$inc: {numArchives: addedCount}, $set: {size, lastUpdated}}
    let updatedCol
    try {
      updatedCol = await this._collections.update(updateWho, theUpdateCol, updateSingleOpts)
    } catch (err) {
      err.m = err.errorReport(`Error updating ${col} adding a warc from the filesystem.`)
      throw err
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

  async _handleColDirNoExistence (errExist) {
    if (!this._didLoad) {
      await this.init()
    }
    let cols = await this._collections.findAll()
    let seeds = await this._colSeeds.findAll(), hadToBkup = false, bkupM = ''

    if (cols.length !== 0) {
      hadToBkup = true
      await this._backupColsLoad()
      bkupM += 'Had to backup Collections database'
    }
    if (seeds.length !== 0) {
      if (hadToBkup) {
        bkupM += 'and backup Seeds database'
      } else {
        bkupM += 'Had tp backup Seeds database'
      }
      hadToBkup = true
      await this._backupColSeedsLoad()
    }

    if (hadToBkup) {
      let what = errExist.what === 'warcs' ? 'WAIL_ManagedCollection' : `WAIL_ManagedCollection${path.sep}collections`
      this.emit('notification', {
        title: `${what} Did Not Exist`,
        level: 'error',
        autoDismiss: 0,
        message: bkupM,
        uid: bkupM
      })
    }
    try {
      await mvStartingCol(this._settings.get('iwarcs'), this._colsBasePath)
    } catch (error) {

    }
    return await this.createDefaultCol()
  }

  async _handleTrackedNotExisting (cols, seeds) {
    if (!this._didLoad) {
      await this.init()
    }
    const bkTime = new Date().getTime()
    let colbkPath = path.join(this._dbBasePath, `${bkTime}.trackedCollectionsNoLongerExisting.db`)
    let seedbkPath = path.join(this._dbBasePath, `${bkTime}.trackedSeedsNoLongerExisting.db`)
    const collsNotExisting = new Db({
      autoload: true,
      filename: colbkPath
    })
    const seedsNotExisting = new Db({
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
    this.emit('notification', {
      title: 'Some Tracked Collections Do Not Exist',
      level: 'error',
      autoDismiss: 0,
      message,
      uid: message
    })
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
      _id: col,
      name: col,
      colPath,
      size: colSize,
      lastUpdated: colLastUpdated.format(),
      created: colCreateTime.format(),
      numArchives: seeds.length,
      archive: path.join(colWarcP, 'archive'),
      indexes: path.join(colWarcP, 'indexes'),
      hasRunningCrawl: false,
      metadata
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
      try {
        await CollectionsUtils.manualCreateCol(defaultCol.colpath)
      } catch (error) {
        error.m = error.errorReport('Recreating the default collection uing PyWb and manual creation failed')
        throw error
      }
    }
    return defaultCol
  }

  async _recreateColsFromSeeds (seeds) {
    if (!this._didLoad) {
      await this.init()
    }
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

  async _getAllColsWithExistCheck () {
    if (!this._didLoad) {
      await this.init()
    }
    const existCheck = {exist: [], empty: false, doNotExist: []}
    let collections = await this._collections.wemFindAll('Could not retrieve the collections from the database')
    if (collections.length === 0) {
      existCheck.empty = true
      return existCheck
    } else {
      let len = collections.length, i = 0
      for (; i < len; ++i) {
        if (await checkPathExists(collections[i].colpath)) {
          existCheck.exist.push(collections[i])
        } else {
          existCheck.doNotExist.push(collections[i])
        }
      }
      return existCheck
    }
  }

  async _copyMaybeNormalizeDb (db, backupName) {
    let copyGood = true, normalizeGood = true
    try {
      await db.copyDbTo(backupName)
    } catch (error) {
      copyGood = false
    }
    if (copyGood) {
      try {
        await this.tryNormalizeDb(backupName, db.filePath)
      } catch (error) {
        normalizeGood = false
      }
      return normalizeGood
    }
    return copyGood
  }

  async _loadSeeds () {
    const ret = {backUpSeeds: false, wasHardSeedsBk: false}
    try {
      await this._colSeeds.loadDb()
    } catch (error) {
      ret.backUpSeeds = true
    }
    if (ret.backUpSeeds) {
      // corruption here we do not tollerate any
      const backUpTime = new Date().getTime()
      const backupName = `${this._colSeeds.filePath}.${backUpTime}.bk`
      let bkFirstTry = await this._copyMaybeNormalizeDb(this._colSeeds, backupName)
      if (!bkFirstTry) {
        await this._colSeeds.removeDbFromDisk()
        ret.wasHardSeedsBk = true
      } else {
        ret.backupName = backupName
      }
      await this._colSeeds.loadDb()
    }
    return ret
  }

  async _loadCols () {
    const ret = {backUpCols: false, wasHardColsBk: false}
    try {
      await this._collections.loadDb()
    } catch (error) {
      ret.backUpCols = true
    }
    if (ret.backUpCols) {
      // corruption here we do not tollerate any
      const backUpTime = new Date().getTime()
      const backupName = `${this._collections.filePath}.${backUpTime}.bk`
      let bkFirstTry = await this._copyMaybeNormalizeDb(this._collections, backupName)
      if (!bkFirstTry) {
        await this._collections.removeDbFromDisk()
        ret.wasHardColsBk = true
      } else {
        ret.backupName = backupName
      }
      await this._collections.loadDb()
    }
    return ret
  }

  async _backupColsLoad (init = false) {
    const backUpTime = new Date().getTime()
    const backupName = `${this._collections.filePath}.${backUpTime}.bk`
    let copyGood = false, removeGood = true
    try {
      await this._collections.copyDbTo(backupName)
    } catch (error) {
      copyGood = false
    }
    try {
      await this._collections.removeDbFromDisk()
    } catch (error) {
      removeGood = false
    }

    try {
      await this._collections.loadDb()
    } catch (error) {
      // fatal
      let copyPart, removePart
      if (copyGood) {
        copyPart = `Back up created @${backupName}`
      } else {
        copyPart = 'We could not back it up'
      }
      if (removeGood) {
        removePart = `and we attempted to start over but loading still failed`
      } else {
        removePart = 'and we could not remove the database file and load still failed'
      }
      let fatalErrorMessage
      if (init) {
        fatalErrorMessage = `Loading the collection seeds database failed after the collection seeds database was to corrupted to recover. ${copyPart} ${removePart}`
      } else {
        fatalErrorMessage = `Loading the collection seeds database failed. ${copyPart} ${removePart}`
      }
      throw new FatalDBError(error, fatalErrorMessage, 'Collections')
    }
    return backupName
  }

  async _backupColSeedsLoad (init = false) {
    const backUpTime = new Date().getTime()
    const backupName = `${this._colSeeds.filePath}.${backUpTime}.bk`
    let copyGood = false, removeGood = true
    try {
      await this._colSeeds.copyDbTo(backupName)
    } catch (error) {
      copyGood = false
    }
    try {
      await this._colSeeds.removeDbFromDisk()
    } catch (error) {
      removeGood = false
    }

    try {
      await this._colSeeds.loadDb()
    } catch (error) {
      // fatal
      let copyPart, removePart
      if (copyGood) {
        copyPart = `Back up created @${backupName}`
      } else {
        copyPart = 'We could not back it up'
      }
      if (removeGood) {
        removePart = `and we attempted to start over but loading still failed`
      } else {
        removePart = 'and we could not remove the database file and load still failed'
      }
      let fatalErrorMessage
      if (init) {
        fatalErrorMessage = `Loading the collection seeds database failed after the collections database was to corrupted to recover. ${copyPart} ${removePart}`
      } else {
        fatalErrorMessage = `Loading the collection seeds database failed. ${copyPart} ${removePart}`
      }
      throw new FatalDBError(error, fatalErrorMessage, 'Collection Seeds')
    }
    return backupName
  }
}
