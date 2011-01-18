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

var sessions = {};
var user_count = 0;

function findSession(id) {
  if (sessions[id])
    return sessions[id];
  return 0;
}

function addSession() {
  var user;
  var curdate = new Date();
  var msec = Date.parse(curdate.toGMTString());
  var t = parseInt(Math.random() * 100000000, 10) + (msec % 10000);
  user = sessions[t] = {
    'response': null,
    'req_id': null,
    'commands': [],
    'id': t,
    grid_caches: [],
    view_pos: [0, 0],
    view_size: [1024, 1024],
    idx: user_count,
    grids: SvrGame.grids
  };
  user.time = user.last_recv_time = user.last_send_time = curdate.getTime();
  user.name = 'guest_' + ++user_count;
                       user.grids = SvrGame.grids;

  for (var i = 0; i < user.grids.length; i++) {
    user.grid_caches[i] = { cell_versions: [], obj_trackers: {} };
  }

  return user;
}

function setView(user,pos,size)
{
  user.view_pos = pos;
  user.view_size = size;
  GridSvr.sendUpdates(user);
}

function linkToUser(user,uuid) {
  var grid = user.grids[1];
  Grid.transform(grid, uuid, {user_name: user.name, owner_id: user.id});
  var obj = Grid.findById(grid, uuid);
  if (obj) {
    console.log('set user avatar name to: ' + obj.user_name);
  }
  console.log('linked ' + uuid + ' to ' + user.id);
  user.owned_uuid = uuid;
}

function removeSession(id) {
  var user = sessions[id];
  if (user) {
    if (user.owned_uuid)
      GridSvr.remove(user, 1, user.owned_uuid);
    delete sessions[id];
    console.log('deleted session: ' + id);
    for (var i in sessions)
      Comm.toClient(sessions[i], 'disconnected', id);
  }
}

function logout(user) {
  console.log('logout: ' + user.id);
  removeSession(user.id);
}


exports.linkToUser = linkToUser;
exports.sessions = sessions;
exports.setView = setView;
exports.findSession = findSession;
exports.addSession = addSession;
exports.removeSession = removeSession;
exports.logout = logout;
