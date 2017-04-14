import Promise from 'bluebird'
import * as fs from 'fs-extra'

const skip = ['watch', 'watchFile', 'unwatchFile', 'createReadStream', 'createWriteStream']

export default Promise.promisifyAll(fs, {
  filter (name, func, target, passesDefaultFilter) {
    if (name.slice(-4) === 'Sync') return false
    if (skip.indexOf(name) !== -1) return false
    if (name.match(/^[A-Z]/)) return false
    return passesDefaultFilter
  }
})
