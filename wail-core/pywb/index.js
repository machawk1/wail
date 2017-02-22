import S from 'string'
import cp from 'child_process'

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

class PyWbError extends Error {
  constructor (oError, message) {
    super(message)
    Object.defineProperty(this, 'name', {
      value: this.constructor.name
    })
    this.m = errorReport(oError, message)
  }
}

export default class PyWb {
  constructor (settings) {
    this._defaultArgs = {cwd: settings.get('warcs')}
    this._addMetaDataTemplate = settings.get('pywb.addMetadata')
    this._reindexTemplate = settings.get('pywb.reindexCol')
    this._newColTemplate = settings.get('pywb.newCollection')
    this._addWarcsTemplate = settings.get('pywb.addWarcsToCol')
  }

  addMetadata (templateArgs, exeArgs) {
    exeArgs = exeArgs || this._defaultArgs
    return new Promise((resolve, reject) => {
      let exec = S(this._addMetaDataTemplate).template(templateArgs).s
      cp.exec(exec, exeArgs, (error, stdout, stderr) => {
        if (error) {
          console.error(stderr)
          reject(new PyWbError(error, `Could Not Add metadata to ${templateArgs.col} because ${stdout + stderr}`))
        } else {
          resolve({stdout, stderr})
        }
      })
    })
  }

  reindexCol (templateArgs, exeArgs) {
    exeArgs = exeArgs || this._defaultArgs
    return new Promise((resolve, reject) => {
      let exec = S(this._reindexTemplate).template(templateArgs).s
      cp.exec(exec, exeArgs, (error, stdout, stderr) => {
        if (error) {
          console.error(stderr)
          reject(new PyWbError(error, `Could Not Reindex ${templateArgs.col} because ${stdout + stderr}`))
        } else {
          resolve({stdout, stderr})
        }
      })
    })
  }

  reindexColToAddWarc (templateArgs, exeArgs) {
    exeArgs = exeArgs || this._defaultArgs
    return new Promise((resolve, reject) => {
      let exec = S(this._reindexTemplate).template(templateArgs).s
      cp.exec(exec, exeArgs, (error, stdout, stderr) => {
        if (error) {
          console.error(stderr)
          reject(new PyWbError(error, `Could Not Add Warcs to ${templateArgs.col} because ${stdout + stderr}`))
        } else {
          resolve({stdout, stderr})
        }
      })
    })
  }

  addWarcsToCol (templateArgs, exeArgs) {
    exeArgs = exeArgs || this._defaultArgs
    return new Promise((resolve, reject) => {
      let exec = S(this._addWarcsTemplate).template(templateArgs).s
      cp.exec(exec, exeArgs, (error, stdout, stderr) => {
        if (error) {
          console.error(stderr)
          reject(new PyWbError(error, `Could Not Add Warcs to ${templateArgs.col} because ${stdout + stderr}`))
        } else {
          let c1 = ((stdout || ' ').match(/INFO/g) || []).length
          let c2 = ((stderr || ' ').match(/INFO/g) || []).length
          resolve(c1 === 0 ? c2 : c1)
        }
      })
    })
  }

  createCol (templateArgs, exeArgs) {
    exeArgs = exeArgs || this._defaultArgs
    return new Promise((resolve, reject) => {
      let exec = S(this._newColTemplate).template(templateArgs).s
      cp.exec(exec, exeArgs, (error, stdout, stderr) => {
        if (error) {
          console.error(stderr)
          reject(new PyWbError(error, `Could create collection ${templateArgs.col} because ${stdout + stderr}`))
        } else {
          resolve({stdout, stderr})
        }
      })
    })
  }
}
