import keyMirror from "keymirror"
import path from "path"
import * as EditorActions from '../actions/editor-actions'

const ipcRenderer = require('electron').ipcRenderer


const base =  './'


if(process.env.NODE_ENV !== 'development'){
   ipcRenderer.send('getPath', '/')
}


const consts = {
   pather: function () {
      console.log(path.basename(__filename))
      console.log(__filename)
      console.log(path.resolve(__filename, ''))
      console.log(path.resolve('./'))
      console.log(__dirname)
      console.log(path.resolve('../'))
      console.log(path.resolve('.'))
   },
   From: keyMirror({
      BASIC_ARCHIVE_NOW: null,
      NEW_CRAWL_DIALOG: null,
   }),
   EventTypes: keyMirror({
      HAS_VAILD_URI: null,
      GOT_MEMENTO_COUNT: null,
      BUILD_CRAWL_JOB: null,
      BUILT_CRAWL_CONF: null,
      BUILT_CRAWL_JOB: null,
      LAUNCHED_CRAWL_JOB: null,
      HERITRIX_STATUS_UPDATE: null,
      WAYBACK_STATUS_UPDATE: null,
      FETCH_CODE: null,
   }),
   Paths: {
      memgator: path.join(path.resolve(base), 'bundledApps/memgator'),
      archives: path.join(path.resolve(base), 'config/archives.json'),
      heritrix: path.join(path.resolve(base), 'bundledApps/heritrix-3.2.0'),
      heritrixBin: path.join(path.resolve(base), 'bundledApps/heritrix-3.2.0/bin/heritrix'),
      heritrixJob: path.join(path.resolve(base), 'bundledApps/heritrix-3.2.0/jobs'),
      tomcat: path.join(path.resolve(base), 'bundledApps/tomcat'),
      tomcatStart: path.join(path.resolve(base), 'bundledApps/tomcat/bin/startup.sh'),
      tomcatStop: path.join(path.resolve(base), 'bundledApps/tomcat/bin/shutdown.sh'),
      catalina: path.join(path.resolve(base), 'bundledApps/tomcat/bin/catalina.sh'),
      warcs: path.join(path.resolve(base), '/archives'),
      index: path.join(path.resolve(base), '/config/path-index.txt'),
      cdxIndexer: path.join(path.resolve(base), 'bundledApps/tomcat/webapps/bin/cdx-indexer'),
      cdx: path.join(path.resolve(base), 'archiveIndexes'),
      cdxTemp: path.join(path.resolve(base), 'archiveIndexes/combined_unsorted.cdxt'),
      indexCDX: path.join(path.resolve(base), 'archiveIndexes/index.cdx'),

   },

   Heritrix: {
      uri_heritrix: "https://127.0.0.1:8443",
      username: 'lorem',
      password: 'ipsum',
      jobConf: path.join(path.resolve('./'), 'crawler-beans.cxml'),
      web_ui: "https://lorem:ipsum@localhost:8443",
   },
   Wayback: {
      uri_tomcat: "http://localhost:8080/",
      uri_wayback: "http://localhost:8080/wayback/"
   },
   Code: {
      crawlerBean: path.join(path.resolve('./'), 'crawler-beans.cxml'),
      wayBackConf: path.join(path.resolve('./'), 'bundledApps/tomcat/webapps/ROOT/WEB-INF/wayback.xml'),
      which: keyMirror({
         WBC: null,
         CRAWLBEAN: null,
      }),

   }
}


ipcRenderer.on('gotPath', (event, arg)=> {
   console.log(event, arg)
   console.log('const before', consts)
   consts.Paths = arg.p
   consts.Heritrix = arg.Heritrix
   consts.Code.crawlerBean = arg.Code.crawlerBean
   consts.Code.wayBackConf = arg.Code.wayBackConf
   console.log('const after', consts)
   EditorActions.fetchCode()
})

export default consts