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
    install('clock', clock);

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

var Cmds = ClientCmd;
