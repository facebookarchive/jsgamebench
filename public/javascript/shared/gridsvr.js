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

function findUpdates(user, grid, pos, size) {
  var cmds = [];
  var sent = user.grid_caches[grid.idx];
  Grid.walkCells(grid, pos, size, function(cell, x, y) {
    var cell_name = x + '_' + y;
    if (sent.cell_versions[cell_name] >= cell.version) {
      return;
    }
    sent.cell_versions[cell_name] = cell.version;
    var entries = cell.entries;
    for (var i = 0; i < entries.length; i++) {
      var cmd_name = 'transform';
      var obj = entries[i];
      var track = sent.obj_trackers[obj.uuid];
      if (!track) {
        var uuid = obj.uuid;
        track = {};
        track.obj = Grid.findById(grid, uuid);
        if (!track.obj) {
          console.log('cant find: ' + uuid);
        }
        sent.obj_trackers[uuid] = track;
        cmd_name = 'add';
      }
      if (track.version >= obj.version) {
        continue;
      }
      if (cmd_name == 'add') {
        cmds.push({version: obj.version, cmd: cmd_name, uuid: obj.uuid,
          args: [grid.idx, Utils.clone(obj)]});
        } else {
          var options = {};
          var field_versions = grid.field_versions[obj.uuid];
          for(var j in field_versions) {
            if (field_versions[j] > track.version) {
              options[j] = obj[j];
            }
          }
          cmds.push({version: obj.version, cmd: cmd_name, uuid: obj.uuid,
            args: [grid.idx, obj.uuid, Utils.clone(options)]});
          }
          track.version = obj.version;
        }
      });
      for (var i in sent.obj_trackers) {
        var track = sent.obj_trackers[i];
        if (track.version != track.obj.version) {
          var obj = track.obj;
          cmds.push({version: obj.version, cmd: 'remove', uuid: obj.uuid,
          args: [grid.idx, obj.uuid, obj.date]});
          delete sent.obj_trackers[i];
        }
      }
      return cmds;
    }

function sendUpdates(user) {
  for (var i = 0; i < user.grids.length; i++) {
    var cmds = findUpdates(user, user.grids[i], user.view_pos, user.view_size);
    if (cmds && cmds.length) {
      user.commands = user.commands.concat(cmds);
    }
  }
}

function updateTracker(user, idx, obj) {
  if (!obj || !obj.uuid) {
    return;
  }
  var sent = user.grid_caches[idx];
  sent.obj_trackers[obj.uuid] = { obj: obj, version: obj.version };
}

function add(user, idx, obj) {
  obj = Grid.add(user.grids[idx], obj);
  if (!obj)
    return;
  updateTracker(user, idx, obj);
}

function remove(user, idx, uuid) {
  var obj = Grid.remove(user.grids[idx], uuid);
  updateTracker(user, idx, obj);
}

function transform(user, idx, uuid, options) {
  var obj = Grid.transform(user.grids[idx], uuid, options);
  updateTracker(user, idx, obj);
}

exports.findUpdates = findUpdates;
exports.add = add;
exports.remove = remove;
exports.transform = transform;
exports.sendUpdates = sendUpdates;
