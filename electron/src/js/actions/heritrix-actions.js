import wailConstants from '../constants/wail-constants'
import child_process from 'child_process'
import rp from 'request-promise'

const heritrix = wailConstants.Heritrix
const paths = wailConstants.Paths

export async function launchHeritrix() {
   child_process.exec(`sh ${paths.heritrixBin} -a=${heritrix.username}:${heritrix.password}`,(err,stdout,stderr) => {
      console.log(err,stdout,stderr)
   })
}

export async function killHeritrix() {
   child_process.exec("ps ax | grep 'heritrix' | grep -v grep | awk '{print \"kill -9 \" $1}'\" | sh", (err,stdout,stderr) => {
      console.log(err,stdout,stderr)
   })
}

export async function launchHeritrixJob(jobText) {
   
   child_process.exec(`sh ${paths.heritrixBin} -a=${heritrix.username}:${heritrix.password}`,(err,stdout,stderr) => {
      console.log(err,stdout,stderr)
   })
}
