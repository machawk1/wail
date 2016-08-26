import { remote } from 'electron'
import Promise from 'bluebird'
import childProcess from 'child_process'
import util from 'util'
import S from 'string'

const settings = remote.getGlobal('settings')

export function startHeritrix (logger) {
  return new Promise((resolve, reject) => {
    if (process.platform === 'win32') {
      let heritrixPath = settings.get('heritrix.path')
      logger.info(util.format('Loading Actions %s', 'win32 launching heritrix'))
      let opts = {
        cwd: heritrixPath,
        env: {
          JAVA_HOME: settings.get('jdk'),
          JRE_HOME: settings.get('jre'),
          HERITRIX_HOME: heritrixPath,
        },
        detached: true,
        shell: false,
        stdio: [ 'ignore', 'ignore', 'ignore' ]
      }
      let usrpwrd = `${settings.get('heritrix.username')}:${settings.get('heritrix.password')}`
      try {
        let heritrix = childProcess.spawn('bin\\heritrix.cmd', [ '-a', `${usrpwrd}` ], opts)
        heritrix.unref()
      } catch (err) {
        logger.error(util.format('Loading Actions %s, %s', 'win32 launch', err))
        return reject(err)
      }
      return resolve()
    } else {
      logger.info(util.format('Loading Actions %s', 'linux/osx launching heritrix'))
      var hStart
      if (process.platform === 'darwin') {
        hStart = settings.get('heritrixStartDarwin')
      } else {
        hStart = settings.get('heritrixStart')
      }
      childProcess.exec(hStart, (err, stdout, stderr) => {
        // console.log(hStart)
        // console.log(err, stdout, stderr)
        if (err) {
          logger.error(util.format('Loading Actions %s, %s', `linux/osx launch heritrix ${stderr}`, err))
          return reject(err)
        }
        return resolve()
      })
    }
  })
}

export function startWayback (logger) {
  return new Promise((resolve, reject) => {
    let exec =settings.get('pywb.wayback')
    let opts = {
      cwd: settings.get('pywb.home'),
      detached: true,
      shell: false,
      stdio: [ 'ignore', 'ignore', 'ignore' ]
    }
    console.log(opts)
    logger.info(util.format('Loading Actions %s', 'launching wayback'))
    try {
      let wayback = childProcess.spawn(exec,['-d', settings.get('warcs')], opts)
      wayback.unref()
    } catch (err) {
      logger.error(util.format('Loading Actions %s', 'launch wayback', err))
      return reject(err)
    }
    return resolve()
    // if (process.platform === 'win32') {
    //   let basePath = settings.get('bundledApps')
    //   let opts = {
    //     cwd: basePath,
    //     detached: true,
    //     shell: false,
    //     stdio: [ 'ignore', 'ignore', 'ignore' ]
    //   }
    //   logger.info(util.format('Loading Actions %s', 'win32 launching wayback'))
    //   try {
    //     let wayback = childProcess.spawn('wayback.bat', [ 'start' ], opts)
    //     wayback.unref()
    //   } catch (err) {
    //     logger.error(util.format('Loading Actions %s', 'win32 launch wayback', err))
    //     return reject(err)
    //   }
    //   return resolve()
    // } else {
    //   logger.info(util.format('Loading Actions %s', 'linux/osx launching wayback'))
    //   var wStart
    //   if (process.platform === 'darwin') {
    //     wStart = settings.get('tomcatStartDarwin')
    //   } else {
    //     wStart = settings.get('tomcatStart')
    //   }
    //   childProcess.exec(wStart, (err, stdout, stderr) => {
    //     // console.log(err, stdout, stderr)
    //     if (err) {
    //       logger.error(util.format('Loading Actions %s', `linux/osx launch wayback ${stderr}`, err))
    //       return reject(err)
    //     }
    //     return resolve()
    //   })
    // }
  })
}
