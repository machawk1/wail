import ElectronSettings from 'electron-settings'
import path from 'path'
import fs from 'fs-extra'
import S from 'string'
import _ from 'lodash'
import os from 'os'
import autobind  from 'autobind-decorator'
import Promise from 'bluebird'
import fileExists from 'file-exists'

S.TMPL_OPEN = '{'
S.TMPL_CLOSE = '}'

export const templates = {
  heritrix: {
    defaultHost: 'localhost',
    defaultPort: '8443',
    uri_heritrix: 'https://{host}:{port}',
    uri_engine: 'https://{host}:{port}/engine/',
    login: '-a {usr}:{pass}',
    web_ui: 'https://{usr}:{pass}@localhost:{port}',
    jobUrl: 'https://{host}:{port}/engine/job/{job}',
    engineUrl: 'https://{host}:{port}/engine',
    start: '{export} {bpath} {login}',
    startW: '{bpath} {login}'
  },
  jExport: 'export JAVA_HOME={jdk}; export JRE_HOME={jre};',
  memQuery: '{memgator} -a {archives}',
  allCdx: '{cdx}{all}',
  notIndexCDX: '!{cdx}{notIndex}'
}


var mngd
var dbgOSX


if (process.env.NODE_ENV === 'development') {
  console.log('dev settings')
  // set to try only if your on an osx machine with java installed or one that can play nice with X11 free types
  dbgOSX = true
  mngd  = {
    paths: [
      { name: 'bundledApps', path: 'bundledApps' },
      { name: 'logs', path: 'waillogs/wail.log' },
      { name: 'archives', path: 'config/archives.json' },
      { name: 'cdx', path: 'archiveIndexes' },
      { name: 'cdxTemp', path: 'archiveIndexes/combined_unsorted.cdxt' },
      { name: 'crawlerBean', path: 'crawler-beans.cxml' },
      { name: 'heritrixBin', path: 'bundledApps/heritrix/bin/heritrix' },
      { name: 'heritrixJob', path: 'bundledApps/heritrix/jobs' },
      { name: 'heritrix', path: 'bundledApps/heritrix' },
      { name: 'indexCDX', path: 'archiveIndexes/index.cdx' },
      { name: 'index', path: '/config/path-index.txt' },
      { name: 'jdk', path: 'bundledApps/openjdk' },
      { name: 'jobConf', path: 'crawler-beans.cxml' },
      { name: 'jre', path: 'bundledApps/openjdk' },
      { name: 'memgator', path: 'bundledApps/memgator' },
      { name: 'tomcat', path: 'bundledApps/tomcat' },
      { name: 'warcs', path: '/archives2' }
    ],
    heritrix: {
      uri_heritrix: 'https://127.0.0.1:8443',
      uri_engine: 'https://localhost:8443/engine/',
      port: '8843',
      username: 'lorem',
      password: 'ipsum',
      login: '-a lorem:ipsum',
      path: '',
      jobConf: 'crawler-beans.cxml',
      jobConfWin: 'crawler-beans-win.cxml',
      web_ui: 'https://lorem:ipsum@localhost:8443',
      addJobDirectoryOptions: {
        method: 'POST',
        url: 'https://localhost:8443/engine',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        timeout: 15000,
        form: {
          action: 'add',
          addPath: ''
        },
        auth: {
          username: 'lorem',
          password: 'ipsum',
          sendImmediately: false
        },
        strictSSL: false,
        rejectUnauthorized: false,
        resolveWithFullResponse: true
      },
      sendActionOptions: {
        method: 'POST',
        url: 'https://localhost:8443/engine/job/',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        timeout: 15000,
        form: {
          action: ''
        },
        auth: {
          username: 'lorem',
          password: 'ipsum',
          sendImmediately: false
        },
        strictSSL: false,
        rejectUnauthorized: false,
        resolveWithFullResponse: true
      },
      killOptions: {
        method: 'POST',
        url: 'https://localhost:8443/engine',
        timeout: 15000,
        body: 'im_sure=on&action=exit java process',
        headers: {
          'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:47.0) Gecko/20100101 Firefox/47.0',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Connection': 'keep-alive'
        },
        auth: {
          username: 'lorem',
          password: 'ipsum',
          sendImmediately: false
        },
        strictSSL: false,
        rejectUnauthorized: false,
        resolveWithFullResponse: true
      },
      launchJobOptions: {
        method: 'POST',
        url: 'https://localhost:8443/engine/job/',
        timeout: 15000,
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
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
        resolveWithFullResponse: true
      },
      optionEngine: {
        method: 'GET',
        url: 'https://localhost:8443/engine',
        timeout: 15000,
        auth: {
          username: 'lorem',
          password: 'ipsum',
          sendImmediately: false
        },
        strictSSL: false,
        rejectUnauthorized: false,
        resolveWithFullResponse: true
      },
      buildOptions: {
        method: 'POST',
        url: 'https://localhost:8443/engine/job/',
        timeout: 15000,
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
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
        resolveWithFullResponse: true
      },
      reScanJobs: {
        method: 'POST',
        url: 'https://localhost:8443/engine',
        timeout: 5000,
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        form: {
          action: 'rescan'
        },
        auth: {
          username: 'lorem',
          password: 'ipsum',
          sendImmediately: false
        },
        strictSSL: false,
        rejectUnauthorized: false,
        resolveWithFullResponse: true
      }

    },
    wayback: {
      port: '8080',
      uri_tomcat: 'http://localhost:8080/',
      uri_wayback: 'http://localhost:8080/wayback/',
      allCDX: `${path.sep}*.cdx`,
      notIndexCDX: `${path.sep}index.cdx`
    },
    commands: [
      { name: 'catalina', path: 'bundledApps/tomcat/bin/catalina.sh' },
      { name: 'tomcatStart', path: 'bundledApps/tomcat/bin/startup.sh' },
      { name: 'tomcatStop', path: 'bundledApps/tomcat/bin/shutdown.sh' },
      { name: 'heritrixStart', path: 'bundledApps/heritrix/bin/heritrix' },
      { name: 'memgator' }
    ],
    pywb: {
      home: 'bundledApps/pywb',
      port: '8080',
      url: 'http://localhost:{port}/',
      wbMan: 'bundledApps/pywb/wb-manager',
      newCollection: 'bundledApps/pywb/wb-manager init {col}',
      addWarcsToCol: 'bundledApps/pywb/wb-manager add {col} {warcs}',
      addMetadata: 'bundledApps/pywb/wb-manager metadata {col} --set {metadata}',
      reindexCol: 'bundledApps/pywb/wb-manager reindex {col}',
      convertCdx: 'bundledApps/pywb/wb-manager convert-cdx {cdx}',
      autoIndexCol: 'bundledApps/pywb/wb-manager autoindex {col}',
      autoIndexDir: 'bundledApps/pywb/wb-manager autoindex {dir}',
      sortedCombinedCdxj: 'bundledApps/pywb/cdx-indexer --sort -j combined.cdxj {warcs}',
      sortedCombinedCdx: 'bundledApps/pywb/cdx-indexer --sort combined.cdx {warcs}',
      cdxjPerColWarc: 'bundledApps/pywb/cdx-indexer --sort -j {cdx} {warc}',
      cdxPerColWarc: 'bundledApps/pywb/cdx-indexer --sort {cdx} {warc}',
      wayback: 'bundledApps/pywb/wayback',
      waybackPort: 'bundledApps/pywb/wayback -p {port}',
      waybackReplayDir: 'bundledApps/pywb/wayback -d {dir}',
      waybackReplayDirPort: 'bundledApps/pywb/wayback -p {port} -d {dir}',
      templates: 'bundledApps/pywb/templates',
      statics: 'bundledApps/pywb/static',
      checkIfInCol: 'http://localhost:{port}/${col}-cdx?url=${url}&output=json'
    },
    collections: {
      defaultCol: 'archives2/collections/Wail',
      dir: 'archives2/collections',
      aCollPath: 'archives2/collections/{col}',
      colTemplate: 'archives2/collections/{col}/static',
      colStatic: 'archives2/collections/{col}/templates',
      colWarcs: 'archives2/collections/{col}/archive',
      colIndexs: 'archives2/collections/{col}/indexes',
      templateDir: 'archives2/templates',
      staticsDir: 'archives2/static'
    },
    code: {
      crawlerBean: 'crawler-beans.cxml',
      wayBackConf: 'bundledApps/tomcat/webapps/ROOT/WEB-INF/wayback.xml'
    },
    wailCore: {
      dport: '3030',
      port: '3030',
      dhost: 'localhost',
      host: 'localhost',
      url: 'http://{host}:{port}',
      db: 'dev_coreData/database',
      timemaps: 'dev_coreData/timemaps'
    }

  }

} else {
  dbgOSX = false
  mngd  = {
    paths: [
      { name: 'bundledApps', path: 'bundledApps' },
      { name: 'logs', path: 'waillogs/wail.log' },
      { name: 'archives', path: 'config/archives.json' },
      { name: 'cdx', path: 'archiveIndexes' },
      { name: 'cdxTemp', path: 'archiveIndexes/combined_unsorted.cdxt' },
      { name: 'crawlerBean', path: 'crawler-beans.cxml' },
      { name: 'heritrixBin', path: 'bundledApps/heritrix/bin/heritrix' },
      { name: 'heritrixJob', path: 'bundledApps/heritrix/jobs' },
      { name: 'heritrix', path: 'bundledApps/heritrix' },
      { name: 'indexCDX', path: 'archiveIndexes/index.cdx' },
      { name: 'index', path: '/config/path-index.txt' },
      { name: 'jdk', path: 'bundledApps/openjdk' },
      { name: 'jobConf', path: 'crawler-beans.cxml' },
      { name: 'jre', path: 'bundledApps/openjdk' },
      { name: 'memgator', path: 'bundledApps/memgator' },
      { name: 'tomcat', path: 'bundledApps/tomcat' },
      { name: 'warcs', path: '/archives' }
    ],
    heritrix: {
      uri_heritrix: 'https://127.0.0.1:8443',
      uri_engine: 'https://localhost:8443/engine/',
      port: '8843',
      username: 'lorem',
      password: 'ipsum',
      login: '-a lorem:ipsum',
      path: '',
      jobConf: 'crawler-beans.cxml',
      jobConfWin: 'crawler-beans-win.cxml',
      web_ui: 'https://lorem:ipsum@localhost:8443',
      addJobDirectoryOptions: {
        method: 'POST',
        url: 'https://localhost:8443/engine',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        timeout: 15000,
        form: {
          action: 'add',
          addPath: ''
        },
        auth: {
          username: 'lorem',
          password: 'ipsum',
          sendImmediately: false
        },
        strictSSL: false,
        rejectUnauthorized: false,
        resolveWithFullResponse: true
      },
      sendActionOptions: {
        method: 'POST',
        url: 'https://localhost:8443/engine/job/',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        timeout: 15000,
        form: {
          action: ''
        },
        auth: {
          username: 'lorem',
          password: 'ipsum',
          sendImmediately: false
        },
        strictSSL: false,
        rejectUnauthorized: false,
        resolveWithFullResponse: true
      },
      killOptions: {
        method: 'POST',
        url: 'https://localhost:8443/engine',
        timeout: 15000,
        body: 'im_sure=on&action=exit java process',
        headers: {
          'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:47.0) Gecko/20100101 Firefox/47.0',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Connection': 'keep-alive'
        },
        auth: {
          username: 'lorem',
          password: 'ipsum',
          sendImmediately: false
        },
        strictSSL: false,
        rejectUnauthorized: false,
        resolveWithFullResponse: true
      },
      launchJobOptions: {
        method: 'POST',
        url: 'https://localhost:8443/engine/job/',
        timeout: 15000,
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
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
        resolveWithFullResponse: true
      },
      optionEngine: {
        method: 'GET',
        url: 'https://localhost:8443/engine',
        timeout: 15000,
        auth: {
          username: 'lorem',
          password: 'ipsum',
          sendImmediately: false
        },
        strictSSL: false,
        rejectUnauthorized: false,
        resolveWithFullResponse: true
      },
      buildOptions: {
        method: 'POST',
        url: 'https://localhost:8443/engine/job/',
        timeout: 15000,
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
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
        resolveWithFullResponse: true
      },
      reScanJobs: {
        method: 'POST',
        url: 'https://localhost:8443/engine',
        timeout: 5000,
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        form: {
          action: 'rescan'
        },
        auth: {
          username: 'lorem',
          password: 'ipsum',
          sendImmediately: false
        },
        strictSSL: false,
        rejectUnauthorized: false,
        resolveWithFullResponse: true
      }

    },
    wayback: {
      port: '8080',
      uri_tomcat: 'http://localhost:8080/',
      uri_wayback: 'http://localhost:8080/wayback/',
      allCDX: `${path.sep}*.cdx`,
      notIndexCDX: `${path.sep}index.cdx`
    },
    commands: [
      { name: 'catalina', path: 'bundledApps/tomcat/bin/catalina.sh' },
      { name: 'tomcatStart', path: 'bundledApps/tomcat/bin/startup.sh' },
      { name: 'tomcatStop', path: 'bundledApps/tomcat/bin/shutdown.sh' },
      { name: 'heritrixStart', path: 'bundledApps/heritrix/bin/heritrix' },
      { name: 'memgator' }
    ],
    pywb: {
      home: 'bundledApps/pywb',
      port: '8080',
      url: 'http://localhost:{port}/',
      wbMan: 'bundledApps/pywb/wb-manager',
      newCollection: 'bundledApps/pywb/wb-manager init {col}',
      addWarcsToCol: 'bundledApps/pywb/wb-manager add {col} {warcs}',
      addMetadata: 'bundledApps/pywb/wb-manager metadata {col} --set {metadata}',
      reindexCol: 'bundledApps/pywb/wb-manager reindex {col}',
      convertCdx: 'bundledApps/pywb/wb-manager convert-cdx {cdx}',
      autoIndexCol: 'bundledApps/pywb/wb-manager autoindex {col}',
      autoIndexDir: 'bundledApps/pywb/wb-manager autoindex {dir}',
      sortedCombinedCdxj: 'bundledApps/pywb/cdx-indexer --sort -j combined.cdxj {warcs}',
      sortedCombinedCdx: 'bundledApps/pywb/cdx-indexer --sort combined.cdx {warcs}',
      cdxjPerColWarc: 'bundledApps/pywb/cdx-indexer --sort -j {cdx} {warc}',
      cdxPerColWarc: 'bundledApps/pywb/cdx-indexer --sort {cdx} {warc}',
      wayback: 'bundledApps/pywb/wayback',
      waybackPort: 'bundledApps/pywb/wayback -p {port}',
      waybackReplayDir: 'bundledApps/pywb/wayback -d {dir}',
      waybackReplayDirPort: 'bundledApps/pywb/wayback -p {port} -d {dir}',
      templates: 'bundledApps/pywb/templates',
      statics: 'bundledApps/pywb/static',
      checkIfInCol: 'http://localhost:{port}/${col}-cdx?url=${url}&output=json'
    },
    collections: {
      defaultCol: 'archives/collections/default',
      dir: 'archives/collections',
      aCollPath: 'archives/collections/{col}',
      colTemplate: 'archives/collections/{col}/static',
      colStatic: 'archives/collections/{col}/templates',
      colWarcs: 'archives/collections/{col}/archive',
      colIndexs: 'archives/collections/{col}/indexes',
      templateDir: 'archives/templates',
      staticsDir: 'archives/static'
    },
    code: {
      crawlerBean: 'crawler-beans.cxml',
      wayBackConf: 'bundledApps/tomcat/webapps/ROOT/WEB-INF/wayback.xml'
    },
    wailCore: {
      dport: '3030',
      port: '3030',
      dhost: 'localhost',
      host: 'localhost',
      url: 'http://{host}:{port}',
      db: 'coreData/database',
      timemaps: 'coreData/timemaps'
    }

  }

}

const managed = mngd
const debugOSX = dbgOSX

export default class SettingsManager {
  constructor (base, settingsDir, version) {
    this._version = version
    this._settings = null
    this._settingsDir = settingsDir
    this._base = base
  }

  @autobind
  configure () {
    let { pathMan } = global
    this._settingsDir = pathMan.join(this._settingsDir,'wail-settings')
    return new Promise((resolve,reject) => {
      try {
        this._settings = new ElectronSettings({ configDirPath: this._settingsDir })
      } catch (e) {
        // if something went terrible wrong during a config the json becomes malformed
        // electron settings throws an error in this case
        fs.removeSync(this._settingsDir)
        this._settings = new ElectronSettings({ configDirPath: this._settingsDir })
      }

      if (!this._settings.get('configured') || this._settings.get('version') !== this._version) {
        console.log('We are not configured')
        let didFirstLoad = this._settings.get('didFirstLoad')
        let doFirstLoad = false
        if (didFirstLoad === null || didFirstLoad === undefined) {
          doFirstLoad = true
        } else {
          doFirstLoad = didFirstLoad
        }

        this._writeSettings(pathMan, doFirstLoad)
        // console.log(base, settings)
      } else {
        if (this._settings.get('base') !== this._base) {
          /*
           If the user moves the application directory the settings will
           will not be correct since I use absolute paths.
           I did this to myself....
           */
          let didFirstLoad = this._settings.get('didFirstLoad')
          let doFirstLoad = false
          if (didFirstLoad === null || didFirstLoad === undefined) {
            doFirstLoad = true
          } else {
            doFirstLoad = didFirstLoad
          }

          // console.log('We are not configured due to binary directory being moved')
          this._writeSettings(pathMan, doFirstLoad)
        }
        // console.log('We are configured')
      }

      this._settings.watch('heritrix.port', change => {
        console.log('heritrix.port changed ', change)
        this.rewriteHeritrixPort(change.was, change.now)
      })

      this._settings.watch('wayback.port', change => {
        let wb = _.cloneDeep(this._settings.get('wayback'))
        wb.port = change.now
        let uriTomcat = S(wb.uri_tomcat)
        wb.uri_tomcat = uriTomcat.replaceAll(`${change.was}`, `${change.now}`).s
        let uriWB = S(wb.uri_wayback)
        wb.uri_wayback = uriWB.replaceAll(`${change.was}`, `${change.now}`).s
        this._settings.set('wayback', wb)
      })
      return resolve()
    })
  }

  @autobind
  writeSettings () {
    let { pathMan } = global
    this._writeSettings(pathMan, this._settings.get('didFirstLoad'))
  }

  @autobind
  _writeSettings (pathMan, didFirstLoad) {
    this._settings.clear()
    this._settings.set('version', this._version)
    let isWindows = os.platform() === 'win32'
    this._settings.set('configured', true)
    this._settings.set('base', pathMan.base)
    managed.paths.forEach(p => {
      this._settings.set(p.name, pathMan.normalizeJoinWBase(p.path))
    })
    let heritrix = managed.heritrix
    let cmdexport = `export JAVA_HOME=${this._settings.get('jdk')}; export JRE_HOME=${this._settings.get('jre')};`
    let jHomeDarwin = '/Library/Java/JavaVirtualMachines/jdk1.7.0_79.jdk/Contents/Home'
    let darwinExport = debugOSX ? cmdexport : `export JAVA_HOME=${jHomeDarwin}; export JRE_HOME=${jHomeDarwin};`
    let command = 'sh'
    heritrix.path = this._settings.get('heritrix')
    var jobConfPath

    if (isWindows) {
      let cdxWin = `${cmdexport} ${this._settings.get('cdxIndexerWin')}`
      this._settings.set('cdxIndexer', cdxWin)
      jobConfPath = pathMan.normalizeJoinWBase(heritrix.jobConfWin)
    } else {
      jobConfPath = pathMan.normalizeJoinWBase(heritrix.jobConf) //path.normalize(path.join(base, heritrix.jobConf))
      var cdx
      if (process.platform === 'darwin') {
        cdx = `${darwinExport} ${this._settings.get('cdxIndexer')}`
      } else {
        cdx = `${cmdexport} ${this._settings.get('cdxIndexer')}`
      }

      this._settings.set('cdxIndexer', cdx)
    }
    heritrix.jobConf = jobConfPath
    this._settings.set('heritrix', heritrix)
    let checkArray = [ 'port', 'url', 'dport', 'dhost', 'host' ]
    let wc = _.mapValues(managed.wailCore, (v, k) => {
      if (!checkArray.includes(k)) {
        console.log(k)
        v = pathMan.normalizeJoinWBase(v)
      }

      if (k === 'url') {
        v = S(v).template({ port: managed.wailCore.dport, host: managed.wailCore.dhost }).s
      }
      return v
    })

    this._settings.set('wailCore', wc)

    let wb = managed.wayback
    wb.allCDX = `${this._settings.get('cdx')}${wb.allCDX}`
    wb.notIndexCDX = `!${this._settings.get('cdx')}${wb.notIndexCDX}`
    this._settings.set('wayback', wb)

    let code = managed.code
    code.crawlerBean = pathMan.normalizeJoinWBase(code.crawlerBean)
    code.wayBackConf = pathMan.normalizeJoinWBase(code.wayBackConf)

    let pywb = _.mapValues(managed.pywb, (v, k) => {
      if (k !== 'port' && k !== 'url') {
        v = pathMan.normalizeJoinWBase(v)
      }
      if (k === 'url') {
        v = S(v).template({ port: managed.pywb.port }).s
      }
      return v
    })

    let collections = _.mapValues(managed.collections, (v, k) => {
      return pathMan.normalizeJoinWBase(v)
    })

    this._settings.set('collections', collections)

    this._settings.set('pywb', pywb)
    this._settings.set('migrate', false)
    this._settings.set('didFirstLoad', didFirstLoad)

    this._settings.set('winDeleteJob', pathMan.normalizeJoinWBase( 'windowsNukeDir.bat'))

    this._settings.set('isWindows', isWindows)
    managed.commands.forEach(cmd => {
      switch (cmd.name) {
        case 'memgator':
          this._settings.set('memgatorQuery', `${this._settings.get('memgator')} -a ${this._settings.get('archives')}`)
          break
        case 'catalina':
          if (!isWindows) {
            this._settings.set(cmd.name, `${cmdexport} ${command} ${pathMan.normalizeJoinWBase( cmd.path)}`)
          } else {
            this._settings.set(cmd.name, `${path.normalize(path.join(base, 'bundledApps/wayback.bat'))} start`)
          }
          break
        case 'tomcatStart':
          if (!isWindows) {
            this._settings.set(cmd.name, `${cmdexport} ${command} ${pathMan.normalizeJoinWBase( cmd.path)}`)
            this._settings.set(`${cmd.name}Darwin`, `${darwinExport} ${command} ${pathMan.normalizeJoinWBase( cmd.path)}`)
          } else {
            this._settings.set(cmd.name, `${pathMan.normalizeJoinWBase( 'bundledApps/wayback.bat')} start`)
          }
          break
        case 'tomcatStop':
          if (!isWindows) {
            this._settings.set(cmd.name, `${cmdexport} ${command} ${pathMan.normalizeJoinWBase( cmd.path)}`)
            this._settings.set(`${cmd.name}Darwin`, `${darwinExport} ${command} ${pathMan.normalizeJoinWBase( cmd.path)}`)
          } else {
            this._settings.set(cmd.name, `${pathMan.normalizeJoinWBase('bundledApps/wayback.bat')} stop`)
          }
          break
        case 'heritrixStart':
          if (isWindows) {
            this._settings.set(cmd.name, `${pathMan.normalizeJoinWBase( 'bundledApps/heritrix.bat')} ${this._settings.get('heritrix.login')}`)
          } else {
            let hStart = `${pathMan.normalizeJoinWBase( cmd.path)} ${this._settings.get('heritrix.login')}`
            this._settings.set(cmd.name, `${cmdexport} ${hStart}`)
            this._settings.set(`${cmd.name}Darwin`, `${darwinExport} ${hStart}`)
          }
          break
        default:
          this._settings.set(cmd.name, `${cmdexport} ${command} ${pathMan.normalizeJoinWBase( cmd.path)}`)
          break
      }
    })
  }

  @autobind
  resetToDefault () {
    this.writeSettings()
  }

  @autobind
  rewriteHeritrixPort (was, is) {
    let mutate = S(' ')
    let nh = _.mapValues(this._settings.get('heritrix'), (v, k) => {
      if (_.has(v, 'url')) {
        mutate = mutate.setValue(v.url)
        mutate = mutate.replaceAll(was, is)
        v.url = mutate.s
      } else {
        mutate = mutate.setValue(k)
        if (mutate.contains('uri') || mutate.contains('ui')) {
          mutate = mutate.setValue(v)
          mutate = mutate.replaceAll(was, is)
          v = mutate.s
        }
      }
      return v
    })

    let hStart = mutate.setValue(this._settings.get('heritrixStart'))
    if (hStart.contains('-p')) {
      hStart.replaceAll(`-p ${was}`, `-p ${is}`)
    } else {
      hStart.setValue(`${this._settings.get('heritrixStart')} -p ${is}`)
    }
    this._settings.set('heritrixStart', hStart.s)
    this._settings.set('heritrix', nh)
  }

  @autobind
  rewriteHeritrixAuth ( usr, pwd) {
    if (usr && pwd) {
      let heritrix = this._settings.get('heritrix')
      let nh = _.mapValues(heritrix, (v, k) => {
        if (_.has(v, 'auth')) {
          v.auth.username = usr
          v.auth.password = pwd
        }
        return v
      })
      nh.username = usr
      nh.password = pwd

      nh.web_ui = `https://${usr}:${pwd}@localhost:${nh.port}`
      nh.login = `-a ${usr}:${pwd}`

      let hS = S(this._settings.get('heritrixStart'))
      let hSD = S(this._settings.get('heritrixStartDarwin'))
      this._settings.set('heritrixStart', hS.replaceAll(`${heritrix.username}:${heritrix.password}`, `${usr}:${pwd}`).s)
      this._settings.set('heritrixStartDarwin', hSD.replaceAll(`${heritrix.username}:${heritrix.password}`, `${usr}:${pwd}`).s)
      this._settings.set('heritrix', nh)
    }
  }

  @autobind
  get (what) {
    return this._settings.get(what)
  }

  @autobind
  set (what, replacement) {
    this._settings.set(what, replacement)
  }

  get base () {
    return this._base
  }

  get version () {
    return this._version
  }

}

