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

var WebGLModel = (function() {

    function createContext(gl, material_table) {
      var model_context = {};
      var cur_model;
      var cur_material_type;
      var cur_material;

      function setupContext() {
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);
        gl.frontFace(gl.CCW);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LESS);

        gl.enableVertexAttribArray(0);
        gl.enableVertexAttribArray(1);
        gl.enableVertexAttribArray(2);
        gl.disableVertexAttribArray(3);

        cur_model = undefined;
        cur_material_type = undefined;
        cur_material = undefined;
      }

      model_context.drawModel = function(model, subobj, matrix_state) {
        if (gl.setDrawContext(model_context)) {
          // context changed, setup model context
          setupContext();
        }

        if (cur_model !== model) {
          cur_model = model;
          cur_model.bind();
        }

        if (subobj < 0) {
          for (var ii = 0; ii < model.subobj_count; ++ii) {
            cur_model.draw(ii, matrix_state);
          }
        } else {
          cur_model.draw(subobj, matrix_state);
        }
      };

      model_context.createModel = function(model_data) {
        var model_obj = {};
        var vbo_stride = 32; // 8 floats
        var subobjects = [];

        var model_vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, model_vbo);
        gl.bufferData(gl.ARRAY_BUFFER,
                      new Float32Array(model_data.verts),
                      gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        var model_ibo = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model_ibo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
                      new Uint16Array(model_data.indices),
                      gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

        var index_offset = 0;
        for (var ii = 0; ii < model_data.materials.length; ++ii) {
          subobjects[ii] = {
            start: index_offset,
            count: model_data.counts[ii],
            material: material_table.getMaterial(model_data.materials[ii])
          };
          index_offset += model_data.counts[ii];
        }

        model_obj.bind = function() {
          gl.bindBuffer(gl.ARRAY_BUFFER, model_vbo);
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model_ibo);

          // attrib 0 = positions
          gl.vertexAttribPointer(0,
                                 3, // 3 components
                                 gl.FLOAT, // floats
                                 gl.FALSE, // not normalized
                                 vbo_stride, // vertex stride
                                 0); // no offset

          // attrib 1 = texcoords
          gl.vertexAttribPointer(1,
                                 2, // 2 components
                                 gl.FLOAT, // floats
                                 gl.FALSE, // not normalized
                                 vbo_stride, // vertex stride
                                 12); // 12 bytes in, after positions

          // attrib 2 = normals
          gl.vertexAttribPointer(2,
                                 3, // 3 components
                                 gl.FLOAT, // floats
                                 gl.FALSE, // not normalized
                                 vbo_stride, // vertex stride
                                 20); // 20 bytes in, after texcoords
        };

        model_obj.draw = function(subobj, matrix_state) {
          var material = subobjects[subobj].material;
          if (!material.bind) {
            // not loaded yet
            return;
          }

          if (cur_material !== material) {

            var material_type = material.getMaterialType();
            if (cur_material_type != material_type) {
              cur_material_type = material_type;
              material_type.bind();
            }

            cur_material = material;
            cur_material.bind();
          }

          cur_material.bindMatrixState(matrix_state);

          gl.drawElements(gl.TRIANGLES,
                          subobjects[subobj].count,
                          gl.UNSIGNED_SHORT,
                          subobjects[subobj].start);
        };

        model_obj.subobj_count = model_data.materials.length;

        return model_obj;
      };

      return model_context;
    }

    var WebGLModel = {};
    WebGLModel.createContext = createContext;
    return WebGLModel;
  })();
