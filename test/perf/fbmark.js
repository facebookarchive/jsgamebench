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

var FBmark = (function() {
    var scores = {canvas: {}, html: {}, webgl:{}};

    function reset() {
      scores = {canvas: {}, html: {}, webgl:{}};
    }

    function addScore(settings, score) {
      if (scores[settings.render_mode][settings.sprites]) {
        scores[settings.render_mode][settings.sprites].push({score: score, path: settings.render_path});
        scores[settings.render_mode][settings.sprites].sort(function(a,b) {
            return b.score - a.score;
          });
      } else {
        scores[settings.render_mode][settings.sprites] = [{score: score, path: settings.render_path}];
      }
    }

    function peak() {
      var total = 1;
      var sprites = {};
      for (var sp in scores.canvas) {
        sprites[sp] = 0;
      }
      for (var sp in scores.html) {
        sprites[sp] = 0;
      }
      for (var sp in sprites) {
        if (scores.canvas[sp] && scores.html[sp]) {
          if (scores.canvas[sp][0].score >= scores.html[sp][0].score) {
            total *= scores.canvas[sp][0].score;
          } else {
            total *= scores.html[sp][0].score;
          }
        } else {
          total *= scores.canvas[sp] ? scores.canvas[sp][0].score : scores.html[sp][0].score;
        }
      }
      scores.score = Math.pow(total, 0.5);
      return scores;
    }

    var FBmark = {};
    FBmark.reset = reset;
    FBmark.addScore = addScore;
    FBmark.peak = peak;
    return FBmark;
  })();
