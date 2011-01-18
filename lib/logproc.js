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

var perf = [];

function addNewEntry(entry) {
  for (var p = 0, len = perf.length; p < len; p++) {
    if (perf[p].browser == entry.browser) {
      if (perf[p].peak < entry.score) {
        perf[p].peak = parseInt(entry.score);
      }
      var subscores = entry.details;
      for (var rm in subscores) {
        if (perf[p].details[rm] === undefined) {
          perf[p].details[rm] = {};
        }
        for (var sp in subscores[rm]) {
          if (perf[p].details[rm][sp] === undefined) {
            perf[p].details[rm][sp] = {};
          }
          for (var d=0, dlen=subscores[rm][sp].length;d<dlen; d++) {
            if (perf[p].details[rm][sp][subscores[rm][sp][d].path] === undefined) {
              perf[p].details[rm][sp][subscores[rm][sp][d].path] = {count:1, total:subscores[rm][sp][d].score};
            } else {
              perf[p].details[rm][sp][subscores[rm][sp][d].path].count++;
              perf[p].details[rm][sp][subscores[rm][sp][d].path].total += subscores[rm][sp][d].score;
            }
          }
        }
      }

      perf[p].total += parseInt(entry.score);
      perf[p].count++;
      perf.sort(function(a,b) {return b.peak - a.peak;});
      return;
    }
  }
  var nentry = {browser: entry.browser, peak: parseInt(entry.score), total: parseInt(entry.score), count: 1, details:{}};
  var subscores = entry.details;
  for (var rm in subscores) {
    nentry.details[rm] = {};
    for (var sp in subscores[rm]) {
      nentry.details[rm][sp] = {};
      for (var d=0, dlen=subscores[rm][sp].length;d<dlen; d++) {
        nentry.details[rm][sp][subscores[rm][sp][d].path] = {count:1, total:subscores[rm][sp][d].score};
      }
    }
  }

  perf.push(nentry);
  perf.sort(function(a,b) {return b.peak - a.peak;});
}

function proc(line) {
  var tmp = line.match(/.*(guest_\d+) info: (.*)\t([\d\.]+)\t(.*)/);
  if (tmp) {
    var user = tmp[1];
    var browser = tmp[2];
    var score = tmp[3];
    var result = tmp[4];
    addNewEntry({browser: browser, score: score, details: JSON.parse(result)});
  }
}

function start(file, cb) {
  fs.readFile(file, 'utf8', function(error, content) {
      if (error) {
        if (cb)
          cb(null);
      } else {
        content.split('\n').forEach(function(line, index) {
            proc(line);
          });
        if (cb)
          cb(perf);
      }
    });
}

function retPerf(cb) {
  console.log(JSON.stringify(perf));
  cb(perf);
}

exports.start = start;
exports.addNewEntry = addNewEntry;
exports.retPerf = retPerf;
