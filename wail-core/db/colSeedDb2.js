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
import DB from './db'
import PyWb from '../pywb'
import { checkPathExists, removeFile, getFsStats } from '../util/fsHelpers'
import { getYamlOrWriteIfAbsent, writeYaml } from '../util/yaml'

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

export default class ColSeedDb {
  constructor (colOpts, seedOpts) {
    this._collections = new DB(colOpts)
    this._colSeeds = new DB(seedOpts)
  }

  async retrieveAll () {

  }
}