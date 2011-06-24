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

var TrenchCamera = (function() {

    var aspect_ratio;
    var fovy = 0.55;
    var nearplane = 0.75;
    var farplane = 1000.0;
    var camera_distance = 6;

    var rotation_distance = 4;
    var rotation_rate = Math.PI * -0.2;
    var rotation = 0;

    function init(viewport) {
      // set up projection matrix, and thus the coordinate system as well
      aspect_ratio = viewport.width / viewport.height;
      World3D.setPerspectiveZUp(fovy,
                                aspect_ratio,
                                nearplane,
                                farplane);
    }

    function reset() {
      var camera_matrix = Math3D.mat4x4();
      World3D.setCamera(camera_matrix);
    }

    function tick(dt, paused) {
      var camera_pos = [0,0,0];
      var camera_dir = [0,1,0];
      var camera_up = [0,0,1];

      camera_up[2] = -Math.sin(rotation);
      camera_up[0] = Math.cos(rotation);
      rotation += dt * rotation_rate;
      while (rotation > 2 * Math.PI) {
        rotation -= 2 * Math.PI;
      }

      var camera_matrix = Math3D.mat4x4();
      Math3D.orientMat4x4(camera_matrix, camera_dir, camera_up);
      Math3D.translateMat4x4(camera_matrix, camera_pos);
      World3D.setCamera(camera_matrix);
    }

    var TrenchCamera = {};
    TrenchCamera.init = init;
    TrenchCamera.reset = reset;
    TrenchCamera.tick = tick;
    return TrenchCamera;
  })();

