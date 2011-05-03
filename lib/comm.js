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

function sendFileNotFound(res, filename, err) {
  console.log('fnf: ' + filename);
   (typeof Log !== 'undefined') && Log.http('404 - ' + filename);
  res.writeHead(404, {'Content-Type': 'text/plain'});
  res.write('404 Not Found: ' + filename + ' (' + err + ')\n');
  res.end();
}

function fullFileName(filename) {
  return process.cwd() + (filename[0] == '/' ? '' : '/') + filename;
}

function expandMetatags(req) {
  var useragent = req.headers['user-agent'];
  if (/iPhone/i.test(useragent)) {
    return '<meta name="viewport" content="user-scalable=no, width=device-width, height=device-height, initial-scale=1.0, maximum-scale=1.0"/>\n' +
      '<meta name="apple-mobile-web-app-capable" content="yes" />\n' +
      '<meta name="apple-touch-fullscreen" content="yes" />\n' +
      '<meta name="apple-mobile-web-app-status-bar-style" content="black" />\n';
  }
  else if (/iPad/i.test(useragent)) {
    return '<meta name="viewport" content="user-scalable=no, width=device-width, height=device-height, initial-scale=1.0, maximum-scale=1.0"/>\n' +
      '<meta name="apple-mobile-web-app-capable" content="yes" />\n' +
      '<meta name="apple-touch-fullscreen" content="yes" />\n' +
      '<meta name="apple-mobile-web-app-status-bar-style" content="black" />\n';
  }
  else if (/iPod/i.test(useragent)) {
    return '<meta name="viewport" content="user-scalable=no, width=device-width, height=device-height, initial-scale=1.0, maximum-scale=1.0"/>\n' +
      '<meta name="apple-mobile-web-app-capable" content="yes" />\n' +
      '<meta name="apple-touch-fullscreen" content="yes" />\n' +
      '<meta name="apple-mobile-web-app-status-bar-style" content="black" />\n';
  }
  else if (/Android/i.test(useragent)) {
    return '<meta name="viewport" content="width=device-width,height=device-height, target-densitydpi=device-dpi, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>\n';
  }
  return '';
}

function getAppInfo(path,fb_app_info) {
  for(var i in fb_app_info) {
    if (fb_app_info[i].id && path.indexOf(i) >= 0) {
      return fb_app_info[i];
    }
  }
  return fb_app_info;
}

var shtml_cache;
function cacheSHTML() {
  shtml_cache = {};
}

function expandSHTML(req, file, filename, options) {
  if (shtml_cache && shtml_cache[filename]) {
    console.log('cached ' + filename);
    return shtml_cache[filename];
  }
  var split = file.split('\n');
  var result = '';
  for(var i in split) {
    var s = split[i];
    var ret = s.match(/\s*#include\s+[\'\"](.*)[\'\"]/);
    if (ret) {
      var name = ret[1];
      var asplit = name.split('$');
      if (asplit.length === 2 && asplit[0] === 'app') {
        var app_info = getAppInfo(filename,options.fb_app_info);
        var aval = app_info && app_info[asplit[1]];
        if (typeof aval !== 'undefined') {
          if (typeof aval === 'string') {
            aval = '"' + aval + '"';
          }
          result += '<script type="text/javascript">var fb_app_' + asplit[1] + '=' + aval + ';</script>';
        }
      } else if (name == 'app_id') {
        var app_info = getAppInfo(filename,options.fb_app_info);
        result += '<script type="text/javascript">var fb_app_id='+(app_info ? app_info.id : 0)+';</script>\n';
      } else {
        name = ret[1];
        var info = options.fb_app_info;
        if (info && info[name]) {
          result += info[name];
        } else {
          try {
            result += fs.readFileSync(fullFileName(name),'binary');
          } catch (e) {
            console.log('fnf: ' + fullFileName(name));
          }
        }
      }
    } else {
      ret = s.match(/\s*#metatags/);
      if (ret) {
        var tmp = expandMetatags(req);
        result += tmp;
      } else {
        result += s+'\n';
      }
    }
  }
  
  var split = result.split('\n');
  result = '';
  for(var i in split) {
    var s = split[i];
    var src = /(src|href)\s*=\s*[\'\"](.*)[\'\"]/;
    var ret = s.match(src);
    if (ret && ret[1]) {
      var t = 0;
      try {
        var statbuf = fs.statSync(fullFileName(ret[2]));
        t = (new Date(statbuf.mtime)).getTime();
      } catch(e) {
      }
      var ret = s.replace(src,ret[1]+'="'+ret[2]+'?'+t+'"');
      if (ret && t) {
        s = ret;
      }
    }
    result += s+'\n';
  }
 // console.log('\n\n' + result + '\n\n');
  if (shtml_cache) {
    shtml_cache[filename] = result;
  }
  return result;
}

var send_delay = 0;
function setDelay(msecs) {
  send_delay = msecs;
  console.log('delay: ' + send_delay);
}

function sendFile(req, res, filename, options) {
  if (send_delay) {
    setTimeout(sendFileNow,send_delay,req, res, filename, options);
  } else {
    sendFileNow(req, res, filename, options);
  }
}

function sendFileNow(req, res, filename, options) {
  options = options || {};
  var fullname = fullFileName(filename);
  fs.readFile(fullname, 'binary', function(err, file) {
    if (err) {
      if (options.cb) {
          options.cb(res, filename);
      } else {
        sendFileNotFound(res, filename, err);
      }
    } else {
      var extension = path.extname(filename);
      var header = {};
      switch (extension) {
        case '.js':
          header['Content-Type'] = 'text/javascript';
          header['Cache-Control'] = 'max-age=31536000'; // 1 year
          break;
        case '.css':
          header['Content-Type'] = 'text/css';
          header['Cache-Control'] = 'max-age=31536000';
          break;
        case '.manifest':
          header['Content-Type'] = 'text/cache-manifest';
          break;
        case '.shtml':
          file = expandSHTML(req, file, filename, options);
          break;
        case '.png':
        case '.jpg':
        case '.jpeg':
        case '.gif':
          header['Cache-Control'] = 'max-age=31536000';
          break;
      }
      if (typeof Log !== 'undefined') {
        Log.http('200 - ' + filename);
      }
      res.writeHead(200, header);
      res.write(file, 'binary');
      res.end();
    }
  });
}

function toClient(user, cmd) {
  user.commands.push(cmd);
}

exports.cacheSHTML = cacheSHTML;
exports.sendFileNotFound = sendFileNotFound;
exports.sendFile = sendFile;
exports.toClient = toClient;
exports.expandSHTML = expandSHTML;
exports.setDelay = setDelay;
