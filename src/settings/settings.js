import ElectronSettings from 'electron-settings'
import path from 'path'
import fs from 'fs-extra'
import os from 'os'

const managed = {
  paths: [
    { name: 'bundledApps', path: 'bundledApps' },
    { name: 'logs', path: 'waillogs/wail.log' },
    { name: 'archives', path: 'config/archives.json' },
    { name: 'cdxIndexer', path: 'bundledApps/tomcat/webapps/bin/cdx-indexer' },
    { name: 'cdx', path: 'archiveIndexes' },
    { name: 'cdxTemp', path: "archiveIndexes/combined_unsorted.cdxt" },
    { name: 'crawlerBean', path: 'crawler-beans.cxml' },
    { name: 'heritrixBin', path: 'bundledApps/heritrix-3.3.0/bin/heritrix' },
    { name: 'heritrixJob', path: 'bundledApps/heritrix-3.3.0/jobs' },
    { name: 'heritrix', path: 'bundledApps/heritrix-3.3.0' },
    { name: 'indexCDX', path: 'archiveIndexes/index.cdx' },
    { name: 'index', path: '/config/path-index.txt' },
    { name: 'jdk', path: 'bundledApps/openjdk' },
    { name: 'jobConf', path: 'crawler-beans.cxml' },
    { name: 'jre', path: 'bundledApps/openjdk/jre' },
    { name: 'memgator', path: 'bundledApps/memgator' },
    { name: 'tomcat', path: 'bundledApps/tomcat' },
    { name: 'warcs', path: '/archives' },
    { name: 'wayBackConf', path: 'bundledApps/tomcat/webapps/ROOT/WEB-INF/wayback.xml' },
  ],
  heritrix: {
    uri_heritrix: 'https://127.0.0.1:8443',
    uir_engine: 'https://localhost:8443/engine/',
    port: '8843',
    username: 'lorem',
    password: 'ipsum',
    login: "-a lorem:ipsum",
    path: "",
    jobConf: 'crawler-beans.cxml',
    web_ui: "https://lorem:ipsum@localhost:8443",
    sendActionOptions: {
      method: 'POST',
      uri: 'https://localhost:8443/engine/job/',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 15000,
      form: {
        action: ""
      },
      auth: {
        username: 'lorem',
        password: 'ipsum',
        sendImmediately: false
      },
      strictSSL: false,
      rejectUnauthorized: false,
      resolveWithFullResponse: true,
    },
    killOptions: {
      method: 'POST',
      uri: 'https://localhost:8443/engine/',
      timeout: 15000,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      form: {
        action: 'exit+java+process',
        'im_sure': 'on'
      },
      auth: {
        username: 'lorem',
        password: 'ipsum',
        sendImmediately: false
      },
      strictSSL: false,
      rejectUnauthorized: false,
      resolveWithFullResponse: true,
    },
    launchJobOptions: {
      method: 'POST',
      uri: 'https://localhost:8443/engine/job/',
      timeout: 15000,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      form: {
        action: 'launch'
      },
      auth: {
        username: 'lorem',
        password: 'ipsum',
        sendImmediately: false
      },
      strictSSL: false,
      rejectUnauthorized: false,
      resolveWithFullResponse: true,
    },
    optionEngine: {
      method: 'GET',
      uri: 'https://localhost:8443/engine',
      timeout: 15000,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      auth: {
        username: 'lorem',
        password: 'ipsum',
        sendImmediately: false
      },
      strictSSL: false,
      rejectUnauthorized: false,
      resolveWithFullResponse: true,
    },
    buildOptions: {
      method: 'POST',
      uri: 'https://localhost:8443/engine/job/',
      timeout: 15000,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      form: {
        action: 'build'
      },
      auth: {
        username: 'lorem',
        password: 'ipsum',
        sendImmediately: false
      },
      strictSSL: false,
      rejectUnauthorized: false,
      resolveWithFullResponse: true,
    },

  },
  wayback: {
    uri_tomcat: 'http://localhost:8080/',
    uri_wayback: 'http://localhost:8080/wayback/',
    allCDX: `${path.sep}*.cdx`,
    notIndexCDX: `${path.sep}index.cdx`
  },
  commands: [
    { name: 'catalina', path: 'bundledApps/tomcat/bin/catalina.sh' },
    { name: 'tomcatStart', path: 'bundledApps/tomcat/bin/startup.sh' },
    { name: 'tomcatStop', path: 'bundledApps/tomcat/bin/shutdown.sh' },
    { name: 'heritrixStart', path: 'bundledApps/heritrix-3.3.0/bin/heritrix' },
    { name: 'memgator' },
  ],
  code: {
    crawlerBean: 'crawler-beans.cxml',
    wayBackConf: 'bundledApps/tomcat/webapps/ROOT/WEB-INF/wayback.xml',
  }
}

function writeSettings (base, settings) {
  settings.set('configured', true)
  settings.set('base', base)
  managed.paths.forEach(p => {
    settings.set(p.name, path.normalize(path.join(base, p.path)))
  })

  let heritrix = managed.heritrix
  heritrix.path = settings.get('heritrix')
  heritrix.jobConf = path.normalize(path.join(base, heritrix.jobConf))
  settings.set('heritrix', heritrix)
  let wb = managed.wayback
  wb.allCDX = `${settings.get('cdx')}${wb.allCDX}`
  wb.notIndexCDX = `!${settings.get('cdx')}${wb.notIndexCDX}`
  settings.set('wayback', wb)
  let code = managed.code
  code.crawlerBean = path.normalize(path.join(base, code.crawlerBean))
  code.wayBackConf = path.normalize(path.join(base, code.wayBackConf))

  let cmdexport = `export JAVA_HOME=${settings.get('jdk')}; export JRE_HOME=${settings.get('jre')};`
  let command = 'sh'
  let isWindows = os.platform() == 'win32'
  settings.set('isWindows', isWindows)

  managed.commands.forEach(cmd => {
    switch (cmd.name) {
      case 'memgator':
        settings.set('memgatorQuery', `${settings.get('memgator')} -a ${settings.get('archives')}`)
        break
      case 'catalina':
        if (!isWindows) {
          settings.set(cmd.name, `${cmdexport} ${command} ${path.normalize(path.join(base, cmd.path))}`)
        } else {
          settings.set(cmd.name, `${path.normalize(path.join(base, 'bundledApps/wayback.bat'))} start`)
        }
        break
      case 'tomcatStart':
        if (!isWindows) {
          settings.set(cmd.name, `${cmdexport} ${command} ${path.normalize(path.join(base, cmd.path))}`)
        } else {
          settings.set(cmd.name, `${path.normalize(path.join(base, 'bundledApps/wayback.bat'))} start`)
        }
        break
      case 'tomcatStop':
        if (!isWindows) {
          settings.set(cmd.name, `${command} ${path.normalize(path.join(base, cmd.path))}`)
        } else {
          settings.set(cmd.name, `${path.normalize(path.join(base, 'bundledApps/wayback.bat'))} stop`)
        }
        break
      case 'heritrixStart':
        if (isWindows) {
          settings.set(cmd.name, `${path.normalize(path.join(base, 'bundledApps/heritrix.bat'))} ${settings.get('heritrix.login')}`)
        } else {
          settings.set(cmd.name, `${cmdexport}  ${path.normalize(path.join(base, cmd.path))} ${settings.get('heritrix.login')}`)
        }
        break
      default:
        settings.set(cmd.name, `${cmdexport} ${command} ${path.normalize(path.join(base, cmd.path))}`)
        break
    }
  })
}

export default function configSettings (base, userData) {
  let settings
  let settingsDir = path.join(userData, 'wail-settings')
  try {
    settings = new ElectronSettings({ configDirPath: settingsDir })
  } catch (e) {
    // if something went terrible wrong during a config the json becomes malformed
    // electron settings throws an error in this case
    fs.removeSync(settingsDir)
    settings = new ElectronSettings({ configDirPath: settingsDir })
  }

  writeSettings(base, settings)

  // if (!settings.get('configured')) {
  //   console.log("We are not configured")
  //   writeSettings(base, settings)
  //   console.log(base, settings)
  // } else {
  //   if (settings.get('base') !== base) {
  //     /*
  //      If the user moves the application directory the settings will
  //      will not be correct since I use absolute paths.
  //      I did this to myself....
  //      */
  //     console.log("We are not configured due to binary directory being moved")
  //     writeSettings(base, settings)
  //   }
  //   console.log("We are configured")
  // }

  return settings
}

