if (process.env.NODE_ENV === 'development') {
  module.exports = require('./root.dev.js')
} else {
  module.exports = require('./root.prod.js')
}
