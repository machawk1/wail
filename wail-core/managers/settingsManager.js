import ElectronSettings from 'electron-settings'
import path from 'path'
import fs from 'fs-extra'
import S from 'string'
import _ from 'lodash'
import os from 'os'
import Promise from 'bluebird'
import managed from './settingsManValues'

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

export default class SettingsManager {
  constructor (base, docsPath, settingsDir, dbParentPath, version) {
    this._version = version
    this._settings = null
    this._settingsDir = settingsDir
    this._base = base
    this._docsPath = docsPath
    this._dbParentPath = dbParentPath
  }

  configure () {
    let {pathMan} = global
    this._settingsDir = pathMan.join(this._settingsDir, 'wail-settings')
    global.settingsDir = this._settingsDir
    return new Promise((resolve, reject) => {
      try {
        this._settings = new ElectronSettings({configDirPath: this._settingsDir})
      } catch (e) {
        // if something went terrible wrong during a config the json becomes malformed
        // electron settings throws an error in this case
        fs.removeSync(this._settingsDir)
        this._settings = new ElectronSettings({configDirPath: this._settingsDir})
      }

      if (!this._settings.get('configured') || this._settings.get('version') !== this._version) {
        console.log('We are not configured')
        let didFirstLoad = this._settings.get('didFirstLoad')
        if (didFirstLoad === null || didFirstLoad === undefined) {
          didFirstLoad = false
        }

        // console.log('We are not configured due to binary directory being moved')
        this._writeSettings(pathMan, didFirstLoad)
        console.log(didFirstLoad)
        // console.log(base, settings)
      } else {
        if (this._settings.get('base') !== this._base) {
          /*
           If the user moves the application directory the settings will
           will not be correct since I use absolute paths.
           I did this to myself....
           */
          let didFirstLoad = this._settings.get('didFirstLoad')
          if (didFirstLoad === null || didFirstLoad === undefined) {
            didFirstLoad = false
          }

          // if (this._version === '1.0.0-rc.3.0.1s' && !this._settings.get('didRedoFl')) {
          //   didFirstLoad = false
          // }

          // console.log('We are not configured due to binary directory being moved')
          this._writeSettings(pathMan, didFirstLoad)
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

  writeSettings () {
    let {pathMan} = global
    this._writeSettings(pathMan, this._settings.get('didFirstLoad'))
  }

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
    let darwinExport = managed.dbgOSX ? cmdexport : `export JAVA_HOME=${jHomeDarwin}; export JRE_HOME=${jHomeDarwin};`
    let command = 'sh'
    heritrix.path = this._settings.get('heritrix')
    heritrix.jobsDir = pathMan.normalizeJoin(this._docsPath, heritrix.jobsDir)
    fs.ensureDirSync(heritrix.jobsDir)

    let jobConfPath
    if (isWindows) {
      let cdxWin = `${cmdexport} ${this._settings.get('cdxIndexerWin')}`
      this._settings.set('cdxIndexer', cdxWin)
      jobConfPath = pathMan.normalizeJoinWBase(heritrix.jobConfWin)
    } else {
      jobConfPath = pathMan.normalizeJoinWBase(heritrix.jobConf) // path.normalize(path.join(base, heritrix.jobConf))
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
    let checkArray = ['port', 'url', 'dport', 'dhost', 'host']
    let wci = _.mapValues(managed.wailCore, (v, k) => {
      if (!checkArray.includes(k)) {
        console.log(k)
        v = pathMan.normalizeJoin(this._dbParentPath, v)
      }

      if (k === 'url') {
        v = S(v).template({port: managed.wailCore.dport, host: managed.wailCore.dhost}).s
      }
      return v
    })

    let wc = _.mapValues(managed.wailCore, (v, k) => {
      if (!checkArray.includes(k)) {
        console.log(k)
        v = pathMan.normalizeJoin(this._dbParentPath, v)
      }

      if (k === 'url') {
        v = S(v).template({port: managed.wailCore.dport, host: managed.wailCore.dhost}).s
      }
      return v
    })

    this._settings.set('iwailCore', wci)
    this._settings.set('wailCore', wc)

    let wb = managed.wayback
    wb.allCDX = `${this._settings.get('cdx')}${wb.allCDX}`
    wb.notIndexCDX = `!${this._settings.get('cdx')}${wb.notIndexCDX}`
    this._settings.set('wayback', wb)

    let code = managed.code
    code.crawlerBean = pathMan.normalizeJoinWBase(code.crawlerBean)
    code.wayBackConf = pathMan.normalizeJoinWBase(code.wayBackConf)

    let whichPywb = process.platform === 'win32' ? managed.pywbwin : managed.pywb
    let pywb = _.mapValues(whichPywb, (v, k) => {
      if (k !== 'port' && k !== 'url') {
        v = pathMan.normalizeJoinWBase(v)
      }
      if (k === 'url') {
        v = S(v).template({port: whichPywb.port}).s
      }
      return v
    })

    let collections = _.mapValues(managed.collections, (v, k) => {
      return pathMan.normalizeJoin(this._docsPath, v)
    })

    let icollections = _.mapValues(managed.icollections, (v, k) => {
      return pathMan.normalizeJoinWBase(v)
    })

    this._settings.set('documentsPath', this._docsPath)
    this._settings.set('warcs', pathMan.normalizeJoin(this._docsPath, managed.warcs))
    this._settings.set('iwarcs', pathMan.normalizeJoinWBase('/archives'))
    this._settings.set('collections', collections)
    this._settings.set('icollections', icollections)

    this._settings.set('pywb', pywb)
    this._settings.set('migrate', false)
    this._settings.set('didFirstLoad', didFirstLoad)

    this._settings.set('winDeleteJob', pathMan.normalizeJoinWBase('windowsNukeDir.bat'))

    this._settings.set('isWindows', isWindows)
    managed.commands.forEach(cmd => {
      switch (cmd.name) {
        case 'memgator':
          this._settings.set('memgatorQuery', `${this._settings.get('memgator')} -a ${this._settings.get('archives')}`)
          break
        case 'catalina':
        case 'tomcatStart':
        case 'tomcatStop':
          break
        case 'heritrixStart':
          if (isWindows) {
            this._settings.set(cmd.name, `${pathMan.normalizeJoinWBase('bundledApps/heritrix.bat')} ${this._settings.get('heritrix.login')}`)
          } else {
            let hStart = `${pathMan.normalizeJoinWBase(cmd.path)} ${this._settings.get('heritrix.login')} --jobs-dir ${heritrix.jobsDir}`
            this._settings.set(cmd.name, `${cmdexport} ${hStart}`)
            this._settings.set(`${cmd.name}Darwin`, `${darwinExport} ${hStart}`)
          }
          break
        default:
          this._settings.set(cmd.name, `${cmdexport} ${command} ${pathMan.normalizeJoinWBase(cmd.path)}`)
          break
      }
    })

    this._settings.set('twitter', managed.twitter)
    let whichWarcChecker = process.platform === 'win32' ? managed.warcCheckerWin : managed.warcChecker
    let wcChecker = _.mapValues(whichWarcChecker, v => pathMan.normalizeJoinWBase(v))
    this._settings.set('warcChecker', wcChecker)
    this._settings.set('dumpTwitterWarcs', pathMan.normalizeJoinWBase(managed.dumpTwitterWarcs))
    this._settings.set('archivePreload', pathMan.normalizeJoinWBase(managed.archivePreload))

    let whichExtractSeed = process.platform === 'win32' ? managed.extractSeedWin : managed.extractSeed
    let extractSeed = _.mapValues(whichExtractSeed, v => pathMan.normalizeJoinWBase(v))
    this._settings.set('extractSeed', extractSeed)
    this._settings.set('didRedoFl', true)
    this._settings.set('logBasePath', global.__wailControl.logPath)
    fs.ensureDirSync(pathMan.normalizeJoin(this._dbParentPath, managed.wailCore.db))
  }

  resetToDefault () {
    this.writeSettings()
  }

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

  rewriteHeritrixAuth (usr, pwd) {
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

  get (what) {
    return this._settings.get(what)
  }

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
