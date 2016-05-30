import UrlDispatcher from '../dispatchers/url-dispatcher'
import wailConstants from '../constants/wail-constants'
import shelljs from 'shelljs'
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
    shelljs.exec(`${Paths.memgator} -a ${Paths.archives} ${url}`,(code,output,err) => {
        console.log(code,output,err)
    })
    
}