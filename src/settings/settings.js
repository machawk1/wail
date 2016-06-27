import ElectronSettings from "electron-settings"
import path from 'path'
import os from 'os'

const settings = new ElectronSettings()

const managed = {
   paths: [
      {name: 'archives', path: 'config/archives.json'},
      {name: 'cdxIndexer', path: 'bundledApps/tomcat/webapps/bin/cdx-indexer'},
      {name: 'cdx', path: 'archiveIndexes'},
      {name: 'cdxTemp', path: 'archiveIndexes/combined_unsorted.cdxt'},
      {name: 'crawlerBean', path: 'crawler-beans.cxml'},
      {name: 'heritrixBin', path: 'bundledApps/heritrix-3.2.0/bin/heritrix'},
      {name: 'heritrixJob', path: 'bundledApps/heritrix-3.2.0/jobs'},
      {name: 'heritrix', path: 'bundledApps/heritrix-3.2.0'},
      {name: 'indexCDX', path: 'archiveIndexes/index.cdx'},
      {name: 'index', path: '/config/path-index.txt'},
      {name: 'jdk', path: 'bundledApps/openjdk'},
      {name: 'jobConf', path: 'crawler-beans.cxml'},
      {name: 'jre', path: 'bundledApps/openjdk/jre'},
      {name: 'memgator', path: 'bundledApps/memgator'},
      {name: 'tomcat', path: 'bundledApps/tomcat'},
      {name: 'warcs', path: '/archives'},
      {name: 'wayBackConf', path: 'bundledApps/tomcat/webapps/ROOT/WEB-INF/wayback.xml'},
   ],
   heritrix: {
      uri_heritrix: "https://127.0.0.1:8443",
      uir_engine: "https://localhost:8443/engine/",
      port: "8843",
      username: 'lorem',
      password: 'ipsum',
      jobConf: 'crawler-beans.cxml',
      web_ui: "https://lorem:ipsum@localhost:8443",
      sendActionOptions: {
         method: 'POST',
         uri: "https://localhost:8443/engine/job/",
         headers: {
            Accept: "application/xml",
            'Content-type': 'application/x-www-form-urlencoded',
         },
         form: {
            action: ''
         },
         auth: {
            username: 'lorem',
            password: 'ipsum',
            sendImmediately: false
         },
         rejectUnauthorized: false,
         resolveWithFullResponse: true,
      },
      killOptions: {
         method: 'POST',
         uri: "https://localhost:8443/engine/",
         form: {
            action: "Exit Java Process",
            im_sure: "on"
         },
         auth: {
            'username': 'lorem',
            'password': 'ipsum',
            'sendImmediately': false
         },
         rejectUnauthorized: false,
         resolveWithFullResponse: true,
      },
      launchJobOptions: {
         method: 'POST',
         uri: "https://localhost:8443/engine/job/",
         headers: {
            Accept: "application/xml",
         },
         form: {
            action: "launch"
         },
         auth: {
            'username': 'lorem',
            'password': 'ipsum',
            'sendImmediately': false
         },
         rejectUnauthorized: false,
         resolveWithFullResponse: true,
      },
      optionEngine: {
         method: 'GET',
         uri: "https://localhost:8443/engine",
         auth: {
            username: 'lorem',
            password: 'ipsum',
            sendImmediately: false
         },
         rejectUnauthorized: false,
         resolveWithFullResponse: true,
      },
      buildOptions: {
         method: 'POST',
         uri: "https://localhost:8443/engine/job/",
         headers: {
            Accept: "application/xml",
            'Content-type': 'application/x-www-form-urlencoded',
         },
         form: {
            action: "build"
         },
         'auth': {
            'username': 'lorem',
            'password': 'ipsum',
            'sendImmediately': false
         },
         rejectUnauthorized: false,
         resolveWithFullResponse: true,
      },

   },
   wayback: {
      uri_tomcat: "http://localhost:8080/",
      uri_wayback: "http://localhost:8080/wayback/",
      allCDX: "/*.cdx",
      notIndexCDX: "/index.cdx"
   },
   commands: [
      {name: 'catalina', path: 'bundledApps/tomcat/bin/catalina'},
      {name: 'tomcatStart', path: 'bundledApps/tomcat/bin/startup'},
      {name: 'tomcatStop', path: 'bundledApps/tomcat/bin/shutdown'},
      {name: 'heritrixStart', path: 'bundledApps/heritrix-3.2.0/bin/heritrix'},
      {name: 'memgator'},
   ],
   code: {
      crawlerBean: 'crawler-beans.cxml',
      wayBackConf: 'bundledApps/tomcat/webapps/ROOT/WEB-INF/wayback.xml',
   }
}

export function configSettings(base) {
   console.log('We are not configed')
   settings.set('base', base)
   managed.paths.forEach(p => {
      settings.set(p.name, path.join(base, p.path))
   })

   let heritrix = managed.heritrix
   heritrix.jobConf = path.join(base, heritrix.jobConf)
   settings.set('heritrix', heritrix)
   let wb = managed.wayback
   wb.allCDX = `${settings.get('cdx')}${wb.allCDX}`
   wb.notIndexCDX = `!${settings.get('cdx')}${wb.notIndexCDX}`
   settings.set('wayback', wb)
   let code = managed.code
   code.crawlerBean = path.join(base, code.crawlerBean)
   code.wayBackConf = path.join(base, code.wayBackConf)

   let exeType = '.sh'
   let cmdexport = `export JAVA_HOME=${settings.get('jdk')}; export JRE_HOME=${settings.get('jre')};`
   let command = 'sh'
   let isWindows = os.platform() == 'win32'
   settings.set('isWindows', isWindows)

   managed.commands.forEach(cmd => {
      switch (cmd.name) {
         case 'memgator':
            settings.set('memgatorQuery', `${settings.get('memgator')} -a ${settings.get('archives')}`)
            break
         case 'tomcatStart':
            if (!isWindows) {
               settings.set(cmd.name, `${command} ${path.join(base, cmd.path)}${exeType}`)
            } else {
               settings.set(cmd.name, `${path.normalize(path.join(base, 'bundledApps/wayback.bat'))} start`)
            }
            break
         case 'tomcatStop':
            if (!isWindows) {
               settings.set(cmd.name, `${command} ${path.join(base, cmd.path)}${exeType}`)
            } else {
               settings.set(cmd.name, `${path.join(base, 'bundledApps/wayback.bat')} stop`)
            }
            break
         case 'heritrixStart':
            let heritrixLogin = `-a ${settings.get('username')}:${settings.get('heritrix.password')}`
            if (isWindows) {
               settings.set('heritrixStart', `${path.join(base, 'bundledApps/heritrix.bat')} ${heritrixLogin}`)
            } else {
               settings.set(cmd.name, `${cmdexport} ${command} ${path.join(base, cmd.path)}${exeType} ${heritrixLogin}`)
            }
            break
         default:
            settings.set(cmd.name, `${cmdexport} ${command} ${path.join(base, cmd.path)}${exeType}`)
            break
      }
   })

   console.log(base, settings)
}

export default settings
