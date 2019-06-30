const _ = require('lodash')

const headerStringHelper = (s, pair) => {
  if (Array.isArray(pair[1])) {
    return s + pair[1].reduce((ss, val) => ss + `${pair[0]}: ${val}\r\n`, '')
  }
  return s + `${pair[0]}: ${pair[1]}\r\n`
}

const stringifyHeaders = headers => _
  .sortBy(_.toPairs(headers), [0])
  .reduce((s, hpair) => headerStringHelper(s, hpair), '')

const responseHeaderString = (headers, statusLine) => `${statusLine}\r\n${stringifyHeaders(headers)}`

module.exports = responseHeaderString
