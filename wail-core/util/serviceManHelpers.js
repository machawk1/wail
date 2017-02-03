import path from 'path'
import cp from 'child_process'
import S from 'string'
import psTree from 'ps-tree'
import Promise from 'bluebird'

const netStatReg = /(?:[^\s]+\s+){6}([^\s]+).+/
const bundledHeritrix = `bundledApps${path.sep}heritrix`

const wasHeritrixStartError = (out, err) => {
  let errOut = S(err)
  let wasStartErrorReport = {
    wasError: false,
    errorType: -1,
    errorMessage: ''
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

const findHPidWindows = () => new Promise((resolve, reject) => Promise.delay(3000).then(() => {
    let cmd = 'Tasklist /fi "Windowtitle eq Heritrix" /fo csv'
    cp.exec(cmd, (err, stderr, stdout) => {
      if (err) {
        console.error(err)
        reject(err)
      } else {
        console.log(stderr)
        let ret = {found: false}
        if (stderr.indexOf('INFO: No tasks are running which match the specified criteria.') === -1) {
          stderr = stderr.replace(/\r/g, '').replace(/"/g, '')
          let lines = stderr.split('\n')
          lines.splice(-1, 1)
          let len = lines.length
          if (len === 3) {
            let pid = parseInt(lines[2].split(',')[1])
            console.log(pid)
            ret.found = true
            ret.pid = pid
          } else if (len === 2) {
            let pid = parseInt(lines[1].split(',')[1])
            console.log(pid)
            ret.found = true
            ret.pid = pid
          }
        }
        console.log('result of trying to find the hertrix pid windows', ret)
        resolve(ret)
      }
    })
  })
)

const findWbPidWindows = () => new Promise((resolve, reject) => {
  let cmdwb = 'Tasklist /fi "ImageName eq wayback.exe" /fo csv'
  cp.exec(cmdwb, (err, stderr, stdout) => {
    if (err) {
      console.error(err)
      reject(err)
    } else {
      if (stderr.indexOf('INFO: No tasks are running which match the specified criteria.') === -1) {
        stderr = stderr.replace(/\r/g, '').replace(/"/g, '')
        let lines = stderr.split('\n')
        lines.splice(-1, 1)
        let pid = parseInt(lines[1].split(',')[1])
        console.log('result of trying to find the wayback pid windows', pid)
        resolve({found: true, pid})
      } else {
        resolve({found: false})
      }
    }
  })
})

const killPid = pid => new Promise((resolve, reject) => {
  if (process.platform !== 'win32') {
    psTree(pid, (err, kids) => {
      if (err) {
        console.error('ps tree error', err)
        process.kill(pid, 'SIGTERM')
      } else {
        if (kids.length > 0) {
          let dukeNukem = cp.spawn('kill', ['-9'].concat(kids.map(p => p.PID)), {
            detached: true,
            shell: true,
            stdio: ['ignore', 'ignore', 'ignore']
          })
          dukeNukem.unref()
        } else {
          process.kill(pid, 'SIGTERM')
        }
      }
      resolve()
    })
  } else {
    cp.exec('taskkill /PID ' + pid + ' /T /F', (error, stdout, stderr) => {
      if (error) {
        console.error('really bad juju taskkill', stderr)
      }
      resolve()
    })
  }
})

export {
  findProcessOnHeritrixPort,
  heritrixFinder,
  wasHeritrixStartError,
  heritrixLaunchErrorReport,
  findHPidWindows,
  findWbPidWindows,
  killPid
}
