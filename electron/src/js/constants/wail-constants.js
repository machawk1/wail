import keyMirror from 'keymirror'
import path from 'path'

const base = '../'

export default {
   EventTypes: keyMirror({
      HAS_VAILD_URI: null,
      GOT_MEMENTO_COUNT: null,
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
      cdxIndexer: path.join(path.resolve(base), 'bundledApps/tomcat/bin/cdx-indexer'),
      cdx: path.join(path.resolve(base), 'archiveIndexes'),
      cdxTemp: path.join(path.resolve(base), 'archiveIndexes/combined_unsorted.cdxt'),

   },
   Heritrix: {

      username: "lorem",
      password: "ipsum",
      jobConf:  path.join(path.resolve('./'),'crawler-beans.cxml')
        

   },
   Wayback: {
      uri_tomcat: ""
   },
}