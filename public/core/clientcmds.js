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

var ClientCmd = (function() {
    function resetSession() {
      client_user.unique_id = 0;
    }

    function startSession(id, app_id) {
      client_user.unique_id = id;
      client_user.app_id = app_id;
      Init.reset();
    }

    function clientTest(a, b) {
//      console.log('clienttest: ' + [a, b]);
    }

    function disconnected(id) {
//      console.log('disconnected: ' + id);
    }

    function add(idx,obj) {
      GridClient.recvAdd(client_user.grids[idx], obj);
    }

    function remove(idx,uuid,timestamp) {
      GridClient.recvRemove(client_user.grids[idx], uuid, timestamp);
    }

    function transform(idx, uuid, options) {
      GridClient.recvTransform(client_user.grids[idx], uuid, options);
    }

    var last_clock;
    function clock(curr_msecs, frame_msecs) {
      clock = parseInt(curr_msecs);
      GridClient.params.clock_skew = clock - (new Date).getTime();
      GridClient.params.frame_msecs = parseInt(frame_msecs);
      Grid.setClockSkew(GridClient.params.clock_skew);
      if (last_clock) {
        var push_latency = clock - last_clock;
      }
      last_clock = clock;
    }

    function logPerf(browser, result) {
      Xhr.toServer({cmd: 'logperf', args: [browser, result]});
    }

    function perfQuery(query) {
      Xhr.toServer({cmd: 'perfquery', args: [query]});
    }

    function startPerfTest() {
      PerfTest.init();
      PerfTest.doAll();
    }

    function stopPerfTest() {
      PerfTest.stop();
    }

    function hideDetails() {
      UI.del('details');
      UI.del('glossary');
    }

    function showDetails(data) {
      UI.del('details');
      UI.del('glossary');
      UI.addCollection('perf', 'details', {uiclass: 'perfblock', pos: [265, 0], width: 1000, height: 4000, command: {cmd:'hidedetails', args:[]}});

      var param_on_scores = {};
      var param_off_scores = {};
      var subscores = data.details;
      var stats = '';
      for (var rm in subscores) {
        for (var sp in subscores[rm]) {
          switch(rm) {
            case 'canvas':
              stats += '&lt;canvas&gt;';
              break;
            case 'html':
              stats += '&lt;div&gt;'
              break;
            case 'webgl':
              stats += 'webgl';
              break;
          }
          stats += ' ' + (sp == 'aa' ? 'axis-aligned images' : 'rotated images') + '<br />';

          var sorted = [];
          for (var s in  subscores[rm][sp]) {
            sorted.push({path:s, score:parseInt(subscores[rm][sp][s].total/subscores[rm][sp][s].count)});
          }

          sorted.sort(function(a,b) {return b.score - a.score;});

          var max = sorted[0].score;

          for (var i=0,len=sorted.length;i<len;i++) {
            var s = sorted[i].path;
            var sub = s.split(/[\: ]/);
            var percent_penalty = parseInt((max-sorted[i].score)/max*100);
            stats += (s == 0 ? '<b>' : '') + sorted[i].score + ' (-'+percent_penalty+'\%) ';

            for (var det = 0, dlen = sub.length-1; det < dlen; det += 2) {
              if (sub[det + 1] == 'true') {
                if (param_on_scores[sub[det]]) {
                  param_on_scores[sub[det]].total += percent_penalty;
                  param_on_scores[sub[det]].count += 1;
                } else {
                  param_on_scores[sub[det]] = {total:percent_penalty,count:1};
                }
              } else {
                if (param_off_scores[sub[det]]) {
                  param_off_scores[sub[det]].total += percent_penalty;
                  param_off_scores[sub[det]].count += 1;
                } else {
                  param_off_scores[sub[det]] = {total:percent_penalty,count:1};
                }
              }
              switch (sub[det]) {
                case 'canvas_background':
                  if (sub[det + 1] == 'true') {
                    stats += 'sprites drawn with ctx.drawImage in &lt;canvas&gt; over a &lt;canvas&gt; background ';
                  } else {
                    stats += 'sprites drawn with ctx.drawImage in &lt;canvas&gt; over a &lt;div&gt; background ';
                  }
                  break;
                case 'update_existing':
                  if (sub[det + 1] == 'true') {
                    stats += 'dom update ';
                  } else {
                    stats += 'innerHTML ';
                  }
                  break;
                case 'use_div_background':
                  if (sub[det + 1] == 'true') {
                     stats += 'div with background  ';
                  } else {
                    stats += 'div masking img ';
                  }
                  break;
                case 'css_transitions':
                  if (sub[det + 1] == 'true') {
                    stats += 'css transition ';
                  }
                  break;
                case 'sprite_sheets':
                  if (sub[det + 1] == 'true') {
                    stats += 'sprite sheets ';
                  } else {
                    stats += 'individual sprites ';
                  }
                  break;
                case 'int_snap':
                  if (sub[det + 1] == 'true') {
                    stats += 'ints ';
                  }
                  break;
                case 'transform3d':
                  if (sub[det + 1] == 'true') {
                    stats += '3d ';
                  }
                  break;
                case 'css_keyframe':
                  if (sub[det + 1] == 'true') {
                    stats += 'css keyframe ';
                  }
                  break;
              }
            }
            stats += (s == 0 ? '</b>' : '') + '<br />';
          }
          stats += '<br />';
        }
      }
      var b = data.browser;
      var browser = b.match(/(\w+) \d+/);
      if (browser) {
        browser = browser[1];
      } else {
        browser = b;
      }
      UI.addHTML('details', 'dbrowserdet', {pos: [5, 4], uiclass: 'browsername', markup: b});
      var score = 'Max reported score: ' + parseInt(data.peak) + ' sprites';
      UI.addHTML('details', 'dperfscore', {pos: [3, 24], uiclass: 'perfscore', markup: score});
      score = parseInt(data.total / data.count);
      UI.addHTML('details', 'dperfavescore', {pos: [5, 70], uiclass: 'perfavescore', markup: 'Average reported score: ' + score + ' sprites'});
      stats += '<br />"dom update": update values in dom object when sprites move<br />"innerHTML": rebuild scene each frame when sprites move<br />"div with background": animating sprites are a div element with changing offsets on background image<br />';
      stats += '"div masking img": animating sprites are a div element masking img element<br />"rotate": use css transform property for rotation, left/top for position of sprites<br />"transform": use css transform property for rotation and position of sprites<br />';
      stats += '"css transition": use css transition to rather than updating every frame<br />"sprite sheets": combine animating sprites into sprite sheets<br />';
      stats += '"int": snap sprite positions to integer values<br />"3d": use 3d transforms where possible<br />"css keyframe":use css animation to keyframe sprite animation<br /><br />';

      var deltas = [];
      for (var p in param_on_scores) {
        if (param_off_scores[p])
          deltas.push({param:p,delta:parseInt(param_off_scores[p].total/param_off_scores[p].count - param_on_scores[p].total/param_on_scores[p].count)});
      }
      deltas.sort(function(a,b) {return b.delta - a.delta;});

      stats += 'impact of turning off <br />';

      for (p=0;p<deltas.length;p++) {
        stats += deltas[p].param + ':' + deltas[p].delta+'\%<br />';
      }

      UI.addHTML('details', 'detailinfo', {pos: [5, 105], uiclass: 'renderdetails', markup: stats});
    }

    function perfResponse(data) {
      UI.del('fps');
      UI.del('perf');
      UI.addCollection('', 'buttons', {pos: [0, 0]});
      UI.addButton('buttons', 'perftest', {pos: [5, 5], width: 95, height: 20, text: 'Start Test', command: {cmd: 'startperftest', args: []}});
      UI.addButton('buttons', 'scrollableddemo', {pos: [110, 5], width: 95, height: 20, text: 'Scroll Demo', command: {cmd: 'scrolldemo', args: []}});
      UI.addButton('buttons', 'htmldemo', {pos: [215, 5], width: 95, height: 20, text: 'HTML Demo', command: {cmd: 'htmldemo', args: []}});
      UI.addButton('buttons', 'canvasdemo', {pos: [320, 5], width: 95, height: 20, text: 'Canvas Demo', command: {cmd: 'canvasdemo', args: []}});
      UI.addButton('buttons', 'webgldemo', {pos: [425, 5], width: 95, height: 20, text: 'WebGL Demo', command: {cmd: 'webgldemo', args: []}});
      UI.addButton('buttons', 'idemo', {pos: [530, 5], width: 95, height: 20, text: 'iPhone Demo', command: {cmd: 'idemo', args: []}});
      UI.addButton('buttons', 'rotdemo', {pos: [635, 5], width: 95, height: 20, text: 'Rotate Demo', command: {cmd: 'rotdemo', args: []}});
      UI.addCollection(null, 'perf', {pos: [100, 50], width: 260});
      if (JSGlobal.myscore) {
        UI.addHTML('perf', 'myscore', {pos: [350, 10], width:1000,uiclass: 'perfscore', markup: "Your score is " + JSGlobal.myscore + " sprites!"});
      }
      if (data) {
        for (var i = 0, len = data.length; i < len; i++) {
          UI.addCollection('perf', 'perfblock' + i, {uiclass: 'perfblock', pos: [0, 82 * i], height: 78, width: 260, command: {cmd:'showdetails', args:[data[i]]}});
          var b = data[i].browser;
          var browser = b.match(/(\w+) \d+/);
          if (browser) {
            browser = browser[1];
          } else {
            browser = b;
          }
          UI.addHTML('perfblock' + i, 'browserdet' + i, {pos: [5, 4], uiclass: 'browsername', markup: b});
          var score = parseInt(data[i].peak);
          UI.addHTML('perfblock' + i, 'perfscore' + i, {pos: [5, 24], uiclass: 'perfscore', markup: score});
        }
      }
    }

    function canvasDemo() {
      UI.del('buttons');
      UI.del('perf');
      PerfTest.addTest(
        {
          viewport: 'fluid_width',
          settings:
          {
            render_mode: GameFrame.CANVAS_ONLY,
            sprite_sheets: false, int_snap: true,
            canvas_background: false
          },
          tfps: 30, background: 'world', sprites: 'aa', demo: true
        });
      PerfTest.doAll();
    }

    function htmlDemo() {
      UI.del('buttons');
      UI.del('perf');
      PerfTest.addTest(
        {
          viewport: 'fluid_width',
          settings:
          {
            render_mode: GameFrame.HTML_ONLY,
            sprite_sheets: false, int_snap: true,
            update_existing: true, use_div_background: true,
            css_transitions: false, css_keyframe: false, transform3d: false
          },
          tfps: 30, background: 'world', sprites: 'aa', demo: true
        });
      PerfTest.doAll();
    }

    function webglDemo() {
      UI.del('buttons');
      UI.del('perf');
      PerfTest.addTest(
        {
          viewport: 'fluid_width',
          settings:
          {
              render_mode: GameFrame.WEBGL,
              sprite_sheets: true, int_snap: false,
              webgl_debug: false, webgl_blended_canvas: false
          },
          tfps: 30, background: 'world', sprites: 'rot', demo: true
        });
      PerfTest.doAll();
    }

    function iDemo() {
      UI.del('buttons');
      UI.del('perf');
      PerfTest.addTest({viewport: 'fluid_width', settings: {render_mode: GameFrame.HTML_ONLY, sprite_sheets: true, transform3d:true}, tfps: 20, background: 'world', sprites: 'igob', demo: true });
      PerfTest.doAll();
    }

    function rotDemo() {
      UI.del('buttons');
      UI.del('perf');
      PerfTest.addTest({viewport: 'fluid_width', settings: {render_mode: GameFrame.HTML_ONLY, update_existing: false, use_div_background: false, rotate_only: false, css_transitions: false, sprite_sheets: true}, tfps: 30, background: 'world', sprites: 'rot', demo: true });
      PerfTest.doAll();
    }

    function scrollDemo() {
      UI.del('buttons');
      UI.del('perf');
      if (JSGlobal.os == "Android") {
        UI.addScroll('', 'scroll', {pos: [0,82], width: 640, height: 350, sheight: 110, x: 10, y: 200});
      } else {
        UI.addScroll('', 'scroll', {pos: [0,82], width: 640, height: 700, sheight: 110, x: 10, y: 200});
      }
    }

    function playGame() {
      UI.del('buttons');
      UI.del('perf');

      Game.init({viewport: 'fluid', settings: {render_mode: GameFrame.CANVAS_ONLY, canvas_background: false}, tfps: 30, background: 'world', sprites: 'cute', demo: true, hack: true });

      PerfTest.doAll();
    }

    function playGameHTML() {
      UI.del('buttons');
      UI.del('perf');

      Game.init({viewport: 'fluid_width', settings: {render_mode: GameFrame.HTML_ONLY, update_existing: true, use_div_background: true, css_transitions: false, css_keyframe: false, sprite_sheets: true, int_snap: true, transform3d:true}, tfps: 30, background: 'world', sprites: 'cute', demo: true, hack: true });

      PerfTest.doAll();
    }

    var client_cmds = {};

    var ClientCmd = {};

    function install(name, func) {
      client_cmds[name] = {func: func};
      ClientCmd[name] = function() {
        var command = {cmd: name, args: Array.prototype.slice.call(arguments)};
        var ret = Utils.cmd_exec(client_cmds, null, command, true);
        if (ret)
          return ret;
      }
    }

    install('resetsession', resetSession);
    install('startsession', startSession);
    install('clienttest', clientTest);
    install('disconnected', disconnected);
    install('add', add);
    install('remove', remove);
    install('transform', transform);
    install('logperf', logPerf);
    install('startperftest', startPerfTest);
    install('perfresp', perfResponse);
    install('perfquery', perfQuery);
    install('stopperftest', stopPerfTest);
    install('canvasdemo', canvasDemo);
    install('webgldemo', webglDemo);
    install('htmldemo', htmlDemo);
    install('idemo', iDemo);
    install('rotdemo', rotDemo);
    install('scrolldemo', scrollDemo);
    install('playgame', playGame);
    install('playgamehtml', playGameHTML);
    install('clock', clock);
    install('showdetails', showDetails);
    install('hidedetails', hideDetails);

    function exec(cmd) {
      //console.log("clientcmd: " + JSON.stringify(str));
      var err = Utils.cmd_exec(client_cmds, null, cmd, false);
      if (err)
        {
          console.log(err.args[0]);
        }
    }

    ClientCmd.exec = exec;
    ClientCmd.install = install;
    return ClientCmd;
  })();
