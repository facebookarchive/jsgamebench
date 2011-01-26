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

var Init = (function() {
    var routed = false;

    function quit() {
      Xhr.toServer({cmd: 'logout', args: []});
    }

    function delatedStart() {
    }

    function timer_kick_off() {
      JSGlobal.TIMERS_LAUNCHED = true;
      Render.setupBrowserSpecific();
      Xhr.init();
      setInterval('Game.tick();', 33);
      setInterval('Init.tick();', 1);
      Xhr.toServer({cmd: '', args: []});
    }

    function tick() {
      Tick.tick();
      if (Sprites.fullyLoaded()) {
        if (!client_user.game_active) {
          Gob.movegobs(Tick.delta);
        }
        Render.tick();
        Benchmark.tick();
      } else {
        Tick.reset();
      }
      UI.tick();
    }

    function reset() {
      var gbel = document.getElementById('gamebody');
      gbel.innerHTML = '';

      GameFrame.setFrame('gamebody', 'gameframe', 'gameframe',
                         {left: JSGlobal.winpos[0],
                             top: JSGlobal.winpos[1],
                             width: JSGlobal.winsize[0],
                             height: JSGlobal.winsize[1],
                             overflow: 'overflow-x:hidden;overflow-y:auto;'},
                         '#fff');

      GameFrame.setViewport('gameframe', 'gameviewport', 'gameviewport',
                         {left: JSGlobal.winpos[0],
                             top: JSGlobal.winpos[1] + 30,
                             width: JSGlobal.winsize[0],
                             height: JSGlobal.winsize[1] - 30},
                            '#fff');

      GameFrame.layout();
      Render.setupBrowserSpecific();
      var path = window.location.pathname;
      if (!routed && path.match(/gamehtml/)) {
        routed = true;
        ClientCmd.playgamehtml();
      } else if (!routed && path.match(/game/)) {
        routed = true;
        ClientCmd.playgame();
      } else {
        Xhr.toServer({cmd: 'perfquery', args: [['browser']]});
      }
    }

    function winresize() {
      var last_width = JSGlobal.winsize[0];
      var last_height = JSGlobal.winsize[1];

      Clientutils.getWindowSize();

      var width = JSGlobal.winsize[0];
      var height = JSGlobal.winsize[1];

      if (last_height == height && last_width == width) {
        return;
      }

      JSGlobal.winpos[0] = 0;
      JSGlobal.winpos[1] = 0;
      JSGlobal.winsize[0] = width;
      JSGlobal.winsize[1] = height;

      if (!JSGlobal.TIMERS_LAUNCHED) {
        timer_kick_off();
      }

      GameFrame.setXbyY();
    }

    var Init = {};
    Init.winresize = winresize;
    Init.quit = quit;
    Init.tick = tick;
    Init.reset = reset;
    return Init;
  })();
