FB.provide('FramerateMonitor', {
  counters: {},
  timeAcc: {},

  precision: 10,// 1/10 of second


  startFrame: function() {
    this.startTime = (new Date()).getTime();
  },


  endFrame: function() {
    return;
    var interval = 1000 / this.precision;
    var curTime = (new Date()).getTime();
    var elapsedTime = curTime - this.startTime;
    var key = Math.round(curTime/ interval) * interval;
    var update = false;
    if (this.counters[key] === undefined) {
      this.counters[key] = 1;
      this.timeAcc[key] = elapsedTime;
      update = true;
    } else {
      this.counters[key]++;
      this.timeAcc[key] += elapsedTime;
    }

    if (update) {
      var frameRate = this.getFrameRate();
      FB.$('frame_rate').innerText = 'fps=' + frameRate.count + ',jst=' + frameRate.timeAcc + ',jpf=' +
        Math.round(frameRate.timeAcc / frameRate.count);
    }
  },

  getFrameRate: function() {
    var curTime = (new Date()).getTime();
    var frameRate = 0;
    var timeAcc = 0;
    for (time in this.counters) {
      if (time < curTime - 1000) {
        delete this.counters[time];
        delete this.timeAcc[time];
      } else {
        frameRate += this.counters[time];
        timeAcc += this.timeAcc[time];
      }
    }
    return {count: frameRate, timeAcc: timeAcc};
  }
});