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

var GeometryScaling = (function() {

    var block_counter = 0;
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
      block_model = model;
      for (var ii = 0; ii < block_counter; ++ii) {
        World3D.updateStatic(ii, block_model);
      }
    }

    function reset(block_count_x, block_count_y, block_count_z) {
      for (var ii = 0; ii < block_counter; ++ii) {
        World3D.removeStatic(ii);
      }
      block_counter = 0;

      var aspect_ratio = 640 / 480;
      var block_delta_x = 200 / block_count_x;
      var block_delta_y = 100 / block_count_y;
      var block_delta_z = 200 / block_count_z;

      var block_start_x = -block_delta_x * block_count_x / 2 + block_delta_x / 2;
      var block_start_y = 150;
      var block_start_z = -block_delta_z * block_count_z / 2 + block_delta_y / 2;

      block_size = block_delta_x * 0.45;

      for (var iz = 0; iz < block_count_z; ++iz) {
        for (var iy = 0; iy < block_count_y; ++iy) {
          for (var ix = 0; ix < block_count_x; ++ix) {
            var x = block_delta_x * ix + block_start_x;
            var y = block_delta_y * iy + block_start_y;
            var z = block_delta_z * iz + block_start_z;

            placeBlock([x - block_size/2, y - block_size/2, z - block_size/2],
                [x + block_size/2, y + block_size/2, z + block_size/2]);
          }
        }
      }
    }

    function tick(dt) {
    }

    var GeometryScaling = {};
    GeometryScaling.init = init;
    GeometryScaling.reset = reset;
    GeometryScaling.tick = tick;
    return GeometryScaling;
  })();
