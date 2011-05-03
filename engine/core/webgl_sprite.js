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
          sprite_sizerot : 'vec3',
          sprite_tex_transform : 'vec4',
          screen_dims : 'vec4'
        },

        varying:
        {
          v_Texcoord: 'vec2'
        },

        text:
        [
          'void main() {',
          '  vec2 pre_rot = vposition * sprite_sizerot.xy;',
          '  vec2 tdir = vec2(sin(sprite_sizerot.z), cos(sprite_sizerot.z));',
          '  vec2 dir = vec2(tdir.y, -tdir.x);',
          '  gl_Position.x = dot(dir, pre_rot);',
          '  gl_Position.y = dot(tdir, pre_rot);',
          '  gl_Position.xy = (gl_Position.xy + sprite_pos.xy) *',
          '                     screen_dims.xy + screen_dims.zw;',
          '  gl_Position.z = sprite_pos.z;',
          '  gl_Position.w = 1.0;',
          '  v_Texcoord = vposition.xy * sprite_tex_transform.xy +',
          '               sprite_tex_transform.zw;',
          '}'
        ]
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

        text:
        [
          'void main() {',
          '  gl_FragColor = texture2D(sprite_texture, v_Texcoord);',
          '}'
        ]
      };

    var batched_sprite_vs =
      {
        attribute:
        {
          vposition : 'vec2',
          sprite_pos_tex : 'vec4',
          sprite_sizerot : 'vec3',
          sprite_tex_transform : 'vec4'
        },

        uniform:
        {
          screen_dims : 'vec4'
        },

        varying:
        {
          v_Texcoord: 'vec3'
        },

        text:
        [
          'void main() {',
          '  vec2 pre_rot = vposition * sprite_sizerot.xy;',
          '  vec2 tdir = vec2(sin(sprite_sizerot.z), cos(sprite_sizerot.z));',
          '  vec2 dir = vec2(tdir.y, -tdir.x);',
          '  gl_Position.x = dot(dir, pre_rot);',
          '  gl_Position.y = dot(tdir, pre_rot);',
          '  gl_Position.xy = (gl_Position.xy + sprite_pos_tex.xy) *',
          '                     screen_dims.xy + screen_dims.zw;',
          '  gl_Position.z = sprite_pos_tex.z;',
          '  gl_Position.w = 1.0;',
          '  v_Texcoord.xy = vposition.xy * sprite_tex_transform.xy +',
          '                  sprite_tex_transform.zw;',
          '  v_Texcoord.z = sprite_pos_tex.w;',
          '}'
        ]
      };

    var batched_sprite_fs =
      {
        fprecision: 'mediump',

        uniform:
        {
          sprite_texture0 : 'sampler2D',
          sprite_texture1 : 'sampler2D',
          sprite_texture2 : 'sampler2D',
          sprite_texture3 : 'sampler2D'
        },

        varying:
        {
          v_Texcoord: 'vec3'
        },

        text:
        [
          'void main() {',
          '  if (v_Texcoord.z < 1.0) {',
          '    gl_FragColor = texture2D(sprite_texture0, v_Texcoord.xy);',
          '  } else if (v_Texcoord.z < 2.0) {',
          '    gl_FragColor = texture2D(sprite_texture1, v_Texcoord.xy);',
          '  } else if (v_Texcoord.z < 3.0) {',
          '    gl_FragColor = texture2D(sprite_texture2, v_Texcoord.xy);',
          '  } else {',
          '    gl_FragColor = texture2D(sprite_texture3, v_Texcoord.xy);',
          '  }',
          '}'
        ]
      };

      function createStream(gl,
                            components,
                            data_type,
                            normalized,
                            stride,
                            base_offset,
                            stream_offset) {
        var stream = { offset: base_offset + stream_offset, stride: stride };
        stream.bind = function(array_idx) {
          gl.vertexAttribPointer(array_idx,
                                 components,
                                 data_type,
                                 normalized,
                                 stream.stride,
                                 stream.offset);
        };
        return stream;
      }

    function createQuadBuffer(gl, quad_count) {
        var quad_buffer = { streams: [] };

        var vert_count = quad_count * 4;
        var pos_size = vert_count * 2 * Uint8Array.BYTES_PER_ELEMENT;
        var attr_size = 0;

        quad_buffer.streams.push(createStream(gl, 2, gl.UNSIGNED_BYTE, false, 0, 0, 0));

        if (quad_count > 1) {
          var attr_count = 11;
          var attr_stride = attr_count * Float32Array.BYTES_PER_ELEMENT;
          attr_size = vert_count * attr_stride;
          quad_buffer.streams.push(createStream(gl, 4, gl.FLOAT, false, attr_stride, pos_size, 0));
          quad_buffer.streams.push(createStream(gl, 3, gl.FLOAT, false, attr_stride, pos_size, 4 * Float32Array.BYTES_PER_ELEMENT));
          quad_buffer.streams.push(createStream(gl, 4, gl.FLOAT, false, attr_stride, pos_size, 7 * Float32Array.BYTES_PER_ELEMENT));
          quad_buffer.attr_data = new Float32Array(attr_count * vert_count);
          quad_buffer.updateAttributes = function() {
            gl.bufferSubData(gl.ARRAY_BUFFER, pos_size, quad_buffer.attr_data);
          }
        }

        var verts = new Uint8Array(quad_count * 8);
        for (var ii = 0; ii < quad_count; ++ii) {
          verts[ii * 8 + 0] = 0;
          verts[ii * 8 + 1] = 0;

          verts[ii * 8 + 2] = 0;
          verts[ii * 8 + 3] = 1;

          verts[ii * 8 + 4] = 1;
          verts[ii * 8 + 5] = 1;

          verts[ii * 8 + 6] = 1;
          verts[ii * 8 + 7] = 0;
        }

        var indices = new Uint16Array(quad_count * 6);
        for (var ii = 0; ii < quad_count; ++ii) {
          indices[ii * 6 + 0] = ii * 4 + 0;
          indices[ii * 6 + 1] = ii * 4 + 1;
          indices[ii * 6 + 2] = ii * 4 + 2;

          indices[ii * 6 + 3] = ii * 4 + 0;
          indices[ii * 6 + 4] = ii * 4 + 2;
          indices[ii * 6 + 5] = ii * 4 + 3;
        }

        quad_buffer.vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, quad_buffer.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, pos_size + attr_size, (quad_count > 1 ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW));
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, verts);
        if (quad_buffer.attr_data) {
          quad_buffer.updateAttributes();
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        quad_buffer.ibo = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, quad_buffer.ibo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

        quad_buffer.setup = function() {
          for (var ii = 0; ii < quad_buffer.streams.length; ++ii) {
            gl.enableVertexAttribArray(ii);
          }
          for (var ii = quad_buffer.streams.length; ii < 4; ++ii) {
            gl.disableVertexAttribArray(ii);
          }
        }

        quad_buffer.bind = function() {
          gl.bindBuffer(gl.ARRAY_BUFFER, quad_buffer.vbo);
          for (var ii = 0; ii < quad_buffer.streams.length; ++ii) {
            quad_buffer.streams[ii].bind(ii);
          }
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, quad_buffer.ibo);
        }

        return quad_buffer;
      }

    function createBatchingContext(gl) {

      // don't create more than one for each gl context
      if (gl.webgl_sprite_batch_context) {
        return gl.webgl_sprite_batch_context;
      }

      var sprite_program = gl.loadProgram(batched_sprite_vs, batched_sprite_fs);
      if (!sprite_program) {
        return null;
      }

      var max_sprites_per_batch = 250;
      var sprite_buffers = [];
      var current_buffer = 0;
      var current_textures = [{}, {}, {}, {}];
      var sprite_count = 0;

      function addBuffer() {
        sprite_buffers.push(createQuadBuffer(gl, max_sprites_per_batch));
      }

      var viewport_width, viewport_height;

      function resetTextures(full_reset) {
        if (full_reset) {
          current_textures[0].tex = null;
          current_textures[1].tex = null;
          current_textures[2].tex = null;
          current_textures[3].tex = null;
        }
        current_textures[0].uses = 0;
        current_textures[1].uses = 0;
        current_textures[2].uses = 0;
        current_textures[3].uses = 0;

        current_textures[0].reuse = false;
        current_textures[1].reuse = false;
        current_textures[2].reuse = false;
        current_textures[3].reuse = false;
      }

      function setViewportParams() {
        sprite_program.screen_dims([2.0 / viewport_width,
                                    -2.0 / viewport_height,
                                    -1.0,
                                    1.0]);

        if (!sprite_buffers.length) {
          addBuffer();
        }

        current_buffer = 0;
        sprite_count = 0;
        resetTextures();
      }

      function setupContext() {
        sprite_program.bind();
        setViewportParams();

        gl.disable(gl.CULL_FACE);
        gl.enable(gl.BLEND);
        gl.blendEquation(gl.FUNC_ADD);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.disable(gl.DEPTH_TEST);

        sprite_buffers[0].setup();
      }

      function flushSprites() {
        sprite_buffers[current_buffer].bind();
        sprite_buffers[current_buffer].updateAttributes();

        if (!current_textures[0].reuse) {
          sprite_program.sprite_texture0(0);
          gl.bindTexture(gl.TEXTURE_2D, current_textures[0].tex);
        }
        if (!current_textures[1].reuse) {
          sprite_program.sprite_texture1(1);
          gl.bindTexture(gl.TEXTURE_2D, current_textures[1].tex);
        }
        if (!current_textures[2].reuse) {
          sprite_program.sprite_texture2(2);
          gl.bindTexture(gl.TEXTURE_2D, current_textures[2].tex);
        }
        if (!current_textures[3].reuse) {
          sprite_program.sprite_texture3(3);
          gl.bindTexture(gl.TEXTURE_2D, current_textures[3].tex);
        }

        gl.drawElements(gl.TRIANGLES, 6 * sprite_count, gl.UNSIGNED_SHORT, 0);

        current_buffer++;
        sprite_count = 0;
        resetTextures();
      }

      var sprite_context = {};

      sprite_context.setViewport = function(viewport) {
        viewport_width = viewport.width;
        viewport_height = viewport.height;
        if (gl.isDrawContextActive(sprite_context)) {
          setViewportParams();
        }
      };

      sprite_context.drawSprite = function(pos, theta, size,
                                           texpos, texsize, tex) {
        if (gl.setDrawContext(sprite_context)) {
          // context changed, setup sprite context
          setupContext();
        }

        var tex_index, tex_available = 4;
        for (tex_index = 3; tex_index >= 0; --tex_index) {
          if (current_textures[tex_index].tex === tex) {
            break;
          } else if (!current_textures[tex_index].uses) {
            tex_available = tex_index;
          }
        }

        if (tex_index >= 0) {
          if (!current_textures[tex_index].uses) {
            // same textures as last draw call, so don't rebind the texture
            current_textures[tex_index].reuse = true;
          }
        } else if (tex_available < 4) {
          tex_index = tex_available;
        } else {
          flushSprites();
          tex_index = 0;
        }

        current_textures[tex_index].tex = tex;
        current_textures[tex_index].uses = 1 + (current_textures[tex_index].uses || 0);

        if (current_buffer >= sprite_buffers.length) {
          addBuffer();
        }

        var attr_data = sprite_buffers[current_buffer].attr_data;
        for (var ii = 0; ii < 4; ++ii) {
          var attr_offset = sprite_count * 44 + ii * 11;
          attr_data[attr_offset + 0] = pos[0];
          attr_data[attr_offset + 1] = pos[1];
          attr_data[attr_offset + 2] = pos[2];
          attr_data[attr_offset + 3] = tex_index;
          attr_data[attr_offset + 4] = size[0];
          attr_data[attr_offset + 5] = size[1];
          attr_data[attr_offset + 6] = theta;
          attr_data[attr_offset + 7] = texsize[0];
          attr_data[attr_offset + 8] = texsize[1];
          attr_data[attr_offset + 9] = texpos[0];
          attr_data[attr_offset + 10] = texpos[1];
        }

        sprite_count++;

        if (sprite_count >= max_sprites_per_batch) {
          flushSprites();
        }
      };

      sprite_context.unsetContext = function() {
        if (sprite_count > 0) {
          flushSprites();
        }
        resetTextures(true);
      }

      gl.webgl_sprite_batch_context = sprite_context;
      return sprite_context;
    }

    function createContext(gl) {

      // don't create more than one for each gl context
      if (gl.webgl_sprite_context) {
        return gl.webgl_sprite_context;
      }

      var sprite_program = gl.loadProgram(sprite_vs, sprite_fs);
      if (!sprite_program) {
        return null;
      }

      var sprite_buffer = createQuadBuffer(gl, 1);

      var sprite_context = {};
      var cur_texture;
      var viewport_width, viewport_height;

      function setViewportParams() {
        sprite_program.screen_dims([2.0 / viewport_width,
                                    -2.0 / viewport_height,
                                    -1.0,
                                    1.0]);
      }

      function setupContext() {
        sprite_buffer.setup();
        sprite_buffer.bind();
        sprite_program.bind();
        setViewportParams();

        gl.disable(gl.CULL_FACE);
        gl.enable(gl.BLEND);
        gl.blendEquation(gl.FUNC_ADD);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.disable(gl.DEPTH_TEST);

        sprite_program.sprite_texture(0);
        cur_texture = undefined;
      }

      sprite_context.setViewport = function(viewport) {
        viewport_width = viewport.width;
        viewport_height = viewport.height;
        if (gl.isDrawContextActive(sprite_context)) {
          setViewportParams();
        }
      };

      sprite_context.drawSprite = function(pos, theta, size,
                                           texpos, texsize, tex) {
        if (gl.setDrawContext(sprite_context)) {
          // context changed, setup sprite context
          setupContext();
        }

        sprite_program.sprite_pos(pos);
        sprite_program.sprite_sizerot(size.concat([theta]));
        sprite_program.sprite_tex_transform(texsize.concat(texpos));

        if (tex != cur_texture) {
          gl.bindTexture(gl.TEXTURE_2D, tex);
          cur_texture = tex;
        }

        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
      };

      gl.webgl_sprite_context = sprite_context;
      return sprite_context;
    }

    var WebGLSprite = {};
    WebGLSprite.createContext = createContext;
    WebGLSprite.createBatchingContext = createBatchingContext;
    return WebGLSprite;
  })();
