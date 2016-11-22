import cp from 'child_process'
import Promise from 'bluebird'

export function execute (ex, opts, outputTransform) {
  return new Promise((resolve, reject) => {
    cp.exec(ex, opts, (error, stdout, stderr) => {
      if (error) {
        reject({ error, stdout, stderr })
      } else {
        if (outputTransform) {
          resolve(outputTransform(stdout, stderr))
        } else {
          resolve({ stdout, stderr })
        }
      }
    })
  })
}