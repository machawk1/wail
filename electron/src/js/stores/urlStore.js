import EventEmitter from 'eventemitter3'
import UrlDispatcher from '../dispatchers/url-dispatcher'
import wailConstants from '../constants/wail-constants'
import * as urlActions from '../actions/archive-url-actions'


const EventTypes = wailConstants.EventTypes;

export default class urlStore extends EventEmitter {
    constructor() {
        super()
        this.urlMemento = {url: '', mementos: 0}
        this.handleEvent = this.handleEvent.bind(this)
        this.getUrl = this.getUrl.bind(this)
        this.getMementoCount = this.getMementoCount.bind(this)

    }

    handleEvent(event) {
        console.log("Got an event", event)
        switch (event.type) {
            case EventTypes.HAS_VAILD_URI:
            {
                if (this.urlMemento.url != event.url) {
                    this.urlMemento.url = event.url
                    urlActions.askMemgator(event.url)
                    this.emit('url-updated')
                }

                break
            }
            case EventTypes.GOT_MEMENTO_COUNT:
            {
                this.urlMemento.mementos = event.mementos
                this.emit('memento-count-updated')
                break
            }

        }

    }

    getUrl() {
        return this.urlMemento.url
    }

    getMementoCount() {
        return this.urlMemento.mementos
    }

}

const UrlStore = new urlStore;
UrlDispatcher.register(UrlStore.handleEvent)
export default UrlStore;