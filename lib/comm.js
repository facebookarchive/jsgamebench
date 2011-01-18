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
  Log.http('404 - ' + filename);
  res.writeHead(404, {'Content-Type': 'text/plain'});
  res.write('404 Not Found: ' + filename + ' (' + err + ')\n');
  res.end();
}

function sendFile(res, filename, cached, cb) {
  fullname = process.cwd() + (filename[0] == '/' ? '' : '/') + filename;
  fs.readFile(fullname, 'binary', function(err, file) {
      if (err) {
        if (cb)
          cb(res, filename);
        else
          sendFileNotFound(res, filename, err);
      } else {
        var extension = path.extname(filename);
        Log.http(filename + ' has extension ' + extension);
        var header = {};
        switch (extension) {
          case '.js':
            header['Content-Type'] = 'text/javascript';
            break;
          case '.css':
            header['Content-Type'] = 'text/css';
            break;
        }
        Log.http('200 - ' + filename);
        if (cached) {
          header['Expires'] = 'Sun, 17 Jan 2038 19:14:07 GMT';
          header['Cache-Control'] = 'max-age=3600';
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

exports.sendFileNotFound = sendFileNotFound;
exports.sendFile = sendFile;
exports.toClient = toClient;
