const moment = require('moment')
require('moment-round')
require('twix')
moment.fromTwitterDate = function (date) {
  return moment(date, 'dd MMM DD HH:mm:ss ZZ YYYY', 'en')
}
module.exports = moment
