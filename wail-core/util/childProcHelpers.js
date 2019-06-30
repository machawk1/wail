import cp from 'child_process'
import Promise from 'bluebird'

class ExecuteError extends Error {
  constructor (oError, stdout, stderr) {
    super(`ExecuteError[${where}]`)
    Object.defineProperty(this, 'name', {
      value: this.constructor.name
    })
    this.oError = oError
    this.stdout = stdout
    this.stderr = stderr
    Error.captureStackTrace(this, ExecuteError)
  }
}

export function execute (ex, opts, outputTransform) {
  return new Promise((resolve, reject) => {
    cp.exec(ex, opts, (error, stdout, stderr) => {
      if (error) {
        reject(new ExecuteError(error, stdout, stderr))
      } else {
        if (outputTransform) {
          resolve(outputTransform(stdout, stderr))
        } else {
          resolve({stdout, stderr})
        }
      }
    })
  })
}
