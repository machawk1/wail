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
import * as fs from 'fs-extra'
import moment from 'moment'
import prettyBytes from 'pretty-bytes'
import _ from 'lodash'
import EventEmitter from 'eventemitter3'
import { Observable } from 'rxjs'
import { checkPathExists, readDir, getFsStats, removeFile } from '../util/fsHelpers'
import { getYamlOrWriteIfAbsent, writeYaml } from '../util/yaml'
import { execute } from '../util/childProcHelpers'
import { mvStartingCol } from '../util/moveStartingCol'
import PyWb from '../pywb'
import { FatalDBError } from '../db/dbErrors'
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
    this._collections = new Db(dbOpts(arDbM, 'Collections Database', autoLoad), dbPathMutate)
    this._colSeeds = new Db(dbOpts(arsDbM, 'Seeds Database', autoLoad), dbPathMutate)
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
        return await this._recreateColsFromSeeds(colSeeds)
      } else {
        return await this._fallBackCreateDefaultCol()
      }
    } else {
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
    }
  }

  async addCrawlInfo (confDetails) {
    let {forCol, lastUpdated, seed} = confDetails
    const findSeed = {q: {_id: `${forCol}-${seed.url}`}, doUpdate: foundSeedChecker}
    const seedUpdate = {
      who: {_id: `${forCol}-${seed.url}`},
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

  async _getAllColsWithExistCheck () {
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
      console.log(existCheck)
      return existCheck
    }
  }

  async addWarcsFromWCreate ({col, warcs, lastUpdated, seed}) {

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
