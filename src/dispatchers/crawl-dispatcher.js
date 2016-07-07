import { Dispatcher } from 'flux'

//use of a variable here allows us to attach our dispatchers to the window
//if desired
const CrawlDispatcher = new Dispatcher()
CrawlDispatcher.dispatch()

export default CrawlDispatcher
