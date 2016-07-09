import child_process from 'child_process'
import rp from 'request-promise'
import fs from 'fs-extra'
import os from 'os'
import http from 'http'
import path from 'path'
import wc from '../constants/wail-constants'
import ServiceDispatcher from '../dispatchers/service-dispatcher'
import cheerio from 'cheerio'
import { remote } from 'electron'
import util from 'util'

const httpAgent = new http.Agent()
const settings = remote.getGlobal('settings')
const logger = remote.getGlobal('logger')
const logString = "wayback-actions %s"
const logStringError = "wayback-actions error where[ %s ] stack [ %s ]"

const EventTypes = wc.EventTypes

export function writeWaybackConf () {
  let wayBackConflines = [
    'wayback.url.scheme.default=http',
    'wayback.url.host.default=localhost',
    'wayback.url.port.default=8080',
    "wayback.basedir=#{ systemEnvironment['WAYBACK_BASEDIR'] ?: '${wayback.basedir.default}' }",
    "wayback.url.scheme=#{ systemEnvironment['WAYBACK_URL_SCHEME'] ?: '${wayback.url.scheme.default}' }",
    "wayback.url.host=#{ systemEnvironment['WAYBACK_URL_HOST'] ?: '${wayback.url.host.default}' }",
    "wayback.url.port=#{ systemEnvironment['WAYBACK_URL_PORT'] ?: '${wayback.url.port.default}' }",
    "wayback.url.prefix.default=${wayback.url.scheme}://${wayback.url.host}:${wayback.url.port}",
    "wayback.url.prefix=#{ systemEnvironment['WAYBACK_URL_PREFIX'] ?: '${wayback.url.prefix.default}' }",
    'wayback.archivedir.1=${wayback.basedir}/files1/',
    'wayback.archivedir.2=${wayback.basedir}/files2/',
  ]
  let wbConfPath = settings.get('wayBackConf')
  let base = settings.get('base')
  fs.readFile(wbConfPath, 'utf8', (err, val)=> {
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
        logger.error(util.format(logStringError, "writting WBConf", err.stack))
      }
    })
  })

}

export function waybackAccesible () {
  console.log("checking wayback accessibility")
  let wburi = settings.get('wayback.uri_wayback')

  rp({ uri: wburi,agent: httpAgent })
    .then(success => {
      console.log("wayback success", success)
      ServiceDispatcher.dispatch({
        type: EventTypes.WAYBACK_STATUS_UPDATE,
        status: true,
      })

    })
    .catch(err => {
      console.log("wayback err", err)
      logger.error(util.format(logStringError, "waybackAccessible", err.stack))
      ServiceDispatcher.dispatch({
        type: EventTypes.WAYBACK_STATUS_UPDATE,
        status: false,
      })
      startWayback()
    })
}

export function startWayback () {
  if (process.platform === 'win32') {
    let basePath = settings.get('bundledApps')
    let opts = {
      cwd: basePath,
      detached: true,
      shell: false,
      stdio: [ 'ignore', 'ignore', 'ignore' ]
    }
    try {
      let wayback = child_process.spawn("wayback.bat", [ "start" ], opts)
      wayback.unref()
    } catch (err) {
      logger.error(util.format(logStringError, "win32 launch wayback", err.stack))
    }

  } else {
    child_process.exec(settings.get('tomcatStart'), (err, stdout, stderr) => {
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
      let wayback = child_process.spawn("wayback.bat", [ "stop" ], opts)
      wayback.unref()
    } catch (err) {
      logger.error(util.format(logStringError, "win32 kill wayback", err.stack))
    }
    if(cb) {
      cb()
    }
  } else {
    child_process.exec(settings.get('tomcatStop'), (err, stdout, stderr) => {
      console.log(err, stdout, stderr)
      if(err){
        let stack
        if (Reflect.has(err, 'stack')) {
          stack = `${stdout} ${err.stack}`
        } else {
          stack = `${stdout}`
        }
        logger.error(util.format(logStringError, `linux/osx kill heritrix ${stderr}`, stack))
      }
     
      if(cb) {
        cb()
      }
    })
  }
}

