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
      username: 'lorem',
      password: 'ipsum',
      jobConf:  'crawler-beans.cxml',
      web_ui: "https://lorem:ipsum@localhost:8443",
   },
   wayback: {
      uri_tomcat: "http://localhost:8080/",
      uri_wayback: "http://localhost:8080/wayback/"
   },
   commands: [
      {name: 'catalina', path: 'bundledApps/tomcat/bin/catalina'},
      {name: 'tomcatStart', path: 'bundledApps/tomcat/bin/startup'},
      {name: 'tomcatStop', path: 'bundledApps/tomcat/bin/shutdown'},
      {name: 'heritrixStart', path: 'bundledApps/heritrix-3.2.0/bin/heritrix'},
   ]
}

export function configSettings(base) {
 
      settings.set('base', base)
      managed.paths.forEach(p => {
         settings.set(p.name, path.join(base, p.path))
      })
      let exeType = '.sh'
      let command = `export JAVA_HOME=${settings.get('jdk')}; export JRE_HOME=${settings.get('jre')}; sh`
      if (os.platform() == 'win32') {
         exeType = '.bat'
         command =  `set JAVA_HOME=${settings.get('jdk')} & set JRE_HOME=${settings.get('jre')} &`
      }
      managed.commands.forEach(cmd => {
         settings.set(cmd.name, `${command} ${path.join(base,cmd.path)}${exeType}`)
      })


      console.log('We are not configed')
      console.log(base,settings)
   
}

export default settings