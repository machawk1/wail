import UrlDispatcher from "../dispatchers/url-dispatcher"
import wailConstants from "../constants/wail-constants"
import child_process from "child_process"
import settings from '../settings/settings'

const EventTypes = wailConstants.EventTypes



export function getMementos(url) {
   UrlDispatcher.dispatch({
      type: EventTypes.GET_MEMENTO_COUNT,
      url: url,
   })
}

export function urlUpdated(url) {
   UrlDispatcher.dispatch({
      type: EventTypes.HAS_VAILD_URI,
      url: url
   })
}

export async function askMemgator(url) {
   console.log('askingMemegator')
   child_process.exec(`${settings.get('memgatorQuery')} ${url}`, (err, stdout, stderr) => {
      console.log(err, stdout, stderr)
      let mementoCount = (stdout.match(/memento/g) || []).length
      console.log(mementoCount)
      UrlDispatcher.dispatch({
         type: EventTypes.GOT_MEMENTO_COUNT,
         mementos: mementoCount
      })
   })
}

