import path from 'path'
import cp from 'child_process'
import S from 'string'
import Promise from 'bluebird'

const netStatReg = /(?:[^\s]+\s+){6}([^\s]+).+/
const bundledHeritrix = `bundledApps${path.sep}heritrix`

const wasHeritrixStartError = (out, err) => {
  let errOut = S(err)
  let wasStartErrorReport = {
    wasError: false,
    errorType: -1,
    errorMessage: '',
  }
  if (out.contains('Exception') || errOut.contains('Exception')) {
    wasStartErrorReport.wasError = true
    if (out.contains('java.net.BindException') || errOut.contains('java.net.BindException')) {
      wasStartErrorReport.errorType = 1
      wasStartErrorReport.errorMessage = 'Heritrix failed to start due to port in use'
    } else {
      wasStartErrorReport.errorType = 2
      wasStartErrorReport.errorMessage = 'Heritrix failed to start due to technical reasons'
    }
  }
  return wasStartErrorReport
}

const heritrixFinder = result => {
  let len = result.length, i = 0
  let findReport = {found: false, pid: -1, isWails: false}
  for (; i < len; ++i) {
    let {pid, cmd} = result[i]
    if (cmd.indexOf('heritrix') > 0) {
      findReport.found = true
      findReport.pid = pid
      if (cmd.indexOf(bundledHeritrix) > 0) {
        findReport.isWails = true
      }
      break
    }
  }
  return findReport
}

const findProcessOnHeritrixPort = () => new Promise((resolve, reject) => {
  cp.exec('netstat -anp 2> /dev/null | grep :8443', (err, stdout, stderr) => {
    if (err) {
      reject(err)
    } else {
      let maybeMatch = stdout.match(netStatReg)
      if (maybeMatch) {
        let [pid, pname] = maybeMatch[1].split('/')
        resolve({
          found: true,
          whoOnPort: {pid, pname}
        })
      } else {
        resolve({found: false, whoOnPort: {}})
      }
    }
  })
})

const heritrixLaunchErrorReport = (eMessage, where) => ({
  wasError: true,
  errorReport: {
    error: eMessage,
    where
  }
})

export {
  findProcessOnHeritrixPort,
  heritrixFinder,
  wasHeritrixStartError,
  heritrixLaunchErrorReport,
}