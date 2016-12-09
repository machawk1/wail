(function () {
  var moment = (typeof require !== 'undefined' && require !== null) && !require.amd ? require('moment') : this.moment

  moment.fromTwitterDate = function (date) {
    return moment(date, 'dd MMM DD HH:mm:ss ZZ YYYY')
  }

  if ((typeof module !== 'undefined' && module !== null ? module.exports : void 0) != null) {
    module.exports = moment
  }
}).call(this)
