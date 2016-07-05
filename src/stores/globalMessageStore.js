import EventEmitter from "eventemitter3"
import GMessageDispatcher from "../dispatchers/globalMessageDispatcher"


class globalMessageStore extends EventEmitter {
  constructor(){
    super()
    this.messageQ = []
  }

  


}

const GMessageStore = new globalMessageStore()
GMessageDispatcher.register(GMessageStore.handleEvent)
export default GMessageStore
