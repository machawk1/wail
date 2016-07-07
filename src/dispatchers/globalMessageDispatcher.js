import { Dispatcher } from 'flux'

//use of a variable here allows us to attach our dispatchers to the window
//if desired
const GMessageDispatcher = new Dispatcher()
//noinspection JSAnnotator
window.GMessageDispatcher = GMessageDispatcher

export default GMessageDispatcher
