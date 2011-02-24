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

    var camera_pos = [0,0,0];
    var camera_dir = [0,1,0];
    var camera_up = [0,0,1];

    function setCameraPos(pos) {
      camera_pos = pos;
    }

    function updateCamera() {
      var camera_matrix = Math3D.mat4x4();
      Math3D.orientMat4x4(camera_matrix, camera_dir, camera_up);
      Math3D.translateMat4x4(camera_matrix, camera_pos);
      World3D.setCamera(camera_matrix);
    }

    var TrenchCamera = {};
    TrenchCamera.setCameraPos = setCameraPos;
    TrenchCamera.updateCamera = updateCamera;
    return TrenchCamera;
  })();

