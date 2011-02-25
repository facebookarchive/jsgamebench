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

var World3D = (function() {
    var elements = {};

    var matrix_state = {
      view_matrix : Math3D.mat4x4(),
      projection_matrix : Math3D.mat4x4(),
      viewprojection : Math3D.mat4x4()
    };

    function add(id, model, worldmat) {
      elements[id] = {model: model, matrix: worldmat};
    }

    function move(id, worldmat) {
      if (elements[id]) {
        elements[id].matrix = worldmat;
      }
    }

    function setPerspectiveZUp(fovy, aspect, near, far) {
      var t = Math.tan(fovy) * near;
      var r = t * aspect;
      matrix_state.projection_matrix =
        Math3D.perspectiveZUp(-r, r, -t, t, near, far);
      matrix_state.viewprojection =
        Math3D.mulMat4x4(matrix_state.projection_matrix,
                         matrix_state.view_matrix);
    }

    function setCamera(camera_matrix) {
      matrix_state.view_matrix = Math3D.fastInvertMat4x4(camera_matrix);
      matrix_state.viewprojection =
        Math3D.mulMat4x4(matrix_state.projection_matrix,
                         matrix_state.view_matrix);
    }

    function draw(model_context) {
      if (!model_context) {
        return;
      }

      for (var id in elements) {
        var element = elements[id];

        // inject model matrix into matrix state
        matrix_state.modelviewproj =
          Math3D.mulMat4x4(matrix_state.viewprojection, element.matrix);
        matrix_state.model_matrix = element.matrix;

        model_context.drawModel(element.model, -1, matrix_state);
      }
    }

    var World3D = {};
    World3D.add = add;
    World3D.move = move;
    World3D.setPerspectiveZUp = setPerspectiveZUp;
    World3D.setCamera = setCamera;
    World3D.draw = draw;
    return World3D;
  })();
