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

var Perf = (function() {
    function canvasDemo() {
      UI.del('buttons');
      var sprite = 'aahalf';
      var fps = 20;

      PerfTest.addTest(
        {
          viewport: 'tiny',
          settings:
          {
            render_mode: GameFrame.CANVAS_ONLY,
            sprite_sheets: false, int_snap: true,
            canvas_background: false
          },
          tfps: fps, background: 'world', sprites: sprite, demo: true
        });
      PerfTest.doAll();
    }

    function htmlDemo() {
      UI.del('buttons');
      var sprite = 'aahalf';
      var fps = 20;

      PerfTest.addTest(
        {
          viewport: 'tiny',
          settings:
          {
            render_mode: GameFrame.HTML_ONLY,
            sprite_sheets: false, int_snap: true,
            update_existing: true, use_div_background: true,
            css_transitions: false, css_keyframe: false, transform3d: true
          },
          tfps: fps, background: 'world', sprites: sprite, demo: true
        });
      PerfTest.doAll();
    }

    function stopPerfTest() {
      PerfTest.stop();
    }

    function setup() {
      UI.del('fps');
      UI.addCollection('', 'buttons', {pos: [0, 0]});
      UI.addButton('buttons', 'htmldemo', {pos: [10, 10], width: 150, height: 40, text: 'HTML Demo', command: {cmd: 'htmldemo', args: []}});
      UI.addButton('buttons', 'canvasdemo', {pos: [170, 10], width: 150, height: 40, text: 'Canvas Demo', command: {cmd: 'canvasdemo', args: []}});
    }

    function init() {
      GameFrame.settings.offset = 0;
      ClientCmd.install('canvasdemo', canvasDemo);
      ClientCmd.install('htmldemo', htmlDemo);
      ClientCmd.install('htmldemo', htmlDemo);
      ClientCmd.install('stopperftest', stopPerfTest);
      Input.hookEvents('gamebody');
    }

    function teardown() {
      UI.del('fps');
      UI.del('buttons');
      UI.del('stoptest');
    }

    function quit() {
      if (!JSGlobal.mobile) {
        Xhr.toServer({cmd: 'logout', args: []});
      }
    }

    function tick() {
      Gob.movegobs(Tick.delta);
      Benchmark.tick();
    }

    var Perf = {};
    Perf.tick = tick;
    Perf.setup = setup;
    Perf.init = init;
    Perf.teardown = teardown;
    Perf.quit = quit;
    return Perf;
  })();

Init.setFunctions({app: Perf.tick, draw: Render.tick, ui: UI.tick, setup: Perf.setup, init: Perf.init, teardown: Perf.teardown, quit: Perf.quit});

