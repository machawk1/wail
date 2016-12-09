import fs from 'fs-extra'
import Promise from 'bluebird'
import cp from 'child_process'

export default function moveStartingCol (moveMe, moveTo) {
  return new Promise((resolve, reject) => {
    fs.stat(moveTo, (errC, stats) => {
      if (errC) {
        if (errC.code === 'ENOENT') {
          fs.ensureDir(moveTo, errEn => {
            if (errEn) {
              errEn.where = 1
              return reject(errEn)
            } else {
              cp.exec(`cp -r ${moveMe} ${moveTo}`, (error, stdout, stderr) => {
                if (error) {
                  error.where = 2
                  console.log(`stderr: ${stderr}`)
                  return reject(error)
                }
                console.log(`stdout: ${stdout}`)
                console.log(`stderr: ${stderr}`)
                return resolve()
              })
            }
          })
        }
      } else {
        let alreadyThere = new Error('It was already there')
        alreadyThere.where = 0
        reject(alreadyThere)
      }
    })
  })
}
