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

var Tick = (function() {
    var Tick = {};
    Tick.frames = 0;
    Tick.slowframe = 0
    var lastfps = 1;
    var timeac = 0;

    function tick() {
      Tick.frames++;
      Tick.last = Tick.current;
      Tick.current = (new Date).getTime();
      Tick.delta = Tick.current - Tick.last;
      if (Tick.delta > 250)
        Tick.slowframe = true;
      else
        Tick.slowframe = false;
      if (Tick.frames % 10 == 0) {
        lastfps = parseInt(10000 / timeac);
        timeac = 0;
      } else {
        timeac += Tick.delta;
      }
      if (!GameFrame.settings.hidefps) {
        if (typeof(Benchmark) !== 'undefined' && Benchmark !== undefined && Benchmark.name) {
          var name = Benchmark.name;
          UI.addHTML(null, 'fps', {uiclass: 'testype ui_html', pos: [5, 55], resetlast: true, markup: 'fps: ' + lastfps + '<br />' +
                name.render_mode + ':' + name.sprites + ':' + name.render_path + '<br />' +
                Browser.winsize[0] + 'x' + Browser.winsize[1] + '<br />' +
                GameFrame.getViewport().dstyle.width + 'x' + GameFrame.getViewport().dstyle.height + '<br />' +
                Benchmark.count()});
        } else {
          UI.addHTML(null, 'fps', {uiclass: 'testype ui_html', pos: [5, 55], resetlast: true, markup: 'fps: ' + lastfps + '<br />' +
                Browser.winsize[0] + 'x' + Browser.winsize[1]});
        }
      }
    }

    function fps() {
      return lastfps;
    }

    function reset() {
      lastfps = 0;
      Tick.frames = 0;
      Tick.start = Tick.current = (new Date).getTime();
    }

    Tick.delta = 0;
    Tick.start = Tick.current = (new Date).getTime();
    Tick.last = Tick.current - Tick.delta;

    Tick.fps = fps;
    Tick.tick = tick;
    Tick.reset = reset;
    return Tick;
  })();
