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

var WebGLSprite = (function() {
    var sprite_vs =
      {
        attribute:
        {
          vposition : 'vec2'
        },

        uniform:
        {
          sprite_pos : 'vec3',
          sprite_sizerot : 'vec4',
          sprite_tex_transform : 'vec4',
          screen_dims : 'vec4'
        },

        varying:
        {
          v_Texcoord: 'vec2'
        },

        text: '\
void main() {\n\
  vec2 pre_rot = vposition * sprite_sizerot.xy;\n\
  vec2 dir = normalize(sprite_sizerot.zw);\n\
  vec2 tdir = vec2(-dir.y, dir.x);\n\
  gl_Position.x = dot(dir, pre_rot);\n\
  gl_Position.y = dot(tdir, pre_rot);\n\
  gl_Position.xy = (gl_Position.xy + sprite_pos.xy) *\n\
                     screen_dims.xy + screen_dims.zw;\n\
  gl_Position.z = sprite_pos.z;\n\
  gl_Position.w = 1.0;\n\
  v_Texcoord = vposition.xy * sprite_tex_transform.xy +\n\
               sprite_tex_transform.zw;\n\
}\n'
      };

    var sprite_fs =
    {
      fprecision: 'mediump',

      uniform:
      {
        sprite_texture : 'sampler2D'
      },

      varying:
      {
        v_Texcoord: 'vec2'
      },

      text: '\
void main() {\n\
  gl_FragColor = texture2D(sprite_texture, v_Texcoord);\n\
}\n'
    };

    function createContext(gl) {

      var sprite_program = gl.loadProgram(sprite_vs, sprite_fs);
      if (!sprite_program) {
        return null;
      }

      var verts = new Float32Array([0,0, 0,1, 1,1, 1,0]);
      var indices = new Uint8Array([0,1,2, 0,2,3]);

      var sprite_vbo = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, sprite_vbo);
      gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
      gl.bindBuffer(gl.ARRAY_BUFFER, null);

      sprite_ibo = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sprite_ibo);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

      var sprite_context = {};
      var cur_texture;
      var viewport_width, viewport_height;

      function setViewport(viewport) {
        viewport_width = viewport.width;
        viewport_height = viewport.height;
        sprite_program.screen_dims([2.0 / viewport.width,
                                   -2.0 / viewport.height,
                                   -1.0,
                                    1.0]);
      }

      sprite_context.bind = function(viewport) {
        if (!gl.setDrawContext(sprite_context)) {
          // sprite context is already bound

          // if the viewport has changed, reset it
          if (viewport_width != viewport.width ||
              viewport_height != viewport.height) {
            setViewport(viewport);
          }

          return;
        }

        gl.enableVertexAttribArray(0);
        gl.bindBuffer(gl.ARRAY_BUFFER, sprite_vbo);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sprite_ibo);

        sprite_program.bind();
        setViewport(viewport);

        gl.disable(gl.CULL_FACE);
        gl.enable(gl.BLEND);
        gl.blendEquation(gl.FUNC_ADD);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        sprite_program.sprite_texture(0);
        cur_texture = undefined;
      }

      sprite_context.drawSprite = function(pos, orient, size,
                                           texpos, texsize, tex) {
        sprite_program.sprite_pos(pos);
        sprite_program.sprite_sizerot(size.concat(orient));
        sprite_program.sprite_tex_transform(texsize.concat(texpos));

        if (tex != cur_texture) {
          gl.bindTexture(gl.TEXTURE_2D, tex);
          cur_texture = tex;
        }

        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0);
      };

      return sprite_context;
    }

    var WebGLSprite = {};
    WebGLSprite.createContext = createContext;
    return WebGLSprite;
  })();
