import EventEmitter from "eventemitter3"
import autobind from "autobind-decorator"
import wailConstants from "../constants/wail-constants"

const EventTypes = wailConstants.EventTypes

class jobInfoStore extends EventEmitter {
  constructor () {
    super()
    this.viewing = ''
  }
  

  @autobind
  handleEvent (event) {
    
  }
  

}

const JobInfoStore = new jobInfoStore()

export default JobInfoStore
