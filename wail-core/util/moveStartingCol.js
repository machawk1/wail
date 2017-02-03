import fs from 'fs-extra'
import Promise from 'bluebird'
import cp from 'child_process'

export default function moveStartingCol (moveMe, moveTo) {
  console.log('move starting col', moveMe, moveTo)
  return new Promise((resolve, reject) => {
    fs.stat(moveTo, (errC, stats) => {
      if (errC) {
        if (errC.code === 'ENOENT') {
          fs.ensureDir(moveTo, errEn => {
            if (errEn) {
              errEn.where = 1
              return reject(errEn)
            } else {
              fs.copy(moveMe, moveTo, (errCopy) => {
                if (errCopy) {
                  errCopy.where = 2
                  console.error(errCopy)
                  return reject(errCopy)
                } else {
                  return resolve()
                }
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
