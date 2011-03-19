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

fs = require('fs');
http = require('http');
path = require('path');
url = require('url');
Comm = require('../lib/comm');

var fb_app_info={id:0,secret:0};

function serverCallback(req, res) {
  var parse = url.parse(req.url);
  var pathname = parse.pathname;
  if (pathname.length <= 1) {
    pathname = html_root;
  }
  var split = pathname.split('/');
  Comm.sendFile(req, res, pathname);
};


console.log("starting server");

var listenPort = 8081;
var html_root = '/perf/static.html';

for(var i=0;i<process.argv.length;i++) {
  if (process.argv[i] === '-port' && i+1 < process.argv.length) {
    i++;
    var listenPort = process.argv[i];
  } else if (process.argv[i] === '-html' && i+1 < process.argv.length) {
    i++;
    var html_root = process.argv[i];
  }
}

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
var svr = http.createServer(serverCallback);
svr.listen(listenPort);
