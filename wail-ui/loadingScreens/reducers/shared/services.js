import { SSRecord } from '../../records'
import { SERVICES } from '../../constants'

const {
  HERITRIX_STARTED,
  HERITRIX_STARTED_ERROR,
  WAYBACK_STARTED,
  WAYBACK_STARTED_ERROR
} = SERVICES

const services = (state = new SSRecord(), action) => {
  switch (action.type) {
    case HERITRIX_STARTED:
      return state.heritrixStarted()
    case HERITRIX_STARTED_ERROR:
      return state.heritrixStartedError(action.errorReport)
    case WAYBACK_STARTED:
      return state.waybackStarted()
    case WAYBACK_STARTED_ERROR:
      return state.waybackStartedError(action.errorReport)
    default:
      return state
  }
}

export default services
