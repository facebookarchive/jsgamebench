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
    var dynamic_elements = [];
    var static_elements = [];

    var matrix_state = {
      view_matrix : Math3D.mat4x4(),
      projection_matrix : Math3D.mat4x4(),
      viewprojection : Math3D.mat4x4(),
      camera_pos : [0,0,0]
    };

    function checkCollision(old_mid, new_mid, radius, source, callback) {

      var result = null;

      for (var id in static_elements) {
        var element = static_elements[id];
        if (Math3D.boxSphereCollision(new_mid, radius,
                                      element.min, element.max,
                                      element.mid, element.radius)) {
          var result2 = Math3D.sweptSphereBoxIntersection(element.min,
                                                          element.max,
                                                          element.mid,
                                                          element.radius,
                                                          old_mid,
                                                          new_mid,
                                                          radius);

          if (result2.t >= 0 && (!result || result2.t < result.t)) {
            result = result2;
          }
        }
      }

      if (result) {
        result.source = source;
        if (callback(result)) {
          return false;
        }
      }

      return true;
    }

    function addStatic(id, model, world_matrix, bounds_min, bounds_max) {
      var element = {
        model: model,
        matrix: world_matrix,
        min : bounds_min,
        max : bounds_max,
        mid : Math3D.scaleVec3Self(Math3D.addVec3(bounds_min, bounds_max), 0.5),
        radius : Math3D.distanceVec3(bounds_min, bounds_max) * 0.5
      };

      static_elements[id] = element;
    }

    function updateStatic(id, model) {
      if (typeof static_elements[id] !== 'undefined') {
        static_elements[id].model = model;
      }
    }

    function removeStatic(id) {
      static_elements[id] = undefined;
    }

    function addDynamic(model, world_matrix, bounds_mid, bounds_radius, owner) {
      var element = {
        model: model,
        matrix: Math3D.dupMat4x4(world_matrix),
        mid : Math3D.dupVec3(bounds_mid),
        radius : bounds_radius,
        owner : owner
      };

      var id = dynamic_elements.length;
      for (var ii = 0; ii < id; ++ii) {
        if (typeof dynamic_elements[ii] === 'undefined') {
          id = ii;
        }
      }
      dynamic_elements[id] = element;
      return id;
    }

    function moveDynamic(id, world_matrix, bounds_mid, collision_callback) {
      var element = dynamic_elements[id];
      if (element) {
        var do_update = true;
        if (collision_callback) {
          do_update = checkCollision(element.mid, bounds_mid, element.radius,
                                     element.owner, collision_callback);
        }

        if (do_update) {
          Math3D.copyMat4x4(element.matrix, world_matrix);
          Math3D.copyVec3(element.mid, bounds_mid);
        }
      }
    }

    function updateDynamic(id, model) {
      if (typeof dynamic_elements[id] !== 'undefined') {
        dynamic_elements[id].model = model;
      }
    }

    function removeDynamic(id) {
      dynamic_elements[id] = undefined;
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
      matrix_state.camera_pos[0] = camera_matrix[12];
      matrix_state.camera_pos[1] = camera_matrix[13];
      matrix_state.camera_pos[2] = camera_matrix[14];
    }

    function drawElement(model_context, element) {
      if (typeof element === 'undefined') {
        return;
      }

      // inject model matrix into matrix state
      matrix_state.model_matrix = element.matrix;

      model_context.drawModel(element.model, -1, matrix_state);
    }

    function draw(model_context) {
      if (!model_context) {
        return;
      }

      for (var id in static_elements) {
        drawElement(model_context, static_elements[id]);
      }

      for (var id = 0; id < dynamic_elements.length; ++id) {
        drawElement(model_context, dynamic_elements[id]);
      }
    }

    var World3D = {};
    World3D.addStatic = addStatic;
    World3D.updateStatic = updateStatic;
    World3D.removeStatic = removeStatic;

    World3D.addDynamic = addDynamic;
    World3D.moveDynamic = moveDynamic;
    World3D.updateDynamic = updateDynamic;
    World3D.removeDynamic = removeDynamic;

    World3D.setPerspectiveZUp = setPerspectiveZUp;
    World3D.setCamera = setCamera;
    World3D.draw = draw;
    return World3D;
  })();
