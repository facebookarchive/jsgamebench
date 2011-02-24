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

var Utils = (function() {
    function cmd_exec(cmd_list, user, command, null_if_not_found) {
      if (!command || !command.cmd)
        return '';
      var username;
      if (user)
        username = user.name;
      else
        username = 'me';
      var args = [];
      for (var t in command.args) {
        args.push(command.args[t]);
      }

      if (user)
        args.splice(0, 0, user);
      else if (command.user)
        args.splice(0, 0, command.user);

      var cmd = cmd_list[command.cmd];
      if (!cmd) {
        if (null_if_not_found)
          return undefined;
        return {user: username, cmd: 'alert', args: ['command not found:' + command.cmd]};
      }
      if (!cmd.func)
        return {user: username, cmd: 'alert', args: ['command func not found for:' + command.cmd]};
      var func = cmd.func;
      if (cmd.def_params)
        args = cmd.def_params.concat(args);
      if (func.length != args.length)
        return {user: username, cmd: 'alert', args: ['Command ' + command.cmd + ': takes ' + func.length + ' arguments. You gave ' + args.length + ': [' + args + ']']};
      if (cmd.limits) {
        for (var i = 0, len = cmd.limits.length; i < len; i++) {
          if (cmd.limits[i] && args[i].length > cmd.limits[i])
            return {user: username, cmd: 'alert', args: ['Parameter too long. "' + args[i] + '" is ' + args[i].length + ' Chars. Max is ' + cmd.limits[i]]};
        }
      }
      if (cmd.AL) {
        var user_access_level = (user && user.access_level) ? user.access_level : 0;
        if (user_access_level < cmd.AL)
          return {user: username, cmd: 'alert', args: [command.cmd + ': Requires access level ' + cmd.AL + ' you have ' + user_access_level]};
      }
      return func.apply(null, args);
    }

    function show_cmds(cmd_list) {
      var result = '';
      for (var cmdname in cmd_list) {
        var cmd = cmd_list[cmdname];
        result = result + cmdname + ':';
        for (j = 0, len = cmd.func.length; j < len; j++) {
          if (cmd.limits && cmd.limits[j])
            result.concat(' <string[' + cmd.limits[j] + ']>');
          else
            result.concat(' <param>');
        }
        result.concat('\n');
      }
      return result;
    }

    function uuidv4() {
      // xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      // where y == 8,9,A or B
      var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
      return uuid.replace(/[xy]/g, function(c) {
          return (c == 'x' ? Math.floor(Math.random() * 16).toString(16) : Math.floor(Math.random() * 4 + 8).toString(16));
        });
    }

    function clone(obj, skip, keep) {
      var newObj = (obj instanceof Array) ? [] : {};
      for (var i in obj) {
        if (i == 'clone' || (skip && skip[i]))
          continue;
        if (keep && !keep[i])
          continue;
        if (obj[i] && typeof obj[i] == 'object') {
          newObj[i] = clone(obj[i], skip);
        }
        else
          newObj[i] = obj[i];
      }
      return newObj;
    }

    var Utils = {};
    Utils.clone = clone;
    Utils.uuidv4 = uuidv4;
    Utils.cmd_exec = cmd_exec;
    Utils.clone = clone;
    return Utils;
  })();

exports.clone = Utils.clone;
exports.show_cmds = Utils.show_cmds;
exports.cmd_exec = Utils.cmd_exec;
exports.uuidv4 = Utils.uuidv4;
