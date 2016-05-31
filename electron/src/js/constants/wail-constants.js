import keyMirror from 'keymirror'
import path from 'path'


export default {
   EventTypes: keyMirror({
      HAS_VAILD_URI: null,
      GOT_MEMENTO_COUNT: null,
   }),
   Paths: {
      memgator: path.join(path.resolve('../'), 'bundledApps/memgator'),
      archives: path.join(path.resolve('../'), 'config/archives.json'),
      heritrix: path.join(path.resolve('../'), 'bundledApps/heritrix-3.2.0'),
      heritrixBin: path.join(path.resolve('../'), 'bundledApps/heritrix-3.2.0/bin/heritrix'),
      heritrixJob: path.join(path.resolve('../'), 'bundledApps/heritrix-3.2.0/jobs'),
      tomcat: path.join(path.resolve('../'), 'bundledApps/tomcat'),
      tomcatStart: path.join(path.resolve('../'), 'bundledApps/tomcat/bin/startup.sh'),
      tomcatStop: path.join(path.resolve('../'), 'bundledApps/tomcat/bin/shutdown.sh'),
      catalina: path.join(path.resolve('../'), 'bundledApps/tomcat/bin/catalina.sh'),
      warcs: path.join(path.resolve('../'), '/archives')

   },
   Heritrix: {

      username: "lorem",
      password: "ipsum"
        

   },
   Tomcat: {}
}