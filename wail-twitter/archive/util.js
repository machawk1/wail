const _ = require('lodash')

const mapper = it => {
  if (_.isObject(it)) {
    return clonner(_.omitBy(it, _.isFunction), mapper)
  } else {
    return it
  }
}

const wcMapper = (it, key) => {
  if (_.isObject(it)) {
    if (key === 'responseHeaders') {
      return _.mapValues(_.omitBy(it, _.isFunction), v => {
        if (_.isArray(v) && v.length == 1) {
          return v[ 0 ]
        } else {
          return v
        }
      })
    }
    return _.omitBy(it, _.isFunction)
  } else {
    return it
  }
}

const clonner = it => _.mapValues(_.omitBy(it, _.isFunction), mapper)
const cloneWC = it => _.mapValues(_.omitBy(it, _.isFunction), wcMapper)

module.exports = {
  clonner,
  cloneWC
}