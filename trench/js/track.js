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

var TrenchTrack = (function() {

    var block_counter;
    var block_model;

    function placeBlock(vmin, vmax) {
      var worldmat = Math3D.mat4x4();
      worldmat[0]  = vmax[0] - vmin[0];
      worldmat[5]  = vmax[1] - vmin[1];
      worldmat[10] = vmax[2] - vmin[2];
      worldmat[12] = vmin[0];
      worldmat[13] = vmin[1];
      worldmat[14] = vmin[2];
      World3D.addStatic(block_counter, block_model, worldmat, vmin, vmax);
      ++block_counter;
    }

    function init(model) {
      block_counter = 0;
      block_model = model;

      placeBlock([-10,-50,-5], [10,250,-4]);
      placeBlock([-10,-50,-4], [-8,250,10]);
      placeBlock([8,-50,-4], [10,250,10]);

      // obstacles
      for (var ii = 2; ii < 12; ++ii) {
        var t = Math.floor(Math.random() * 3);
        if (t === 0) {
          var r = Math.random() * 10 - 5;
          placeBlock([r-1,ii*20-1,-4], [r+1,ii*20+1,5]);
        } else if (t === 1) {
          var r = Math.random() * 5 - 2;
          placeBlock([-8,ii*20-1,r-1], [5,ii*20+1,r+1]);
        } else {
          var r = Math.random() * 5 - 2;
          placeBlock([-5,ii*20-1,r-1], [8,ii*20+1,r+1]);
        }
      }
    }

    function tick(dt) {
    }

    var TrenchTrack = {};
    TrenchTrack.init = init;
    TrenchTrack.tick = tick;
    return TrenchTrack;
  })();
