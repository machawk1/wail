import ServiceStats from '../records/serviceStatus'
import { ServiceEvents } from '../constants/wail-constants'

const {HERITRIX_STATUS_UPDATE, WAYBACK_STATUS_UPDATE, WAYBACK_RESTART} = ServiceEvents

const serviceStatuses = (state = new ServiceStats(), action) => {
  switch (action.type) {
    case HERITRIX_STATUS_UPDATE:
      return state.updateHeritrix(action.status)
    case WAYBACK_STATUS_UPDATE:
      return state.updateWayback(action.status)
    case WAYBACK_RESTART:
      return state.waybackRestarting()
    default:
      return state
  }
}

export default serviceStatuses
