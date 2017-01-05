import path from 'path'

if (process.env.NODE_ENV === 'development') {
  module.exports = {
    dbgOSX: true,
    paths: [
      {name: 'bundledApps', path: 'bundledApps'},
      {name: 'logs', path: 'waillogs/wail.log'},
      {name: 'archives', path: 'config/archives.json'},
      {name: 'cdx', path: 'archiveIndexes'},
      {name: 'cdxTemp', path: 'archiveIndexes/combined_unsorted.cdxt'},
      {name: 'crawlerBean', path: 'crawler-beans.cxml'},
      {name: 'heritrixBin', path: 'bundledApps/heritrix/bin/heritrix'},
      {name: 'heritrixJob', path: 'bundledApps/heritrix/jobs'},
      {name: 'heritrix', path: 'bundledApps/heritrix'},
      {name: 'indexCDX', path: 'archiveIndexes/index.cdx'},
      {name: 'index', path: '/config/path-index.txt'},
      {name: 'jdk', path: 'bundledApps/openjdk'},
      {name: 'jobConf', path: 'crawler-beans.cxml'},
      {name: 'jre', path: 'bundledApps/openjdk'},
      {name: 'memgator', path: 'bundledApps/memgator'},
      {name: 'tomcat', path: 'bundledApps/tomcat'},
    ],
    warcs: '/WAIL_ManagedCollections',
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
        headers: {'content-type': 'application/x-www-form-urlencoded'},
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
        headers: {'content-type': 'application/x-www-form-urlencoded'},
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
        headers: {'content-type': 'application/x-www-form-urlencoded'},
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
        headers: {'content-type': 'application/x-www-form-urlencoded'},
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
        headers: {'content-type': 'application/x-www-form-urlencoded'},
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
      },
      jobsDir: 'WAIL_Managed_Crawls'
    },
    wayback: {
      port: '8080',
      uri_tomcat: 'http://localhost:8080/',
      uri_wayback: 'http://localhost:8080/wayback/',
      allCDX: `${path.sep}*.cdx`,
      notIndexCDX: `${path.sep}index.cdx`
    },
    commands: [
      {name: 'catalina', path: 'bundledApps/tomcat/bin/catalina.sh'},
      {name: 'tomcatStart', path: 'bundledApps/tomcat/bin/startup.sh'},
      {name: 'tomcatStop', path: 'bundledApps/tomcat/bin/shutdown.sh'},
      {name: 'heritrixStart', path: 'bundledApps/heritrix/bin/heritrix'},
      {name: 'memgator'}
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
    pywbwin: {
      home: 'bundledApps/pywb',
      port: '8080',
      url: 'http://localhost:{port}/',
      wbMan: 'bundledApps\\pywb\\Scripts\\wb-manager.exe',
      newCollection: 'bundledApps\\pywb\\Scripts\\wb-manager.exe init {col}',
      addWarcsToCol: 'bundledApps\\pywb\\Scripts\\wb-manager.exe add {col} {warcs}',
      addMetadata: 'bundledApps\\pywb\\Scripts\\wb-manager.exe metadata {col} --set {metadata}',
      reindexCol: 'bundledApps\\pywb\\Scripts\\wb-manager.exe reindex {col}',
      convertCdx: 'bundledApps\\pywb\\Scripts\\wb-manager.exe convert-cdx {cdx}',
      autoIndexCol: 'bundledApps\\pywb\\Scripts\\wb-manager.exe autoindex {col}',
      autoIndexDir: 'bundledApps\\pywb\\Scripts\\wb-manager.exe autoindex {dir}',
      sortedCombinedCdxj: 'bundledApps\\pywb\\Scripts\\cdx-indexer.exe --sort -j combined.cdxj {warcs}',
      sortedCombinedCdx: 'bundledApps\\pywb\\Scripts\\cdx-indexer.exe --sort combined.cdx {warcs}',
      cdxjPerColWarc: 'bundledApps\\pywb\\Scripts\\cdx-indexer.exe --sort -j {cdx} {warc}',
      cdxPerColWarc: 'bundledApps\\pywb\\Scripts\\cdx-indexer.exe --sort {cdx} {warc}',
      wayback: 'bundledApps\\pywb\\Scripts\\wayback.exe',
      waybackPort: 'bundledApps\\pywb\\Scripts\\wayback.exe -p {port}',
      waybackReplayDir: 'bundledApps\\pywb\\Scripts\\wayback.exe -d {dir}',
      waybackReplayDirPort: 'bundledApps\\pywb\\Scripts\\wayback.exe -p {port} -d {dir}',
      templates: 'bundledApps/pywb/templates',
      statics: 'bundledApps/pywb/static',
      checkIfInCol: 'http://localhost:{port}/${col}-cdx?url=${url}&output=json'
    },
    collections: {
      defaultCol: 'WAIL_ManagedCollections/collections/Wail',
      dir: 'WAIL_ManagedCollections/collections',
      aCollPath: 'WAIL_ManagedCollections/collections/{col}',
      colTemplate: 'WAIL_ManagedCollections/collections/{col}/static',
      colStatic: 'WAIL_ManagedCollections/collections/{col}/templates',
      colWarcs: 'WAIL_ManagedCollections/collections/{col}/archive',
      colIndexs: 'WAIL_ManagedCollections/collections/{col}/indexes',
      templateDir: 'WAIL_ManagedCollections/templates',
      staticsDir: 'WAIL_ManagedCollections/static'
    },
    icollections: {
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
      db: 'database',
      timemaps: 'timemaps'
    },
    iwailCore: {
      dport: '3030',
      port: '3030',
      dhost: 'localhost',
      host: 'localhost',
      url: 'http://{host}:{port}',
      db: 'database',
      timemaps: 'timemaps'
    },
    twitter: {
      wailKey: 'K1y1GmSdDfUmBNMJeX1lf8Ono',
      wailSecret: 'Ksd87lVkQWRVeXUIYjqqPF7mfUZuRq1aU1fgAFJHdDz3AY7NTY',
      userToken: '4844579470-y1a1kQePvEohKDp8RDfESX1whNRhlTm856JHWn3',
      userSecret: '46R2ynfMC8CmHzsd76UReneRGcPbuOaPAIhZVeMLKZD2f',
      userSignedIn: true
    },
    warcChecker: {
      dir: 'bundledApps/warcChecker/warcChecker -d {path}',
      file: 'bundledApps/warcChecker/warcChecker -f {path}',
    },
    extractSeed: {
      dir: 'bundledApps/listUris/listUris -d {path}',
      file: 'bundledApps/listUris/listUris -f {path}',
    },
    archivePreload: 'wail-twitter/archive/inject.js',
    dumpTwitterWarcs: 'twitterDump'

  }
} else {
  module.exports = {
    dbgOSX: false,
    paths: [
      {name: 'bundledApps', path: 'bundledApps'},
      {name: 'logs', path: 'waillogs/wail.log'},
      {name: 'archives', path: 'config/archives.json'},
      {name: 'cdx', path: 'archiveIndexes'},
      {name: 'cdxTemp', path: 'archiveIndexes/combined_unsorted.cdxt'},
      {name: 'crawlerBean', path: 'crawler-beans.cxml'},
      {name: 'heritrixBin', path: 'bundledApps/heritrix/bin/heritrix'},
      {name: 'heritrixJob', path: 'bundledApps/heritrix/jobs'},
      {name: 'heritrix', path: 'bundledApps/heritrix'},
      {name: 'indexCDX', path: 'archiveIndexes/index.cdx'},
      {name: 'index', path: '/config/path-index.txt'},
      {name: 'jdk', path: 'bundledApps/openjdk'},
      {name: 'jobConf', path: 'crawler-beans.cxml'},
      {name: 'jre', path: 'bundledApps/openjdk'},
      {name: 'memgator', path: 'bundledApps/memgator'},
      {name: 'tomcat', path: 'bundledApps/tomcat'},
    ],
    warcs: '/WAIL_ManagedCollections',
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
        headers: {'content-type': 'application/x-www-form-urlencoded'},
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
        headers: {'content-type': 'application/x-www-form-urlencoded'},
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
        headers: {'content-type': 'application/x-www-form-urlencoded'},
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
        headers: {'content-type': 'application/x-www-form-urlencoded'},
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
        headers: {'content-type': 'application/x-www-form-urlencoded'},
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
      },
      jobsDir: 'WAIL_Managed_Crawls'
    },
    wayback: {
      port: '8080',
      uri_tomcat: 'http://localhost:8080/',
      uri_wayback: 'http://localhost:8080/wayback/',
      allCDX: `${path.sep}*.cdx`,
      notIndexCDX: `${path.sep}index.cdx`
    },
    commands: [
      {name: 'catalina', path: 'bundledApps/tomcat/bin/catalina.sh'},
      {name: 'tomcatStart', path: 'bundledApps/tomcat/bin/startup.sh'},
      {name: 'tomcatStop', path: 'bundledApps/tomcat/bin/shutdown.sh'},
      {name: 'heritrixStart', path: 'bundledApps/heritrix/bin/heritrix'},
      {name: 'memgator'}
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
    pywbwin: {
      home: 'bundledApps/pywb',
      port: '8080',
      url: 'http://localhost:{port}/',
      wbMan: 'bundledApps\\pywb\\Scripts\\wb-manager.exe',
      newCollection: 'bundledApps\\pywb\\Scripts\\wb-manager.exe init {col}',
      addWarcsToCol: 'bundledApps\\pywb\\Scripts\\wb-manager.exe add {col} {warcs}',
      addMetadata: 'bundledApps\\pywb\\Scripts\\wb-manager.exe metadata {col} --set {metadata}',
      reindexCol: 'bundledApps\\pywb\\Scripts\\wb-manager.exe reindex {col}',
      convertCdx: 'bundledApps\\pywb\\Scripts\\wb-manager.exe convert-cdx {cdx}',
      autoIndexCol: 'bundledApps\\pywb\\Scripts\\wb-manager.exe autoindex {col}',
      autoIndexDir: 'bundledApps\\pywb\\Scripts\\wb-manager.exe autoindex {dir}',
      sortedCombinedCdxj: 'bundledApps\\pywb\\Scripts\\cdx-indexer.exe --sort -j combined.cdxj {warcs}',
      sortedCombinedCdx: 'bundledApps\\pywb\\Scripts\\cdx-indexer.exe --sort combined.cdx {warcs}',
      cdxjPerColWarc: 'bundledApps\\pywb\\Scripts\\cdx-indexer.exe --sort -j {cdx} {warc}',
      cdxPerColWarc: 'bundledApps\\pywb\\Scripts\\cdx-indexer.exe --sort {cdx} {warc}',
      wayback: 'bundledApps\\pywb\\Scripts\\wayback.exe',
      waybackPort: 'bundledApps\\pywb\\Scripts\\wayback.exe -p {port}',
      waybackReplayDir: 'bundledApps\\pywb\\Scripts\\wayback.exe -d {dir}',
      waybackReplayDirPort: 'bundledApps\\pywb\\Scripts\\wayback.exe -p {port} -d {dir}',
      templates: 'bundledApps/pywb/templates',
      statics: 'bundledApps/pywb/static',
      checkIfInCol: 'http://localhost:{port}/${col}-cdx?url=${url}&output=json'
    },
    collections: {
      defaultCol: 'WAIL_ManagedCollections/collections/default',
      dir: 'WAIL_ManagedCollections/collections',
      aCollPath: 'WAIL_ManagedCollections/collections/{col}',
      colTemplate: 'WAIL_ManagedCollections/collections/{col}/static',
      colStatic: 'WAIL_ManagedCollections/collections/{col}/templates',
      colWarcs: 'WAIL_ManagedCollections/collections/{col}/archive',
      colIndexs: 'WAIL_ManagedCollections/collections/{col}/indexes',
      templateDir: 'WAIL_ManagedCollections/templates',
      staticsDir: 'WAIL_ManagedCollections/static'
    },
    icollections: {
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
      db: 'database',
      timemaps: 'timemaps'
    },
    iwailCore: {
      dport: '3030',
      port: '3030',
      dhost: 'localhost',
      host: 'localhost',
      url: 'http://{host}:{port}',
      db: 'database',
      timemaps: 'timemaps'
    },
    twitter: {
      wailKey: 'K1y1GmSdDfUmBNMJeX1lf8Ono',
      wailSecret: 'Ksd87lVkQWRVeXUIYjqqPF7mfUZuRq1aU1fgAFJHdDz3AY7NTY',
      userToken: '',
      userSecret: '',
      userSignedIn: false
    },
    warcChecker: {
      dir: 'bundledApps/warcChecker/warcChecker -d {path}',
      file: 'bundledApps/warcChecker/warcChecker -f {path}',
    },
    extractSeed: {
      dir: 'bundledApps/listUris/listUris -d {path}',
      file: 'bundledApps/listUris/listUris -f {path}',
    },
    archivePreload: 'wail-twitter/archive/inject.js',
    dumpTwitterWarcs: 'twitterDump'
  }
}
