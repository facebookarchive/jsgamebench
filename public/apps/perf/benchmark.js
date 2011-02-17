// Copyright 2004-present Facebook. All Rights Reserved.

// Licensed under the Apache License, Version 2.0 (the "License"); you may
// not use this file except in compliance with the License. You may obtain
// a copy of the License at

//     http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.

var Benchmark = (function() {
    var count = 0;
    var frame = 0;
    var backoff = 0;
    var num = 1;
    var w, h;
    var inc;
    var dec;
    var desc;
    var tid;
    var nodel;
    var targetfps;
    var timenear;
    var testover;
    var slowframes;
    var demo;
    var runtest = false;

    var Benchmark = {};

    function setup(criteria) {
      inc = criteria.inc;
      dec = criteria.dec;
      num = criteria.num || num;
      demo = criteria.demo || null;
      tid = criteria.tid;
      w = criteria.w || JSGlobal.winsize[0];
      h = criteria.h || JSGlobal.winsize[1];
      nodel = criteria.nodel;
      count = 0;
      frame = 0;
      backoff = 0;
      slowframes = 0;
      targetfps = criteria.tfps ? criteria.tfps : 30;
      runtest = true;
      Benchmark.name = tid;
    }

    function tick() {
      if (runtest && inc && dec && (frame++ > 10)) {
        frame = 0;
        var fps = Tick.fps();
        if (Tick.slowframe) {
          slowframes++;
          if (!demo && slowframes == 5) {
            PerfTest.done(tid, 0);
          }
          for (var i = 0; i < num; i++) {
            if (count > 1)
              dec(--count);
          }
          if (num > 1)
            num--;
          else
            backoff++;
        } else {
          if (!count || (fps >= targetfps)) {
            for (var i = 0; i < num; i++) {
              inc(count++, w, h);
            }
          } else if (fps < targetfps) {
            if (!demo && backoff > 30) {
              runtest = false;
              PerfTest.done(tid, count);
            } else {
              if (!nodel) {
                for (var i = 0; i < num; i++) {
                  if (count > 1)
                    dec(--count);
                }
                if (num > 1)
                  num--;
                else
                  backoff++;
              }
            }
          }
        }
      }
    }

    function getCurrentCount() {
      return count;
    }

    function reset() {
      Benchmark.name = null;
      runtest = false;
    }

    Benchmark.reset = reset;
    Benchmark.tick = tick;
    Benchmark.setup = setup;
    Benchmark.count = getCurrentCount;
    return Benchmark;
  })();
