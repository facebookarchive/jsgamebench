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

var tick_count = 0;
var tick_fps = 50;
var grid_send_rate = 5; // needs to be integer multiple of tick_fps

function tick() {
  tick_count++;
  var send_grid = (tick_count % (tick_fps / grid_send_rate)) == 0;
  var curr_msecs = (new Date).getTime();

  SvrGame.tick();
  for (var i in Users.sessions) {
    var user = Users.sessions[i];
    GridSvr.sendUpdates(user);

    if (send_grid) {
      if (user.commands.length) {
        user.commands.push({cmd: 'clock', args: [curr_msecs, 1000 / grid_send_rate]});
        Socket.sendMessage(user.client, user.message_id, user.commands);
        user.commands = [];
        user.response = 0;
      }
    }
  }
}

var credentials;

exports.init = function(cb, port) {
  var svr = http.createServer(cb);
  svr.listen(port);
  Socket.init(svr);
  setInterval(function() { tick(); }, 1000 / tick_fps);
};

exports.processUserCmds = function(user, message_id, command) {
  SvrCmds.exec(user, command);
};

function fbOAuth(app_id, app_secret, hostname, code_string, cb) {
  var connection = http.createClient(443, 'graph.facebook.com', true);
  connection.addListener('error', function(err) { console.log('err:' + err); });

  if (hostname[hostname.length - 1] != '/') {
    hostname += '/';
  }
  var path = '/oauth/access_token?client_id='
    + app_id + '&redirect_uri=http://' + hostname + 'oauth_redirect&client_secret='
    + app_secret + '&code=' + code_string;
  var request = connection.request('GET', path, {'host' : 'graph.facebook.com'});
  request.end();

  request.on('response', function(response) {
      if (response.statusCode != 200) {
        return cb();
      }
      response.setEncoding('utf8');
      response.on('data', function(chunk) {
          var access_token = chunk.match(/access_token=(.*)/)[1];
          var request = connection.request('GET', '/me/?access_token=' + access_token, {'host' : 'graph.facebook.com'});
          request.end();
          request.on('response', function(response) {
              if (response.statusCode != 200) {
                return cb();
              }
              response.on('data', function(chunk) {
                  var userdata = JSON.parse(chunk);
                  return cb(userdata);
                });
            });
        });
    });
}

function makeCookie(c_name,value,expiredays,path)
{
  var expire_str = '';
  if (expiredays)
    {
      var exdate = new Date();
      exdate.setDate(exdate.getDate() + expiredays);
      expire_str = ';expires=' + exdate.toUTCString();
    }
  return c_name + '=' + escape(value) + expire_str + ';path=' + path;
}

var fb_users = {};

function userId(user,id) {
  var fb = fb_users[id];
  if (!fb) {
    console.log('cant find fb userdata for id: ' + id);
    return;
  }
  user.name = fb.first_name;
  console.log('logged in user: ' + user.name);
}
exports.userId = userId;

function handleOAuth(req,res) {
  var parse = url.parse(req.url, true);
  var app_id = 0;
  var app_secret = '';
  var site_url = req.headers.host + '/game/';
  fbOAuth(app_id, app_secret, site_url, parse.query.code, function(userdata) {
      if (userdata) {
        console.log('userdata: ' + JSON.stringify(userdata));
        var id = userdata.id;
        userdata.fb_oauth = parse.query.code;
        fb_users[id] = userdata;
        var redir = 'http://' + site_url;
        var id = makeCookie('id', id, 20, '/');
    	res.writeHead(302, { 'Location': redir, 'Set-Cookie': [id], 'Content-Type': 'text/plain' });
      }
      else {
        console.log('no userdata');
        var redir = 'http://' + site_url;
        res.writeHead(302, {'Content-Type': 'text/plain', 'Location': redir});
      }
      res.write('Redirecting to ' + redir);
      res.end();
    });
}

exports.serverCallback = function(req, res) {
  if (req.method == 'POST') {
    console.log(req.method + ': ' + req.url);
    console.log('headers: ' + JSON.stringify(req.headers));
    console.log('body: ' + JSON.stringify(req.body));
  }
  var parse = url.parse(req.url);
  var pathname = parse.pathname;
  var split = pathname.split('/');
  if (req.method === 'GET' || req.method === 'POST') {
    switch (split[1]) {
      case 'public':
        Comm.sendFile(res, pathname);
        break;
      case 'images':
        Comm.sendFile(res, pathname, 1);
        break;
      case 'game':
        if (split[2] == 'oauth_redirect') {
          handleOAuth(req, res);
        } else {
          Comm.sendFile(res, '/public/index.html');
        }
        break;
      default:
        var useragent = req.headers['user-agent'];
        if (/iPhone/.test(useragent)) {
          Comm.sendFile(res, '/public/index.html');
        }
        else if (/iPad/.test(useragent)) {
          Comm.sendFile(res, '/public/index.html');
        }
        else if (/iPod/.test(useragent)) {
          Comm.sendFile(res, '/public/index.html');
        }
        else if (/Android/.test(useragent)) {
          Comm.sendFile(res, '/public/index.html');
        } else {
          Comm.sendFile(res, '/public/index.html');
        }
        break;
    }
  }
};
