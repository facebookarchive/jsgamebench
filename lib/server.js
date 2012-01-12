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

BenchmarkResults = require('../lib/benchmark.js');

var tick_count = 0;
var tick_fps = 50;
var grid_send_rate = 5; // needs to be integer multiple of tick_fps
var fb_app_info={id:0,secret:0};

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

function init() {
  fs.readFile('app_secret', 'binary', function(err, data) {
    if (err) {
      console.log('no app_secret file found, so no fb app login')
    } else if (data) {
      var temp = JSON.parse(data);
      // inner copy so exports points to the right object
      for(var i in temp) {
        fb_app_info[i] = temp[i];
      }
      console.log('app id: '+fb_app_info.id + ' app secret: ' +fb_app_info.secret)
    }
  });
  setInterval(function() { tick(); }, 1000 / tick_fps);
  BenchmarkResults.init();
}

function listen(port,options,cb) {
  if (options) {
    var svr = https.createServer(options,cb);
  } else {
    var svr = http.createServer(cb);
  }
  Socket.init(svr);
  svr.listen(port);
};

function processUserCmds(user, message_id, command) {
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

function handleOAuth(req,res) {
  var parse = url.parse(req.url, true);
  var site_url = req.headers.host + '/game/';
  fbOAuth(fb_app_info.id,fb_app_info.secret, site_url, parse.query.code, function(userdata) {
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

function redirPage(url) {
  return '<!DOCTYPE html><html><head><script type="text/javascript">'
  + 'window.location.href="' + url +'"'
  + '</script></head></html>';
}

function postHandler(request, callback) {
  var _REQUEST = { };
  var _CONTENT = '';

  if (request.method == 'POST')  {
    request.addListener('data', function(chunk)	{
      _CONTENT+= chunk;
    });

    request.addListener('end', function()	{
      callback(_CONTENT);
    });
  };
};

function serverCallback(req, res) {
  var parse = url.parse(req.url);
  var pathname = parse.pathname || '/';
  var split = pathname.split('/');
  if (req.method == 'POST') {
    console.log(req.method + ': ' + req.url);
    console.log('headers: ' + JSON.stringify(req.headers));
    //console.log('body: ' + JSON.stringify(req.body));
    postHandler(req, function(data) {
      if (data.indexOf('cmd:') == 0) {
        var fb_info = Graph.fbinfo_from_cookie(req.headers.cookie);
        console.log(JSON.stringify(fb_info));
        Graph.handler(fb_info,res,data.substring(5));
      } else if (data.indexOf('signed_request') == 0) {
      } else {
        var result = JSON.parse(data);
        BenchmarkResults.processResult(result.score, req.headers, result.testName);
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end();
        BenchmarkResults.save();
        return;
      }
    });
  } else {
    if (split[1] === 'benchmark_results') {
      res.writeHead(200, {'Content-Type': 'text/html'});
      var returnData = JSON.stringify(BenchmarkResults.getTopResults());
      res.write(returnData);
      res.end();
      return;
    }
  }

  if (0 && req.method === 'POST') {
    console.log('headers: ' + JSON.stringify(req.headers));
    switch(split[1]) {
      case 'game-oauth':
        redirect_url = fb_app_info.url+'/oauth_redirect'
        var auth_url = 'https://graph.facebook.com/oauth/authorize?client_id=' + fb_app_info.id + '&redirect_uri=' + redirect_url +
          '&scope=publish_stream,read_stream,user_about_me';
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(redirPage(auth_url), 'binary');
        res.end();
    }
  }
  else if (req.method === 'GET' || req.method === 'POST') {
    var name = split[split.length-1];
    if (!name.length  && split.length > 1) {
      name = split[split.length-2];
    }
    if (!name.length || name == 'index.html') {
      name = 'perf';
    }
    if (name.indexOf('.') < 0) {
      Comm.sendFile(req, res, '/'+name+'/index.shtml', {fb_app_info: fb_app_info});
    } else {
      Comm.sendFile(req, res, pathname);
    }
  }
};

exports.init = init;
exports.listen = listen;
exports.userId = userId;
exports.processUserCmds = processUserCmds;
exports.serverCallback = serverCallback;
exports.fb_app_info = fb_app_info;

