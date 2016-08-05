import "babel-polyfill"
import fs from 'fs-extra'
import path from 'path'
import cp from 'child_process'


const areBoostrappingNode = true
let bstrapPath = ''

let modules = [
  path.resolve(__dirname, 'wail-core'),
  path.resolve(__dirname, 'wail-ui')
]

