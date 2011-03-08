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

var WebGLMaterial = (function() {

    // constants
    var show_unloaded_materials = true;
    var ERROR_MAT_NAME = 'error';

    // error materials
    var error_material_type_def = {
      name : ERROR_MAT_NAME,
      vertex_shader : {
        attribute: {
          vposition : 'vec3',
          vtexcoord : 'vec2',
          vnormal : 'vec3'
        },

        uniform: {
          modelviewproj : 'mat4'
        },

        text: [
          'void main() {',
          '  vec4 hpos = vec4(vposition, 1);',
          '  gl_Position.x = dot(modelviewproj0, hpos);',
          '  gl_Position.y = dot(modelviewproj1, hpos);',
          '  gl_Position.z = dot(modelviewproj2, hpos);',
          '  gl_Position.w = dot(modelviewproj3, hpos);',
          '}'
        ]
      },

      fragment_shader: {
        fprecision: 'mediump',

        text: [
          'void main() {',
          '  gl_FragColor = vec4(1, 0.5, 0.5, 1);',
          '}'
        ]
      }
    };

    var error_material_def = {
      name : ERROR_MAT_NAME,
      type : ERROR_MAT_NAME,
      params : {},
      textures : {}
    };

    function createMaterialTable(gl, texture_table) {
      var material_table = {};

      var material_type_dictionary = {};
      var material_dictionary = {};

      material_table.createMaterialType = function(data) {
        var material_type = {};
        var material_program = gl.loadProgram(data.vertex_shader,
                                              data.fragment_shader);
        if (!material_program) {
          gl.log('Failed to load program for material type: ' + data.name);
          return;
        }

        material_type.bind = material_program.bind;

        material_type.bindData = function(material_data, textures) {
          if (material_data.alphaBlend) {
            gl.enable(gl.BLEND);
            gl.blendEquation(gl.FUNC_ADD);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
          } else {
            gl.disable(gl.BLEND);
          }

          for (var p in material_data.params) {
            if (typeof material_program[p] === 'function') {
              material_program[p](material_data.params[p]);
            }
          }

          var tex_idx = 0;
          for (var t in textures) {
            if (typeof material_program[t] === 'function') {
              material_program[t](tex_idx);
              textures[t].bindTexture();
              ++tex_idx;
            }
          }
        };

        material_type.bindMatrixState = function(matrix_state) {
          for (var mstate in matrix_state) {
            if (typeof material_program[mstate] === 'function') {
              material_program[mstate](matrix_state[mstate]);
            }
          }
        };

        material_type_dictionary[data.name] = material_type;
      };

      material_table.getMaterialType = function(name) {
        var material_type = material_type_dictionary[name];
        if (!material_type) {
          gl.log('Failed to find material type: ' + name);
          material_type = material_type_dictionary[ERROR_MAT_NAME];
        }
        return material_type;
      };

      material_table.createMaterial = function(data) {
        // getMaterial will create an empty material if there isn't already one
        var material = material_table.getMaterial(data.name);

        var material_type = material_table.getMaterialType(data.type);
        var textures = {};

        for (var tex in data.textures) {
          textures[tex] = texture_table.getTexture(data.textures[tex]);
        }

        material.bind = function() {
          material_type.bindData(data, textures);
        };

        material.getMaterialType = function() {
          return material_type;
        }

        material.bindMatrixState = material_type.bindMatrixState;
      };

      material_table.getMaterial = function(name) {
        var material = material_dictionary[name];
        if (!material) {
          // create dummy material, it may be filled in later
          material = {};
          material_dictionary[name] = material;

          if (show_unloaded_materials) {
            var error_material = material_dictionary[ERROR_MAT_NAME];
            material.bind = function() {
              // show error once, then rebind
              error_material.bind.apply(error_material, arguments);
              gl.log('Bound dummy material for "' + name + '"');
              material.bind = error_material.bind;
            };
            material.bindMatrixState = error_material.bindMatrixState;
            material.getMaterialType = error_material.getMaterialType;
          }
        }
        return material;
      };

      material_table.createMaterialType(error_material_type_def);
      material_table.createMaterial(error_material_def);

      return material_table;
    }

    var WebGLMaterial = {};
    WebGLMaterial.createMaterialTable = createMaterialTable;
    return WebGLMaterial;
  })();
