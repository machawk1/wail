import EventEmitter from 'eventemitter3'
import UrlDispatcher from '../dispatchers/url-dispatcher'
import wailConstants from '../constants/wail-constants'


const EventTypes = wailConstants.EventTypes;

export default class urlStore extends EventEmitter {
    constructor() {
        super()
        this.url = 'http://matkelly.com/wail'
        this.handleAction = this.handleAction.bind(this)
        UrlDispatcher.register(this.handleAction)
    }

    handleAction(action){
        console.log("Got an action",action);
        switch (action.type){
            case EventTypes.HAS_VAILD_URI: {
                this.url = action.url
                this.emit('url-updated')
                break
            }
                
        }

    }

}

const UrlStore = new urlStore;

export default UrlStore;