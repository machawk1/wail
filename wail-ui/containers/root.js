if (process.env.NODE_ENV === 'development') {
  module.exports = require('./root.dev')
} else {
  module.exports = require('./root.prod')
}
