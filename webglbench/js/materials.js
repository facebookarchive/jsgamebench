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
  var default_vertex_shader = {
    attribute: {
      vposition : 'vec3',
      vtexcoord : 'vec2',
      vnormal : 'vec3'
    },

    varying: {
      v_Texcoord : 'vec2',
      v_Normal : 'vec3',
      v_View : 'vec3',
      v_World : 'vec4',
    },

    uniform: {
      viewprojection : 'mat4',
      camera_pos : 'vec3',
      model_matrix : 'mat4'
    },

    text: [
      'void main() {',
      '  vec4 vpos = vec4(vposition, 1);',
      '  vec4 wpos;',
      '  wpos.x = dot(model_matrix0, vpos);',
      '  wpos.y = dot(model_matrix1, vpos);',
      '  wpos.z = dot(model_matrix2, vpos);',
      '  wpos.w = 1.0;',
      '  gl_Position.x = dot(viewprojection0, wpos);',
      '  gl_Position.y = dot(viewprojection1, wpos);',
      '  gl_Position.z = dot(viewprojection2, wpos);',
      '  gl_Position.w = dot(viewprojection3, wpos);',
      '  v_Texcoord = vtexcoord;',
      '  v_Normal.x = dot(model_matrix0.xyz, vnormal);',
      '  v_Normal.y = dot(model_matrix1.xyz, vnormal);',
      '  v_Normal.z = dot(model_matrix2.xyz, vnormal);',
      '  v_View = camera_pos - wpos.xyz;',
      '  v_World = wpos;',
      '}'
    ]
  };

  var default_fragment_shader = {
    fprecision: 'mediump',

    varying : {
      v_Texcoord : 'vec2',
      v_Normal : 'vec3',
      v_World : 'vec4',
    },

    uniform : {
      surfacetex : 'sampler2D'
    },

    text : [
      'void main() {',
      '  float dp = dot(normalize(v_Normal), normalize(vec3(1,-2,3)));',
      '  float lighting = 0.15 + 0.6 * clamp(dp, 0.0, 1.0);',
      '  gl_FragColor = texture2D(surfacetex, v_Texcoord);',
      '  lighting = 1.0 - clamp((v_World.y - 100.0) / 140.0, 0.0, 1.0);',
      '  gl_FragColor.xyz *= lighting;',
      '}'
    ]
  };

  var default_material_type_def = {
    name : 'default',
    vertex_shader : default_vertex_shader,
    fragment_shader : default_fragment_shader
  };

  var ship_fragment_shader = {
    fprecision: 'mediump',

    varying : {
      v_Texcoord : 'vec2',
      v_Normal : 'vec3',
      v_View : 'vec3'
    },

    uniform : {
      spec_power : 'float',
      diffusemap : 'sampler2D',
      colormap : 'sampler2D',
      specmap : 'sampler2D',
      lummap : 'sampler2D'
    },

    text : [
      'void main() {',
      '  vec3 light = normalize(vec3(1,-2,3));',
      '  vec3 norm = normalize(v_Normal);',
      '  vec3 reflection = reflect(-light, norm);',
      '  float dp = max(dot(light, norm), 0.0);',
      '  float rv = dot(reflection, normalize(v_View));',
      '  float specular = pow(max(rv, 0.0), spec_power) * dp;',
      '  float lighting = 0.15 + 0.6 * dp;',
      '  vec4 diffuse = texture2D(diffusemap, v_Texcoord);',
      '  vec4 color = texture2D(colormap, v_Texcoord);',
      '  vec4 spec = texture2D(specmap, v_Texcoord);',
      '  vec4 lum = texture2D(lummap, v_Texcoord);',
      '  lighting = (1.0 - lum.x) * lighting + lum.x;',
      '  gl_FragColor.xyz = diffuse.xyz * lighting + specular * spec.xyz;',
      '  gl_FragColor.w = diffuse.w;',
      '}'
    ]
  };

  var ship_material_type_def = {
    name : 'ship',
    vertex_shader : default_vertex_shader,
    fragment_shader : ship_fragment_shader
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
      name : 'Facebook-Logo',
      type : 'default',
      alphaBlend : true,
      params : {},
      textures : {
        surfacetex : '/textures/Facebook-Logo.png'
      }
    },

    {
      name : 'Ship_01_DIFF',
      type : 'ship',
      alphaBlend : false,
      params : {
        spec_power : 20
      },
      textures : {
        diffusemap : '/textures/Ship_01_DIFF.png',
        colormap : '/textures/Ship_01_COL.png',
        specmap : '/textures/Ship_01_SPEC.png',
        lummap : '/textures/Ship_01_LUM.png'
      }
    }
  ];

  function registerMaterials(material_table) {
    material_table.createMaterialType(default_material_type_def);
    material_table.createMaterialType(ship_material_type_def);
    for (var ii = 0; ii < all_material_defs.length; ++ii) {
      material_table.createMaterial(all_material_defs[ii]);
    }
  }

  return {
    registerMaterials: registerMaterials
  };

})();
