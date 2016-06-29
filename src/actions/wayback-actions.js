import child_process from "child_process"
import rp from "request-promise"
import fs from "fs-extra"
import os from "os"
import wc from "../constants/wail-constants"
import ServiceDispatcher from "../dispatchers/service-dispatcher"
import cheerio from 'cheerio'
import settings from '../settings/settings'

const EventTypes = wc.EventTypes


export function writeWaybackConf() {
   let wayBackConflines = [
      `${os.EOL}wayback.url.scheme.default=http`,
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
      }
      /*
       'wail.basedir=/Applications/WAIL.app',
       'wayback.basedir.default=/Applications/WAIL.app/bundledApps/tomcat/webapps/ROOT',
       */
      let $ = cheerio.load(val, {xmlMode: true})
      let config = $('bean[class="org.springframework.beans.factory.config.PropertyPlaceholderConfigurer"]').find('value')
      wayBackConflines.push(`wail.basedir=${base}`)
      wayBackConflines.push(`wayback.basedir.default=${base}/bundledApps/tomcat/webapps/ROOT${os.EOL}`)
      config.text(wayBackConflines.join(os.EOL))
      fs.writeFile(wbConfPath, $.xml(), err => {
         console.log(err)
      })
   })

}

export function waybackAccesible() {
   console.log("checking wayback accessibility")
   let wburi = settings.get('wayback.uri_wayback')

   rp({uri: wburi})
      .then(success => {
         console.log("wayback success", success)
         ServiceDispatcher.dispatch({
            type: EventTypes.WAYBACK_STATUS_UPDATE,
            status: true,
         })

      })
      .catch(err => {
         console.log("wayback err", err)
         ServiceDispatcher.dispatch({
            type: EventTypes.WAYBACK_STATUS_UPDATE,
            status: false,
         })
         startWayback()
      }).finally(() => console.log("wayback finally"))
}


export function startWayback() {
   if(process.platform === 'win32'){
      let basePath = settings.get('bundledApps')
      let opts = {
         cwd:  basePath,
         detached: true,
         shell: false,
         stdio: ['ignore', 'ignore', 'ignore']
      }
      let wayback = child_process.spawn("wayback.bat", ["start"], opts)
      wayback.unref()
   } else {
      child_process.exec(settings.get('tomcatStart'), (err, stdout, stderr) => {
         console.log(err, stdout, stderr)
      })
   }

}

export function killWayback() {
   if(process.platform === 'win32'){
      let basePath = settings.get('bundledApps')
      let opts = {
         cwd:  basePath,
         detached: true,
         shell: false,
         stdio: ['ignore', 'ignore', 'ignore']
      }
      let wayback = child_process.spawn("wayback.bat", ["stop"], opts)
      wayback.unref()
   } else {
      child_process.exec(settings.get('tomcatStop'), (err, stdout, stderr) => {
         console.log(err, stdout, stderr)
      })
   }

}

