import S from 'string'
import cp from 'child_process'
import { remote } from 'electron'

const settings = remote.getGlobal('settings')

export default class PyWb {
  static defaultExeArgs = {cwd: settings.get('warcs')}

  static addMetadata (templateArgs, exeArgs = PyWb.defaultExeArgs) {
    return new Promise((resolve, reject) => {
      let exec = S(settings.get('pywb.addMetadata')).template(templateArgs).s
      cp.exec(exec, exeArgs, (error, stdout, stderr) => {
        if (error) {
          console.error(stderr)
          return reject(error)
        } else {
          resolve({stdout, stderr})
        }
      })
    })
  }

  static reindexCol (templateArgs, exeArgs = PyWb.defaultExeArgs) {
    return new Promise((resolve, reject) => {
      let exec = S(settings.get('pywb.reindexCol')).template(templateArgs).s
      cp.exec(exec, exeArgs, (error, stdout, stderr) => {
        if (error) {
          console.error(stderr)
          return reject(error)
        } else {
          resolve({stdout, stderr})
        }
      })
    })
  }

  static addWarcsToCol (templateArgs, exeArgs = PyWb.defaultExeArgs) {
    return new Promise((resolve, reject) => {
      let exec = S(settings.get('pywb.addWarcsToCol')).template(templateArgs).s
      cp.exec(exec, exeArgs, (error, stdout, stderr) => {
        if (error) {
          console.error(stderr)
          return reject(error)
        } else {
          let c1 = ((stdout || ' ').match(/INFO/g) || []).length
          let c2 = ((stderr || ' ').match(/INFO/g) || []).length
          resolve(c1 === 0 ? c2 : c1)
        }
      })
    })
  }

  static createCol (templateArgs, exeArgs = PyWb.defaultExeArgs) {
    return new Promise((resolve, reject) => {
      let exec = S(settings.get('pywb.newCollection')).template(templateArgs).s
      cp.exec(exec, exeArgs, (error, stdout, stderr) => {
        if (error) {
          console.error(stderr)
          return reject(error)
        } else {
          resolve({stdout, stderr})
        }
      })
    })
  }

}