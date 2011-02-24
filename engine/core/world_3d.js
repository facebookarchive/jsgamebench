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
    var view = Math3D.mat4x4();
    var projection = Math3D.mat4x4();
    var viewprojection = Math3D.mat4x4();

    function add(id, model, worldmat) {
      elements[id] = {model: model, matrix: worldmat};
    }

    function setPerspective(fovy, aspect, near, far) {
      var t = Math.tan(fovy) * near;
      var r = t * aspect;
      projection = Math3D.perspective(-r, r, -t, t, near, far);
      viewprojection = Math3D.mulMat4x4(projection, view);
    }

    function setCamera(camera_matrix) {
      view = Math3D.fastInvertMat4x4(camera_matrix);
      viewprojection = Math3D.mulMat4x4(projection, view);
    }

    function framedata(id) {
      var element = elements[id];
      var matrix_state = {
        modelviewproj : Math3D.mulMat4x4(viewprojection, element.matrix),
        model_matrix : element.matrix,
        view_matrix : view,
        projection_matrix : projection,
        modelview : Math3D.mulMat4x4(view, element.matrix),
        viewprojection : viewprojection
      };

      return { model: element.model, matrix_state: matrix_state };
    }

    var World3D = {};
    World3D.add = add;
    World3D.setPerspective = setPerspective;
    World3D.setCamera = setCamera;
    World3D.framedata = framedata;
    World3D.elements = elements;
    return World3D;
  })();
