import {notify} from '../actions/redux/notifications'
import wc from '../constants/wail-constants'

const EventTypes = wc.EventTypes

// curried the living daylights out of this
export default store => next => action => {
    if (action.type === EventTypes.CREATE_JOB) {
      let forCol = action.conf.forCol
      let urls = action.conf.urls
      next(notify({
        title: 'Info',
        level: 'info',
        message: `Built Crawl Conf for ${forCol} job: ${urls}`,
        uid: `Built Crawl Conf for ${forCol} job: ${urls}`
      }))
      return next(action)
    }
}