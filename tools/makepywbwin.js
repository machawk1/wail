const request = require('request')
const reqProg = require('request-progress')
const fs = require('fs-extra')
const Promise = require('bluebird')

const ensureDir = dir => new Promise((resolve,reject) => {
  fs.ensureDir(dir,err => {
    if (err) {
      reject(err)
    } else {
      resolve()
    }
  })
})