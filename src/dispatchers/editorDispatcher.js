import {Dispatcher} from 'flux'

// use of a variable here allows us to attach our dispatchers to the window
// if desired
const EditorDispatcher = new Dispatcher()

export default EditorDispatcher
