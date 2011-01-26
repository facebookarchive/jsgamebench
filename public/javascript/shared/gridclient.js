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

var GridClient = (function() {
    function add(grid,obj) {
      Grid.add(grid, obj);
      grid.interp[obj.uuid] = { updates: [{extent: obj.extent, date: obj.date}] };
     Xhr.toServer({cmd: 'add', args: [grid.idx, obj]});
    }

    function transform(grid,uuid, options) {
      Grid.transform(grid, uuid, options);
      Xhr.toServer({cmd: 'transform', args: [grid.idx, uuid, options]});
    }

    function remove(grid, uuid) {
      Grid.remove(grid, uuid);
      Xhr.toServer({cmd: 'remove', args: [grid.idx, uuid]});
    }

    function recvAdd(grid, obj) {
        if (grid.interp && obj.extent) {
         grid.interp[obj.uuid] = { updates: [{extent: obj.extent, date: obj.date}] };
       }
       return Grid.add(grid, obj);
    }

    function recvTransform(grid, uuid, options) {
      if (grid.interp && options.extent) {
        grid.interp[uuid].updates.push(options);
      } else {
        return Grid.transform(grid, uuid, options);
      }
    }

    function recvRemove(grid, uuid, timestamp) {
      if (grid.interp && grid.interp[uuid]) {
        grid.interp[uuid].updates.push({remove: true, date: timestamp});
      } else {
        return Grid.remove(grid, uuid);
      }
    }

    var params = {
      clock_skew: 0,
      frame_msecs: 100
    };
    function interpReceived(grid) {
      var curr_time = (new Date).getTime() + params.clock_skew - params.frame_msecs;
      for (var i in grid.interp) {
        var updates = grid.interp[i].updates;
        if (updates.length < 2) {
          continue;
        }
        var curr = updates[0];
        var next = updates[1];
        var interp_update = Utils.clone(next);
        var ratio = (curr_time - curr.date) / (next.date - curr.date);
        if (next.extent) {
          ratio = Math.min(1, ratio);
          var curr_pos = [];
          if (!curr.extent) {
            console.log('blarg')
          }
          curr_pos[0] = curr.extent[0][0] * (1 - ratio) + next.extent[0][0] * ratio;
          curr_pos[1] = curr.extent[0][1] * (1 - ratio) + next.extent[0][1] * ratio;
          interp_update.extent[0] = curr_pos;
        }
        Grid.transform(grid, i, interp_update);
        if (ratio >= 1) {
          updates.shift();
          if (next.remove) {
            Grid.remove(grid, i);
            delete grid.interp[i];
          }
        }
      }
    }

    var GridClient = {};
    GridClient.add = add;
    GridClient.remove = remove;
    GridClient.transform = transform;
    GridClient.recvAdd = recvAdd;
    GridClient.recvRemove = recvRemove;
    GridClient.recvTransform = recvTransform;
    GridClient.interpReceived = interpReceived;
    GridClient.params = params;
    return GridClient;
  })();


exports.add = GridClient.add;
exports.remove = GridClient.remove;
exports.transform = GridClient.transform;
