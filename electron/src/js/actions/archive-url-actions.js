import UrlDispatcher from '../dispatchers/url-dispatcher'
import wailConstants from '../constants/wail-constants'

const EventTypes = wailConstants.EventTypes;

export function urlUpdated(url) {
    UrlDispatcher.dispatch({
        type: EventTypes.HAS_VAILD_URI,
        url: url
    })
}