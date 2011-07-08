#! /usr/bin/env node

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

var options = {
      fb_app_info : {id:0,secret:0}
    };

fs = require('fs');
http = require('http');
path = require('path');
url = require('url');
Comm = require('../lib/comm');

console.log('starting Trench Run server');
fs.readFile('app_secret', 'binary', function(err, data) {
  if (err) {
    console.log('no app_secret file found, so no fb app login')
  } else if (data) {
    var temp = JSON.parse(data);
    // inner copy so exports points to the right object
    for(var i in temp) {
      options.fb_app_info[i] = temp[i];
    }
    console.log('app id: ' + options.fb_app_info.id +
                ' app secret: ' + options.fb_app_info.secret)
  }
});

http.createServer(function(req, res) {
  var parse = url.parse(req.url);
  var pathname = parse.pathname;
  var split = pathname && pathname.split('/');
  if (req.method === 'GET' || req.method === 'POST') {
    switch (split[1]) {
      case 'engine':
      case 'perf':
        Comm.sendFile(req, res, '..' + pathname);
        break;
      case 'models':
      case 'js':
      case 'textures':
        Comm.sendFile(req, res, pathname);
        break;
      case 'channel.html':
        Comm.sendFile(req, res, pathname);
        break;
      default:
        Comm.sendFile(req, res, '/index.shtml', options);
        break;
    }
  }
}).listen(8081);

