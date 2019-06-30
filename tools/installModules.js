import "babel-polyfill"
import fs from 'fs-extra'
import path from 'path'
import cp from 'child_process'


const areBoostrappingNode = false
let bstrapPath = ''

let modules = [
  path.resolve(__dirname, '../wail-core'),
  path.resolve(__dirname, '../wail-ui')
]


modules.forEach( m => {
  fs.stat(path.join(m,'package.json'),(err, stat) => {
    if(err) {
      console.log('it does not exist',err)
    } else {
      console.log(stat)
      cp.spawn('npm',['i'],{ env: process.env, cwd: m, stdio: 'inherit' })
    }
  })
})

