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
