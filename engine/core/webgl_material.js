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

    function createMaterialTable(gl) {
      var material_table = {};
      var material_map = {};

      material_table.createMaterial = function(name, material_data) {
        var material = {};
        // TODO
        material_map[name] = material;
      };

      material_table.getMaterial = function(name) {
        var material = material_map[name];
        if (!material) {
          material = material_map['error'];
        }
        return material;
      };

      material_table.createMaterial('error', error_material);

      return material_table;
    }

    var WebGLMaterial = {};
    WebGLMaterial.createMaterialTable = createMaterialTable;
    return WebGLMaterial;
  })();
