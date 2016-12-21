import shelljs from 'shelljs'
import named from 'named-regexp'
import Promise from 'bluebird'
import S from 'string'
import os from 'os'
import cp from 'child_process'
import request from 'request'
import { remote } from 'electron'
import {
  CHECKED_OS,
  CHECKED_JAVA,
  CHECKED_JAVA_ON_PATH,
  CHECKED_JAVA_OSX,
  NEXT_LOADING_STEP,
  PREV_LOADING_STEP
} from '../constants'

const osxJava7DMG = 'http://matkelly.com/wail/support/jdk-7u79-macosx-x64.dmg'
const swapper = S('')

const askDLConfig = {
  type: 'question',
  title: 'Download Required JDK',
  detail: 'In order to use Wail you must have a jdk. Otherwise you can not use this this tool.',
  buttons: [ 'Yes', 'No' ],
  message: 'Java needs to be installed for Heritrix',
  cancelId: 666
}

const whichOS = os => {
  switch (os) {
    case 'darwin':
      return 'OSX'
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
  swapper.setValue(process.env[ 'JAVA_HOME' ] || '')
  if (!swapper.isEmpty()) {
    if (swapper.contains('1.7')) {
      oneSevenOnPath = true
    }
  }
  swapper.setValue(process.env[ 'JDK_HOME' ] || '')
  if (!swapper.isEmpty()) {
    if (swapper.contains('1.7')) {
      oneSevenOnPath = true
    }
  }
  swapper.setValue(process.env[ 'JRE_HOME' ] || '')
  if (!swapper.isEmpty()) {
    if (swapper.contains('1.7')) {
      oneSevenOnPath = true
    }
  }
  return oneSevenOnPath
}

export const checkJavaOsx = () => {
  let haveCorrectJava = false, haveJava = false
  let oneSevenOnPath = checkJavaOnPath()
  if (oneSevenOnPath) {
    haveCorrectJava = true
    haveJava = true
  } else {
    let jvmRegex = named.named(/\/[a-zA-z/]+(:<jvm>.+)/)
    let jvms = shelljs.ls('-d', '/Library/Java/JavaVirtualMachines/*.jdk')
    let len = jvms.length
    if (len > 0) {
      haveJava = true
      for (let i = 0; i < len; ++i) {
        let jvm = jvms[ i ]
        let jvmTest = jvmRegex.exec(jvm)
        if (jvmTest) {
          if (swapper.setValue(jvmTest.capture('jvm')).contains('1.7')) {
            haveCorrectJava = true
            break
          }
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
    let haveCorrectJava = false
    let haveJava = false
    let jvRegex = named.named(/java version "(:<jv>[0-9._]+)"/g)
    let jvTest = jvRegex.exec(stderr)
    if (jvTest) {
      haveJava = true
      let jv = jvTest.capture('jv')
      if (swapper.setValue(jv).contains('1.7')) {
        haveCorrectJava = true
      }
    } else {
      haveJava = false
    }
    resolve({ type: CHECKED_JAVA, haveJava, haveCorrectJava, download: false })
  })

export const checkJava = () => new Promise((resolve, reject) => {
  if (process.platform === 'darwin') {
    let { haveCorrectJava, haveJava } = checkJavaOsx()
    resolve({ type: CHECKED_JAVA, haveJava, haveCorrectJava, download: !haveCorrectJava })
  } else {
    let oneSevenOnPath = checkJavaOnPath()
    if (oneSevenOnPath) {
      resolve({ type: CHECKED_JAVA, haveJava: true, haveCorrectJava: true, download: false })
    } else {
      executeJavaVersion(resolve, reject)
    }
  }
})

export const askDownloadJDK = () => new Promise((resolve, reject) => {
  const { dialog, app } = remote
  dialog.showMessageBox(askDLConfig, dResponse => {
    if (dResponse === 1 || dResponse === 666) {
      app.exit(1)
    }
  })
})

export const downloadJDK = () => {

}

export const nextLoadingStep = () => ({
  type: NEXT_LOADING_STEP
})

export const prevLoadingStep = () => ({
  type: PREV_LOADING_STEP
})