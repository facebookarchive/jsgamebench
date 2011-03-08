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

var TrenchMaterials = (function() {
  var default_material_type_def = {
    name : 'default',

    vertex_shader : {
      attribute: {
        vposition : 'vec3',
        vtexcoord : 'vec2',
        vnormal : 'vec3'
      },

      varying: {
        v_Texcoord : 'vec2',
        v_Normal : 'vec3'
      },

      uniform: {
        modelviewproj : 'mat4',
        model_matrix : 'mat4'
      },

      text: [
        'void main() {',
        '  vec4 hpos = vec4(vposition, 1);',
        '  gl_Position.x = dot(modelviewproj0, hpos);',
        '  gl_Position.y = dot(modelviewproj1, hpos);',
        '  gl_Position.z = dot(modelviewproj2, hpos);',
        '  gl_Position.w = dot(modelviewproj3, hpos);',
        '  v_Texcoord = vtexcoord;',
        '  v_Normal.x = dot(model_matrix0.xyz, vnormal);',
        '  v_Normal.y = dot(model_matrix1.xyz, vnormal);',
        '  v_Normal.z = dot(model_matrix2.xyz, vnormal);',
        '}'
      ]
    },

    fragment_shader : {
      fprecision: 'mediump',

      varying : {
        v_Texcoord : 'vec2',
        v_Normal : 'vec3'
      },

      uniform : {
        surfacetex : 'sampler2D'
      },

      text : [
        'void main() {',
        '  float dp = dot(normalize(v_Normal), normalize(vec3(1,-2,3)));',
        '  float lighting = 0.2 + 0.5 * clamp(dp, 0.0, 1.0);',
        '  gl_FragColor = texture2D(surfacetex, v_Texcoord);',
        '  gl_FragColor.xyz *= lighting;',
        '}'
      ]
    }
  };

  var all_material_defs = [
    {
      name : 'default',
      type : 'default',
      alphaBlend : false,
      params : {},
      textures : {
        surfacetex : '/textures/Checker_512_DIFF.png'
      }
    },

    {
      name : 'Ship_01_DIFF',
      type : 'default',
      alphaBlend : false,
      params : {},
      textures : {
        surfacetex : '/textures/Ship_01_DIFF.png'
      }
    }
  ];

  function registerMaterials(material_table) {
    material_table.createMaterialType(default_material_type_def);
    for (var ii = 0; ii < all_material_defs.length; ++ii) {
      material_table.createMaterial(all_material_defs[ii]);
    }
  }

  return {
    registerMaterials: registerMaterials
  };

})();
