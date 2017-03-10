import Settings from 'electron-settings'
import path from 'path'
import fs from 'fs-extra'
import S from 'string'
import _ from 'lodash'
import os from 'os'
import kph from 'key-path-helpers'
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

const managedPathReducer = (acum, aPath) => {
  acum[aPath.name] = path.normalize(path.join(global.basePath, aPath))
  return acum
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

  _shouldReConfigure (iSettings) {
    if (!iSettings.configured || iSettings.version !== this._version) {
      return true
    }
    return iSettings.base !== this._base
  }

  async configure () {
    this._settingsDir = global.settingsDir = path.join(this._settingsDir, 'wail-settings')
    Settings.configure({
      settingsDir: this._settingsDir,
      settingsFileName: 'settings.json',
      prettify: true
    })

    let iSettings, wasError = false
    try {
      iSettings = await Settings.get()
    } catch (error) {
      console.error('getting settings', error)
      wasError = true
    }

    if (!wasError) {
      if (!iSettings || _.isEmpty(iSettings)) {
        console.log('the settings are null!!')
        this._settings = await this._writeSettings()
      } else {
        if (this._shouldReConfigure(iSettings)) {
          let didFirstLoad = iSettings.didFirstLoad
          if (didFirstLoad === null || didFirstLoad === undefined) {
            didFirstLoad = false
          }
          this._settings = await this._writeSettings(didFirstLoad)
        } else {
          this._settings = iSettings
        }
      }
    }
  }

  writeSettings () {
    if (!this._settings || _.isEmpty(this._settings)) {
      return this._writeSettings()
    }
    return this._writeSettings(this.get('didFirstLoad'))
  }

  resetToDefault (didFirstLoad = false) {
    return this.writeSettings(didFirstLoad)
  }

  _makeDefaults (didFirstLoad = false) {
    const defaults = managed.paths.reduce(managedPathReducer, {
      version: this._version,
      configured: true,
      base: global.basePath,
    })
    let isWindows = os.platform() === 'win32'
    let heritrix = managed.heritrix
    let cmdexport = `export JAVA_HOME=${defaults.jdk}; export JRE_HOME=${defaults.jre};`
    let jHomeDarwin = '/Library/Java/JavaVirtualMachines/jdk1.7.0_79.jdk/Contents/Home'
    let darwinExport = managed.dbgOSX ? cmdexport : `export JAVA_HOME=${jHomeDarwin}; export JRE_HOME=${jHomeDarwin};`
    let command = 'sh'
    heritrix.path = defaults.heritrix
    heritrix.jobsDir = path.normalize(path.join(this._docsPath, heritrix.jobsDir))
    fs.ensureDirSync(heritrix.jobsDir)

    let jobConfPath
    if (isWindows) {
      jobConfPath = path.normalize(path.join(global.basePath, heritrix.jobConfWin))
    } else {
      jobConfPath = path.normalize(path.join(global.basePath, heritrix.jobConf)) // path.normalize(path.join(base, heritrix.jobConf))
    }
    heritrix.jobConf = jobConfPath
    defaults.heritrix = heritrix
    let checkArray = ['port', 'url', 'dport', 'dhost', 'host']
    let wci = _.mapValues(managed.wailCore, (v, k) => {
      if (!checkArray.includes(k)) {
        console.log(k)
        v = path.normalize(path.join(this._dbParentPath, v))
      }

      if (k === 'url') {
        v = S(v).template({port: managed.wailCore.dport, host: managed.wailCore.dhost}).s
      }
      return v
    })

    let wc = _.mapValues(managed.wailCore, (v, k) => {
      if (!checkArray.includes(k)) {
        console.log(k)
        v = path.normalize(path.join(this._dbParentPath, v))
      }

      if (k === 'url') {
        v = S(v).template({port: managed.wailCore.dport, host: managed.wailCore.dhost}).s
      }
      return v
    })

    defaults.iwailCore = wci
    defaults.wailCore = wc
    defaults.wayback = managed.wayback

    let code = managed.code
    code.crawlerBean = path.normalize(path.join(global.basePath, code.crawlerBean))
    code.wayBackConf = path.normalize(path.join(global.basePath, code.wayBackConf))

    let whichPywb = process.platform === 'win32' ? managed.pywbwin : managed.pywb
    let pywb = _.mapValues(whichPywb, (v, k) => {
      if (k !== 'port' && k !== 'url') {
        v = path.normalize(path.join(global.basePath, v))
      }
      if (k === 'url') {
        v = S(v).template({port: whichPywb.port}).s
      }
      return v
    })

    let collections = _.mapValues(managed.collections, (v, k) => {
      return path.normalize(path.join(this._docsPath, v))
    })

    let icollections = _.mapValues(managed.icollections, (v, k) => {
      return path.normalize(path.join(global.basePath, v))
    })

    defaults.documentsPath = this._docsPath
    defaults.warcs = path.normalize(path.join(this._docsPath, managed.warcs))
    defaults.iwarcs = path.normalize(path.join(global.basePath, '/archives'))
    defaults.collections = collections
    defaults.icollections = icollections

    defaults.pywb = pywb
    defaults.migrate = false
    defaults.didFirstLoad = didFirstLoad

    defaults.winDeleteJob = path.normalize(path.join(global.basePath, 'windowsNukeDir.bat'))

    defaults.isWindows = isWindows
    defaults.memgatorQuery = `${defaults.memgator} -a ${defaults.archives}`
    if (isWindows) {
      let batPath = path.normalize(path.join(global.basePath, 'bundledApps/heritrix.bat'))
      defaults.heritrixStart = `${batPath} ${heritrix.login}`
    } else {
      let hstartPath = path.normalize(path.join(global.basePath, managed.commands[0].path))
      let hStart = `${hstartPath} ${heritrix.login} --jobs-dir ${heritrix.jobsDir}`
      defaults.heritrixStart = `${cmdexport} ${hStart}`
      defaults.heritrixStartDarwin = `${darwinExport} ${hStart}`
    }

    defaults.twitter = managed.twitter
    let whichWarcChecker = process.platform === 'win32' ? managed.warcCheckerWin : managed.warcChecker
    defaults.warcChecker = _.mapValues(whichWarcChecker, v => path.normalize(path.join(global.basePath, v)))
    defaults.dumpTwitterWarcs = path.normalize(path.join(global.basePath, managed.dumpTwitterWarcs))
    defaults.archivePreload = path.normalize(path.join(global.basePath, managed.archivePreload))

    let whichExtractSeed = process.platform === 'win32' ? managed.extractSeedWin : managed.extractSeed
    defaults.extractSeed = _.mapValues(whichExtractSeed, v => path.normalize(path.join(global.basePath, v)))
    defaults.didRedoFl = true
    defaults.logBasePath = global.__wailControl.logPath
    fs.ensureDirSync(path.normalize(path.join(this._dbParentPath, managed.wailCore.db)))
    return defaults
  }

  async _writeSettings (didFirstLoad = false) {
    Settings.defaults(this._makeDefaults(didFirstLoad))
    await Settings.applyDefaults({overwrite: true, prettify: true})
    return await Settings.get()
  }

  get (what) {
    if (typeof what === 'string') {
      return kph.getValueAtKeyPath(this._settings, what)
    }
    return this._settings
  }

  async set (what, replacement) {
    await Settings.set(what, replacement, {prettify: true})
    this._settings = await Settings.get()
  }

  setSync (what, replacement) {
    Settings.setSync(what, replacement, {prettify: true})
    this._settings = Settings.getSync()
  }

  get base () {
    return this._base
  }

  get version () {
    return this._version
  }

  rewriteHeritrixPort (was, is) {
    // let mutate = S(' ')
    // let nh = _.mapValues(this._settings.get('heritrix'), (v, k) => {
    //   if (_.has(v, 'url')) {
    //     mutate = mutate.setValue(v.url)
    //     mutate = mutate.replaceAll(was, is)
    //     v.url = mutate.s
    //   } else {
    //     mutate = mutate.setValue(k)
    //     if (mutate.contains('uri') || mutate.contains('ui')) {
    //       mutate = mutate.setValue(v)
    //       mutate = mutate.replaceAll(was, is)
    //       v = mutate.s
    //     }
    //   }
    //   return v
    // })
    //
    // let hStart = mutate.setValue(this._settings.get('heritrixStart'))
    // if (hStart.contains('-p')) {
    //   hStart.replaceAll(`-p ${was}`, `-p ${is}`)
    // } else {
    //   hStart.setValue(`${this._settings.get('heritrixStart')} -p ${is}`)
    // }
    // this._settings.set('heritrixStart', hStart.s)
    // this._settings.set('heritrix', nh)
  }

  rewriteHeritrixAuth (usr, pwd) {
    // if (usr && pwd) {
    //   let heritrix = this.get('heritrix')
    //   let nh = _.mapValues(heritrix, (v, k) => {
    //     if (_.has(v, 'auth')) {
    //       v.auth.username = usr
    //       v.auth.password = pwd
    //     }
    //     return v
    //   })
    //   nh.username = usr
    //   nh.password = pwd
    //
    //   nh.web_ui = `https://${usr}:${pwd}@localhost:${nh.port}`
    //   nh.login = `-a ${usr}:${pwd}`
    //
    //   let hS = S(this.get('heritrixStart'))
    //   let hSD = S(this.get('heritrixStartDarwin'))
    //   this._settings.set('heritrixStart', hS.replaceAll(`${heritrix.username}:${heritrix.password}`, `${usr}:${pwd}`).s)
    //   this._settings.set('heritrixStartDarwin', hSD.replaceAll(`${heritrix.username}:${heritrix.password}`, `${usr}:${pwd}`).s)
    //   this._settings.set('heritrix', nh)
    // }
  }

}

