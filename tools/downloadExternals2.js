const fs = require('fs-extra')
const path = require('path')
const cp = require('child_process')
const os = require('os')
const Promise = require('bluebird')
const through2 = require('through2')
const request = require('request')
const extract = require('extract-zip')
const shelljs = require('shelljs')

const isWindows = process.platform === 'win32'
const here = process.cwd()
const wuPath = path.join(here, 'wail_utils')
const wuRDPath = path.join(wuPath, 'realDist')
const bappsPath = path.join(here, 'bundledApps')
const wuCloneUrl = 'https://github.com/N0taN3rd/wail_utils.git'
const buildExe = isWindows ? 'make_it_so.bat' : 'make_it_so.sh'
const cloneExe = `git clone ${wuCloneUrl}`
const currentOSArch = `${os.platform()}${os.arch()}`
const zips = path.join(here, 'zips')
const memgatorsP = path.join(here, 'memgators')
const cloneOpts = {
  shell: true,
  cwd: here,
  studio: [ 'ignore', 'inherit', 'inherit' ]
}
const spawnBuildOpts = {
  shell: true,
  cwd: wuPath,
  studio: [ 'ignore', 'inherit', 'inherit' ]
}
const idxs = {
  win32ia32: 0,
  win32x64: 1,
  linuxia32: 2,
  linuxx64: 3,
  darwinx64: 4,
}
//checksums from public git
const checkSums = [
  /*https://github.com/alexkasko/openjdk-unofficial-builds/blob/master/checksums/7u80/openjdk-1.7.0-u80-unofficial-windows-i586-image.zip.sha256*/
  'f3b715bc049b3c88bc47695278433c7dc4b2648e2b156f5e24346aecba343035',
  /*https://github.com/alexkasko/openjdk-unofficial-builds/blob/master/checksums/7u80/openjdk-1.7.0-u80-unofficial-windows-amd64-image.zip.sha256*/
  '1b835601f4ae689b9271040713b01d6bdd186c6a57bb4a7c47e1f7244d5ac928',
  /*https://github.com/alexkasko/openjdk-unofficial-builds/blob/master/checksums/7u80/openjdk-1.7.0-u80-unofficial-linux-i586-image.zip.sha256*/
  '2dafc91c91bd088a9d39528c3c29f44024aa10e5863db0f6d76b03b95a2f2917',
  /*https://github.com/alexkasko/openjdk-unofficial-builds/blob/master/checksums/7u80/openjdk-1.7.0-u80-unofficial-linux-amd64-image.zip.sha256*/
  'b87beb73f07af5b89b35b8656439c70fb7f46afdaa36e4a9394ad854c3a0b23d',
  /*https://github.com/alexkasko/openjdk-unofficial-builds/blob/master/checksums/7u80/openjdk-1.7.0-u80-unofficial-macosx-x86_64-image.zip.sha256*/
  'f6df07cec3b1bd53b857e5f4e20309ab5e8aeaa29ca9152ab0d26b77b339780a',
]
//downloads from https://bitbucket.org/alexkasko/openjdk-unofficial-builds and https://github.com/alexkasko/openjdk-unofficial-builds
//have roll your own from https://github.com/hgomez/obuildfactory/wiki can only roll linux so far.....
const jdks = [
  'https://bitbucket.org/alexkasko/openjdk-unofficial-builds/downloads/openjdk-1.7.0-u80-unofficial-windows-i586-image.zip',
  'https://bitbucket.org/alexkasko/openjdk-unofficial-builds/downloads/openjdk-1.7.0-u80-unofficial-windows-amd64-image.zip',
  'https://bitbucket.org/alexkasko/openjdk-unofficial-builds/downloads/openjdk-1.7.0-u80-unofficial-linux-i586-image.zip',
  'https://bitbucket.org/alexkasko/openjdk-unofficial-builds/downloads/openjdk-1.7.0-u80-unofficial-linux-amd64-image.zip',
  'https://bitbucket.org/alexkasko/openjdk-unofficial-builds/downloads/openjdk-1.7.0-u80-unofficial-macosx-x86_64-image.zip',
]
const memgators = [
  'https://github.com/oduwsdl/memgator/releases/download/1.0-rc7/memgator-windows-386.exe',
  'https://github.com/oduwsdl/memgator/releases/download/1.0-rc7/memgator-windows-amd64.exe',
  'https://github.com/oduwsdl/memgator/releases/download/1.0-rc7/memgator-linux-386',
  'https://github.com/oduwsdl/memgator/releases/download/1.0-rc7/memgator-linux-amd64',
  'https://github.com/oduwsdl/memgator/releases/download/1.0-rc7/memgator-darwin-amd64',
]

const memgatorPaths = [
  path.join(memgatorsP, 'memgator-windows-386.exe'),
  path.join(memgatorsP, 'memgator-windows-amd64.exe'),
  path.join(memgatorsP, 'memgator-linux-386'),
  path.join(memgatorsP, 'memgator-linux-amd64'),
  path.join(memgatorsP, 'memgator-darwin-amd64'),
]

const memgatorNames = [
  'memgator.exe',
  'memgator.exe',
  'memgator',
  'memgator',
  'memgator',
]

const unpackedJDKs = [
  path.join(zips, 'openjdk-1.7.0-u80-unofficial-windows-i586-image'),
  path.join(zips, 'openjdk-1.7.0-u80-unofficial-windows-amd64-image'),
  path.join(zips, 'openjdk-1.7.0-u80-unofficial-linux-i586-image'),
  path.join(zips, 'openjdk-1.7.0-u80-unofficial-linux-amd64-image'),
  path.join(zips, 'openjdk-1.7.0-u80-unofficial-macosx-x86_64-image'),
]
const titles = [
  'downloading openjdk-7u80-win-i586',
  'done downloading openjdk-7u80-win-i586',
  'downloading openjdk7u80-win-amd64',
  'done downloading openjdk7u80-win-amd64',
  'downloading openjdk7u80-linux-i586',
  'done downloading openjdk7u80-linux-i586',
  'downloading openjdk7u80-linux-amd64',
  'done downloading openjdk7u80-linux-amd64',
  'downloading openjdk7u80-darwin-x86_64',
  'done downloading openjdk7u80-darwin-x86_64',
  'downloading memgator-win386',
  'done downloading memgator-win386',
  'downloading memgator-wind-amd64',
  'done downloading memgator-wind-amd64',
  'downloading memgator-linux-386',
  'done downloading memgator-linux-386',
  'downloading memgator-linux-amd64',
  'done downloading memgator-linux-amd64',
  'downloading memgator-darwin-amd64',
  'done downloading memgator-darwin-amd64',
  'downloading of externals complete'
]
const zipRE = /.zip/
const jdkNameRe = /['a-zA-z\s=;]+"([a-zA-z0-9.-]+)"/g
const memNameRe = /['a-zA-z;\s]+=([a-zA-z0-9.-]+)/g
const onlyZip = through2.obj(function (item, enc, next) {
  if (!item.stats.isDirectory() && path.extname(item.path) === '.zip')
    this.push(item)
  next()
})

const checkPathExists = (path) => new Promise((resolve, reject) => {
  fs.access(path, fs.constants.R_OK, err => {
    resolve(!err)
  })
})

const ensureDir = dirPath => new Promise((resolve, reject) => {
  fs.ensureDir(dirPath, err => {
    if (err) {
      return reject(err)
    } else {
      return resolve()
    }
  })
})

const emptyDir = dirPath => new Promise((resolve, reject) => {
  fs.emptyDir(dirPath, error => {
    if (error) {
      reject(error)
    } else {
      resolve()
    }
  })
})

const readWailUtilsDistDir = () => new Promise((resolve, reject) => {
  fs.readdir(wuRDPath, (error, files) => {
    if (error) {
      reject(error)
    } else {
      resolve(files.map(f => path.join(wuRDPath, f)))
    }
  })
})

const doClone = () => new Promise((resolve, reject) => {
  const clone = cp.spawn(cloneExe, cloneOpts)
  clone.on('close', (code) => {
    resolve(code)
  })
  clone.on('error', (err) => {
    reject(err)
  })
})

const doBuild = () => new Promise((resolve, reject) => {
  const build = cp.spawn(buildExe, spawnBuildOpts)
  build.on('close', (code) => {
    resolve(code)
  })
  build.on('error', (err) => {
    reject(err)
  })
})

const removeFile = filePath => new Promise((resolve, reject) => {
  fs.remove(filePath, err => {
    if (err) {
      reject(err)
    } else {
      resolve()
    }
  })
})

const doACopy = (from, to, opts = {}) => new Promise((resolve, reject) => {
  fs.copy(from, to, opts, (error) => {
    if (error) {
      reject(error)
    } else {
      resolve()
    }
  })
})

const makeJDKReq = uri => {
  const opts = {
    method: 'GET',
    uri,
    headers: {
      "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/537.13+ (KHTML, like Gecko) Version/5.1.7 Safari/534.57.2",
      "accept-encoding": "gzip,deflate,compress,application/zip",
    }
  }
  return request(opts)
}

const makeMemReq = uri => {
  const opts = {
    method: 'GET',
    uri: uri,
    headers: {
      "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/537.13+ (KHTML, like Gecko) Version/5.1.7 Safari/534.57.2",
    }
  }
  return request(opts)
}

const dlJdk = uri => new Promise((resolve, reject) => {
  const req = makeJDKReq(uri)
  req.on('response', res => {
    if (res.statusCode !== 200) {
      return reject(new Error(`Status not 200 for ${uri}`))
    }
    const encoding = res.headers[ 'content-type' ]
    const name = jdkNameRe.exec(res.headers[ 'content-disposition' ])[ 1 ]
    if (encoding === 'application/zip') {
      console.log(`downloading jdk for ${currentOSArch}`)
      res.pipe(fs.createWriteStream(path.join(zips, name)))
        .on('close', () => {
          console.log(`done downloading jdk for ${currentOSArch}`)
          resolve()
        })
    }
  })
  req.on('error', (err) => {
    reject(err)
  })
})

const dlMem = uri => new Promise((resolve, reject) => {
  const req = makeMemReq(uri)
  req.on('response', (res) => {
    if (res.statusCode !== 200) {
      return reject(new Error(`Status not 200 for ${uri}`))
    }
    const encoding = res.headers[ 'content-type' ]
    const name = memNameRe.exec(res.headers[ 'content-disposition' ])[ 1 ]
    if (encoding === 'application/octet-stream') {
      console.log(`downloading memgator for ${currentOSArch}`)
      res.pipe(fs.createWriteStream(path.join(memgatorsP, name)))
        .on('close', () => {
          console.log(`done downloading memgator for ${currentOSArch}`)
          resolve()
        })
    }
  })
  req.on('error', (err) => {
    reject(err)
  })
})

const extractZip = zipPath => new Promise((resolve, reject) => {
  const name = path.basename(zipPath).replace(zipRE, '')
  extract(zipPath, { dir: `${zips}` }, zipError => {
    if (zipError) {
      reject(zipError)
    } else {
      console.log(`done extracting ${name} ensuring content is not read only`)
      console.log(`done ensuring not read only for ${name}`)
      resolve()
    }
  })
})

const moveJdkMem = async () => {
  const memgatorFromPath = memgatorPaths[ idxs[ currentOSArch ] ]
  const memgatorToPath = path.join(bappsPath, memgatorNames[ idxs[ currentOSArch ] ])
  const jdkFromPath = unpackedJDKs[ idxs[ currentOSArch ] ]
  const jdkToPath = path.join(bappsPath, 'openjdk')
  await ensureDir(jdkToPath)
  await emptyDir(jdkToPath)
  console.log(`moving jdk ${jdkFromPath} to ${jdkToPath}`)
  await doACopy(jdkFromPath, jdkToPath, { clobber: true })
  console.log("success in moving jdk!")
  console.log(`moving memgator ${memgatorFromPath} to ${memgatorToPath}`)
  await removeFile(memgatorToPath)
  await doACopy(memgatorFromPath, memgatorToPath, { clobber: true })
  shelljs.chmod('777', memgatorToPath)
  console.log("success in moving memgator!")
}

const cloneAndBuildWailUtils = async () => {
  if (!await checkPathExists(wuPath)) {
    const cloneExitCode = await doClone()
    if (cloneExitCode !== 0) {
      throw new Error(`Clone failed with exit code ${cloneExitCode}`)
    }
  }
  const buildExitCode = await doBuild()
  if (buildExitCode !== 0) {
    throw new Error(`Building Wail Utils failed with exit code ${buildExitCode}`)
  }
  const builtUtils = await readWailUtilsDistDir()
  if (builtUtils.length !== 3) {
    throw new Error(`Building of wail utils failed. Expected 3 directories to exist found only ${builtUtils.length} directories ${builtUtils.join(' ')}`)
  }
  for (const built of builtUtils) {
    await doACopy(built, path.join(bappsPath, path.basename(built)))
  }
}

const dlMoveJdkMemgator = async () => {
  await Promise.map([ memgatorsP, zips ], ensureDir, { concurrency: 1 })
  await emptyDir(zips)
  await dlJdk(jdks[ idxs[ currentOSArch ] ])
  await dlMem(memgators[ idxs[ currentOSArch ] ])
  console.log(`Done downloading memgator for ${currentOSArch} extracting jdk `)
  shelljs.chmod('777', `${unpackedJDKs[ idxs[ currentOSArch ] ]}.zip`)
  await extractZip(`${unpackedJDKs[ idxs[ currentOSArch ] ]}.zip`)
  await moveJdkMem()
}

const doIt = async () => {
  await cloneAndBuildWailUtils()
  await dlMoveJdkMemgator()
}

doIt()
  .then(() => {
    console.log('done')
  })
  .catch(err => {
    console.error(err)
  })