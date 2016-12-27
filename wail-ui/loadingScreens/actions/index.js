import shelljs from 'shelljs'
import named from 'named-regexp'
import Promise from 'bluebird'
import S from 'string'
import os from 'os'
import cp from 'child_process'
import { remote } from 'electron'
import { send } from 'redux-electron-ipc'
import { OS_CHECK, JAVA_CHECK, JDK_DOWNLOAD, STEP, JDK_INSTALL, SERVICES } from '../constants'

const {NEXT_LOADING_STEP, PREV_LOADING_STEP,} = STEP
const {CHECKED_OS} = OS_CHECK
const {CHECKED_JAVA} = JAVA_CHECK
const {DL_JDK, DL_JDK_STARTED} = JDK_DOWNLOAD
const {START_INSTALL, INSTALL_PROCESS_ERROR} = JDK_INSTALL

const {HERITRIX_STARTED, HERITRIX_STARTED_ERROR, WAYBACK_STARTED, WAYBACK_STARTED_ERROR,} = SERVICES

const settings = remote.getGlobal('settings')
const serviceManager = remote.getGlobal('serviceMan')
const {app} = remote

const swapper = S('')

const whichOS = os => {
  switch (os) {
    case 'darwin':
      return 'MacOS'
    case 'linux':
      return 'Linux'
    case 'win':
      return 'Windows'
  }
}

const whichArch = arch => arch === 'x32' ? '32bit' : '64bit'

export const osCheck = () => ({
  type: CHECKED_OS,
  os: whichOS(os.platform()),
  arch: whichArch(os.arch())
})

const checkJavaOnPath = () => {
  let oneSevenOnPath = false
  swapper.setValue(process.env['JAVA_HOME'] || '')
  if (!swapper.isEmpty()) {
    if (swapper.contains('1.7')) {
      oneSevenOnPath = true
    }
  }
  swapper.setValue(process.env['JDK_HOME'] || '')
  if (!swapper.isEmpty()) {
    if (swapper.contains('1.7')) {
      oneSevenOnPath = true
    }
  }
  swapper.setValue(process.env['JRE_HOME'] || '')
  if (!swapper.isEmpty()) {
    if (swapper.contains('1.7')) {
      oneSevenOnPath = true
    }
  }
  return oneSevenOnPath
}

export const checkJavaOsx = () => {
  let haveCorrectJava = false, haveJava = false
  let jvmRegex = named.named(/\/[a-zA-z/]+(:<jvm>.+)/)
  let jvms = shelljs.ls('-d', '/Library/Java/JavaVirtualMachines/*.jdk')
  let len = jvms.length
  let javaV = ''
  if (len > 0) {
    haveJava = true
    let javaVs = []
    for (let i = 0; i < len; ++i) {
      let jvm = jvms[i]
      let jvmTest = jvmRegex.exec(jvm)
      if (jvmTest) {
        let jvm = jvmTest.capture('jvm')
        if (swapper.setValue(jvm).contains('1.7')) {
          console.log('darwin java check 1.7 installed')
          haveCorrectJava = true
          break
        } else {
          javaVs.push()
        }
      }
    }
  }
  return {
    haveCorrectJava,
    haveJava
  }
}

export const executeJavaVersion = (resolve, reject) =>
  cp.exec('java -version', (err, stdout, stderr) => {
    console.log('check java linux/win executed java version')
    let haveCorrectJava = false
    let haveJava = false
    let download = false
    let javaV = ''
    let jvRegex = named.named(/java version "(:<jv>[0-9._]+)"/g)
    let jvTest = jvRegex.exec(stderr)
    if (jvTest) {
      haveJava = true
      let jv = jvTest.capture('jv')
      if (swapper.setValue(jv).contains('1.7')) {
        console.log('check java linux/win executed java version have 1.7')
        haveCorrectJava = true
      } else {
        javaV = jv.substr(0, 3)
      }
    } else {
      console.log('check java linux/win executed java version done have java')
      haveJava = false
    }
    if (process.platform === 'darwin') {
      download = !haveCorrectJava
      if (download){
        settings.set('didFirstLoad', false)
      }
    }
    resolve({type: CHECKED_JAVA, haveJava, javaV, haveCorrectJava, download})
  })

export const checkJava = () => new Promise((resolve, reject) => {
  console.log('checking java')
  let oneSevenOnPath = checkJavaOnPath()
  if (oneSevenOnPath) {
    console.log('checking java linux/windows 1.7 on path')
    resolve({type: CHECKED_JAVA, haveJava: true, haveCorrectJava: true, download: false})
  } else {
    executeJavaVersion(resolve, reject)
  }
})

export const installJdk = () => new Promise((resolve, reject) => {
  settings.set('didFirstLoad', false)
  cp.exec('hdiutil attach /tmp/java7.dmg', (errAttach, stdoutO, stderrO) => {
    if (errAttach) {
      resolve({
        type: INSTALL_PROCESS_ERROR,
        report: {
          where: 'attach',
          error: errAttach,
          stderr: stderrO
        }
      })
    } else {
      // console.log(stderr, stdout)
      cp.exec('open /Volumes/JDK\\ 7\\ Update\\ 79/JDK\\ 7\\ Update\\ 79.pkg', (errOpen, stdout, stderr) => {
        if (errOpen) {
          console.error(errOpen)
          resolve({
            type: INSTALL_PROCESS_ERROR,
            report: {
              where: 'open',
              error: errOpen,
              stderr
            }
          })

        } else {
          console.log(stderr, stdout)
          app.exit(1)
        }
      })
    }
  })
})

export const startJdkInstall = () => ({type: START_INSTALL})

export const downloadJDK = () => ({
  type: DL_JDK_STARTED
})

export const nextLoadingStep = () => ({
  type: NEXT_LOADING_STEP
})

export const prevLoadingStep = () => ({
  type: PREV_LOADING_STEP
})

export const startHeritrix = () => new Promise((resolve, reject) =>
  serviceManager.startHeritrixLoading()
    .then(startReport => {
      if (startReport.wasError) {
        console.log('heritrix started error')
        resolve({
          type: HERITRIX_STARTED_ERROR,
          errorReport: startReport.errorReport
        })
      } else {
        resolve({type: HERITRIX_STARTED})
      }
    })
)

export const startWayback = () => new Promise((resolve, reject) =>
  serviceManager.startWaybackLoading()
    .then(startReport => {
      if (startReport.wasError) {
        resolve({
          type: WAYBACK_STARTED_ERROR,
          errorReport: startReport.errorReport
        })
      } else {
        resolve({type: WAYBACK_STARTED})
      }
    })
)

export const didFirstLoad = () => {
  settings.set('didFirstLoad', true)
  return send('loading-finished')
}

export const notFirstLoadComplete = () => send('loading-finished')
