import childProcess from 'child_process'
import fs from 'fs-extra'
import os from 'os'
import path from 'path'
import wc from '../constants/wail-constants'
import ServiceDispatcher from '../dispatchers/service-dispatcher'
import RequestDispatcher from '../dispatchers/requestDispatcher'
import cheerio from 'cheerio'
import {remote} from 'electron'
import util from 'util'

const settings = remote.getGlobal('settings')
const logger = remote.getGlobal('logger')
// const logString = 'wayback-actions %s'
const logStringError = 'wayback-actions error where[ %s ] stack [ %s ]'

const EventTypes = wc.EventTypes
const RequestTypes = wc.RequestTypes

export function writeWaybackConf () {
  let wayBackConflines = [
    'wayback.url.scheme.default=http',
    'wayback.url.host.default=localhost',
    'wayback.url.port.default=8080',
    "wayback.basedir=#{ systemEnvironment['WAYBACK_BASEDIR'] ?: '${wayback.basedir.default}' }",
    "wayback.url.scheme=#{ systemEnvironment['WAYBACK_URL_SCHEME'] ?: '${wayback.url.scheme.default}' }",
    "wayback.url.host=#{ systemEnvironment['WAYBACK_URL_HOST'] ?: '${wayback.url.host.default}' }",
    "wayback.url.port=#{ systemEnvironment['WAYBACK_URL_PORT'] ?: '${wayback.url.port.default}' }",
    'wayback.url.prefix.default=${wayback.url.scheme}://${wayback.url.host}:${wayback.url.port}',
    "wayback.url.prefix=#{ systemEnvironment['WAYBACK_URL_PREFIX'] ?: '${wayback.url.prefix.default}' }",
    'wayback.archivedir.1=${wayback.basedir}/files1/',
    'wayback.archivedir.2=${wayback.basedir}/files2/',
  ]
  let wbConfPath = settings.get('wayBackConf')
  let base = settings.get('base')
  fs.readFile(wbConfPath, 'utf8', (err, val) => {
    if (err) {
      console.error(err)
      logger.error(util.format(logStringError, `reading WBConf ${err.message}`, err.stack))
    }
    /*
     'wail.basedir=/Applications/WAIL.app',
     'wayback.basedir.default=/Applications/WAIL.app/bundledApps/tomcat/webapps/ROOT',
     */
    let $ = cheerio.load(val, { xmlMode: true })

    let config = $('bean[class="org.springframework.beans.factory.config.PropertyPlaceholderConfigurer"]').find('value')
    wayBackConflines.unshift(`wail.basedir=${base}`)
    wayBackConflines.unshift(`wayback.basedir.default=${path.normalize(path.join(base, 'bundledApps/tomcat/webapps/ROOT'))}`)
    config.text(`${os.EOL}${wayBackConflines.join(os.EOL)}${os.EOL}`)
    fs.writeFile(wbConfPath, $.xml(), err => {
      if (err) {
        console.error(err)
        logger.error(util.format(logStringError, 'writting WBConf', err.stack))
      }
    })
  })
}

export function waybackAccesible (startOnDown = false) {
  console.log('checking wayback accessibility')
  // let wburi = settings.get('wayback.uri_wayback')
  RequestDispatcher.dispatch({
    type: EventTypes.REQUEST_WAYBACK,
    rType: RequestTypes.ACCESSIBILITY,
    opts: {
      uri: settings.get('wayback.uri_wayback')
    },
    from: 'waybackAccesible',
    timeReceived: null,
    startOnDown,
    success: (response) => {
      console.log('wayback is accessible')
      ServiceDispatcher.dispatch({
        type: EventTypes.WAYBACK_STATUS_UPDATE,
        status: true,
      })
    },
    error: (err) => {
      console.log('wayback err', err)
      logger.error(util.format(logStringError, 'waybackAccessible', err.stack))
      ServiceDispatcher.dispatch({
        type: EventTypes.WAYBACK_STATUS_UPDATE,
        status: false,
      })
      if (startOnDown) {
        startWayback()
      }
    }
  })
}

export function startWayback (cb) {
  if (process.platform === 'win32') {
    let basePath = settings.get('bundledApps')
    let opts = {
      cwd: basePath,
      detached: true,
      shell: false,
      stdio: [ 'ignore', 'ignore', 'ignore' ]
    }
    try {
      let wayback = childProcess.spawn('wayback.bat', [ 'start' ], opts)
      wayback.unref()
    } catch (err) {
      logger.error(util.format(logStringError, 'win32 launch wayback', err.stack))
    }

    if (cb) {
      cb()
    }
  } else {
    var wStart
    if(process.platform === 'darwin') {
      wStart = settings.get('tomcatStartDarwin')
    } else {
      wStart = settings.get('tomcatStart')
    }
    childProcess.exec(wStart, (err, stdout, stderr) => {
      console.log(err, stdout, stderr)
      if (err) {
        let stack
        if (Reflect.has(err, 'stack')) {
          stack = `${stderr} ${err.stack}`
        } else {
          stack = `${stderr}`
        }
        logger.error(util.format(logStringError, `linux/osx launch wayback ${stdout}`, stack))
      }
      if (cb) {
        cb()
      }
    })
  }
}

export function killWayback (cb) {
  if (process.platform === 'win32') {
    let basePath = settings.get('bundledApps')
    let opts = {
      cwd: basePath,
      detached: true,
      shell: false,
      stdio: [ 'ignore', 'ignore', 'ignore' ]
    }
    try {
      let wayback = childProcess.spawn('wayback.bat', [ 'stop' ], opts)
      wayback.unref()
    } catch (err) {
      logger.error(util.format(logStringError, 'win32 kill wayback', err.stack))
    }
    if (cb) {
      cb()
    }
  } else {
    var wStop
    if(process.platform === 'darwin') {
      wStop = settings.get('tomcatStopDarwin')
    } else {
      wStop = settings.get('tomcatStop')
    }
    childProcess.exec(wStop, (err, stdout, stderr) => {
      console.log(stdout)
      if (err) {
        let stack
        console.log(err, stderr)
        if (Reflect.has(err, 'stack')) {
          stack = `${stdout} ${err.stack}`
        } else {
          stack = `${stdout}`
        }
        logger.error(util.format(logStringError, `linux/osx kill heritrix ${stderr}`, stack))
      }

      if (cb) {
        cb()
      }
    })
  }
}
