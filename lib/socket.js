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

var socket;

function sendMessage(client, id, cmds) {
  client.send(JSON.stringify({id: id, cmds: cmds}));
}

function handleDataReq(client, message) {
  console.log('got msg: '+message);
  var user = Users.findSession(message.user_id);

  if (!user) {
    if (message.user_id <= 0) {
      user = Users.addSession();
      user.client = client;
      client.user_id = user.id;
      console.log('req_id: ' + message.req_id + ' user_id: ' + user.id);
      sendMessage(client, message.req_id, [{cmd: 'startsession', args: [user.id, Server.fb_app_info.id]}]);
    } else {
      // browser was left running past server restart,
      // or disconnected for some reason, give him new session key
      sendMessage(client, message.req_id, [{cmd: 'resetsession', args: []}]);
    }
    return;
  }
  user.last_recv_time = (new Date).getTime();
  Server.processUserCmds(user, message.req_id, message.cmd);
}

function init2(server) {
  var conn = io.listen(server);
  conn.sockets.on('connection', function (socket) {
    socket.emit('news', { hello: 'world' });
    socket.on('message', function (data) {
      console.log('\n\nmesaage:\n'+data);
    });
  });
}

function init(server) {
  console.log('\nlisten init\n');
  var conn = io.listen(server);
  conn.sockets.on('connection', function(client) {
    console.log('connect');
    client.on('message', function(message) {
        console.log('message '+message);
        try {
          var message = JSON.parse(message.replace('<', '&lt;').replace('>', '&gt;'));
        } catch (SyntaxError) {
          log('Invalid JSON:');
          log(message);
          return false;
        }
        handleDataReq(client, message);
      });

    client.on('disconnect', function() {
      console.log('disconnect');
      Users.removeSession(client.user_id);
    });
  });
}

exports.init = init;
exports.sendMessage = sendMessage;
