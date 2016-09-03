import Db from 'nedb'
import Promise from 'bluebird'
import cp from 'child_process'
import path from 'path'
import join from 'joinable'
import S from 'string'
import util from 'util'
S.TMPL_OPEN = '{'
S.TMPL_CLOSE = '}'

export default class ArchiveManager {
  constructor (dbPath,settings) {
    this.db = new Db({
      filename: dbPath,
      autoload: true
    })
    this.settings = settings
  }

  addWarcsToCol(col,warcs) {
    let opts = {
      cwd: this.settings.get('warcs')
    }

    return new Promise((resolve, reject) => {
      // `/home/john/my-fork-wail/bundledApps/pywb/wb-manager add ${id} ${data.existingWarcs}`
      let exec = S(this.settings.get('pywb.addWarcsToCol')).template({ col, warcs }).s
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
        return resolve(this.app.service('archives').update(id, { $inc: { numArchives: count } }))
      })
    })

  }
}
