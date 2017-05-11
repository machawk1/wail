import cp from 'child_process'
import fs from 'fs-extra'
import Promise from 'bluebird'
import { remote } from 'electron'
import S from 'string'
S.TMPL_CLOSE = '}'
S.TMPL_OPEN = '{'

const settings = remote.getGlobal('settings')

export class WarcUtilError extends Error {
  constructor (oError, where) {
    super(`WarcUtilError[${where}]`)
    Object.defineProperty(this, 'name', {
      value: this.constructor.name
    })
    this.oError = oError
    this.where = where
    Error.captureStackTrace(this, WarcUtilError)
  }
}

export function extractSeeds (path, mode = 'f') {
  let template
  if (mode === 'f' || mode === 'file') {
    template = settings.get('extractSeed.file')
  } else {
    template = settings.get('extractSeed.dir')
  }
  let exePath = S(template).template({path}).s
  console.log(exePath)
  return new Promise((resolve, reject) => {
    cp.exec(exePath, (error, stdout, stderr) => {
      if (error) {
        return reject(new WarcUtilError(error, 'Executing the seed extractor'))
      } else {
        let extractedSeeds
        try {
          extractedSeeds = JSON.parse(stdout)
        } catch (e) {
          return reject(new WarcUtilError(e, 'Parsing the returned Json from the Seed Extractor'))
        }
        resolve(extractedSeeds)
      }
    })
  })
}

export function isWarcValid (path, mode = 'f') {
  let template
  if (mode === 'f' || mode === 'file') {
    template = settings.get('warcChecker.file')
  } else {
    template = settings.get('warcChecker.dir')
  }
  let exePath = S(template).template({path}).s

  return new Promise((resolve, reject) => {
    cp.exec(exePath, (error, stdout, stderr) => {
      if (error) {
        return reject(new WarcUtilError(error, 'executing'))
      } else {
        let validity
        try {
          validity = JSON.parse(stdout)
        } catch (e) {
          return reject(new WarcUtilError(e, 'parsing json'))
        }
        resolve(validity)
      }
    })
  })
}

const warcRenamer = badWarc =>
  new Promise((resolve, reject) => {
    let newName = `${badWarc.filep}.invalid`
    fs.rename(badWarc.filep, newName, err => {
      if (err) {
        return reject(err)
      }
      badWarc.filep = newName
      resolve(badWarc)
    })
  })

export function renameBadWarcs (badWarcs) {
  if (Array.isArray(badWarcs)) {
    return Promise.map(badWarcs, warcRenamer, {concurrency: 1})
  }
  return warcRenamer(badWarcs)
}
