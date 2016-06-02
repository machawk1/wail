import UrlDispatcher from '../dispatchers/url-dispatcher'
import wailConstants from '../constants/wail-constants'
import child_process from 'child_process'
import UrlStore from '../stores/urlStore'

const EventTypes = wailConstants.EventTypes
const Paths = wailConstants.Paths


export function urlUpdated(url) {
    UrlDispatcher.dispatch({
        type: EventTypes.HAS_VAILD_URI,
        url: url
    })
}

export async function askMemgator(url) {
    console.log('askingMemegator')
    child_process.exec(`${Paths.memgator} -a ${Paths.archives} ${url}`, (err, stdout, stderr) => {
        console.log(err, stdout, stderr)
        console.log((stdout.match(/memento/g) || []).length)
        UrlDispatcher.dispatch({
            type: EventTypes.GOT_MEMENTO_COUNT,
            mementos: url
        })
    })
    
}

