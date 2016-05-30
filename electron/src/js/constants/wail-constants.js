import keyMirror from 'keymirror'
import path from 'path'


export default {
    EventTypes: keyMirror({
        HAS_VAILD_URI: null,
        GOT_MEMENTO_COUNT:null,
    }),
    Paths: {
        memgator:path.join(path.resolve('../'),'bundledApps/memgator'),
        archives: path.join(path.resolve('../'),'config/archives.json'),
    },
    Commands:{ 
        
    }
}