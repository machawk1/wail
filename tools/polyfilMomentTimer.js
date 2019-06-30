if (typeof moment === "undefined" && require) {
  moment = require('moment');
}

(function (moment) {

  function Timer(duration, attributes, callback) {
    this.timerDuration = duration;
    this.callback = callback;
    this.loop = attributes.loop;
    this.started = false;
    this.stopped = false;       // If stop() is called this variable will be used to finish the paused duration once it's started again.
    this.timer;
    this.startTick;
    this.endTick;

    if (attributes.start) {
      if (attributes.wait > 0) {
        var self = this;
        setTimeout(function () {
          if (attributes.executeAfterWait) {
            callback();
          }
          self.start();
        }, attributes.wait);
      } else {
        this.start();
      }
    }
  }

  Timer.prototype.start = function () {
    if (!this.started) {

      var self = this;

      // Takes care of restarts. If the timer has been stopped, this will make sure the leftover duration is executed.
      if (this.stopped) {
        setTimeout(function () {
          self.callback();
          return self.start();
        }, this.getRemainingDuration());

        this.stopped = false;
        return true;
      }

      if (this.loop) {
        this.timer = setInterval(function () {
          self.updateStartEndTickFromDuration(self.timerDuration);
          return self.callback();
        }, this.timerDuration);
      } else {
        this.timer = setTimeout(function () {
          self.started = false;
          return self.callback();
        }, this.timerDuration);
      }

      this.updateStartEndTickFromDuration(self.timerDuration);
      this.started = true;

      return true;
    }

    return false;
  }

  Timer.prototype.stop = function () {
    if (this.started) {
      this.clearTimer();
      this.updateStartEndTickFromDuration(this.getRemainingDuration());
      this.started = false;
      this.stopped = true;
      return true;
    }

    return false;
  }

  Timer.prototype.clearTimer = function () {
    if (this.timer) {
      if (this.loop) {
        this.timer = clearInterval(this.timer);
      } else {
        this.timer = clearTimeout(this.timer);
      }

      return true;
    }

    return false;
  }

  Timer.prototype.updateStartEndTickFromDuration = function (duration) {
    this.startTick = Date.now();
    this.endTick = this.startTick + duration;

    return true;
  }

  Timer.prototype.duration = function () {
    if (arguments.length > 0) {
      this.timerDuration = moment.duration(arguments[0], arguments[1]).asMilliseconds();
      this.stop();
      this.start();
      return true;
    }

    return false;
  }

  Timer.prototype.getDuration = function () {
    return this.timerDuration;
  }

  Timer.prototype.getRemainingDuration = function () {
    if (this.startTick && this.endTick) {
      if (this.stopped) {
        return this.endTick - this.startTick;
      } else {
        return this.endTick - Date.now();
      }
    }

    return 0;
  }

  Timer.prototype.isStopped = function () {
    return this.stopped;
  }

  moment.duration.fn.timer = function (attributes, callback) {
    if (typeof attributes === "function") {
      callback = attributes;
      attributes = {
        wait: 0,
        loop: false,
        start: true
      };
    } else if (typeof attributes === "object" && typeof callback === "function") {
      if (attributes.start == null) {
        attributes.start = true;
      }
    } else {
      throw new Error("First argument must be of type function or object.");
    }

    return new Timer(this.asMilliseconds(), attributes, callback);
  };

}(moment));
