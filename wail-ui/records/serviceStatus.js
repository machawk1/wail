import { Record } from 'immutable'

export default class ServiceStats extends Record({heritrix: true, wayback: true}) {
  updateHeritrix (update) {
    return this.set('heritrix', update)
  }

  heritrixStatus () {
    return this.get('heritrix') ? 'Running' : 'X'
  }

  updateWayback (update) {
    return this.set('wayback', update)
  }

  waybackRestarting () {
    return this.set('wayback', false)
  }

  waybackStatus () {
    return this.get('wayback') ? 'Running' : 'X'
  }
}