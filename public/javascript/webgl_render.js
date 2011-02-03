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

var WebGLRender = (function() {
    var gl, initializing = false;
    var viewport, sprite_program, sprite_vbo, sprite_ibo;
    var cur_gltexture;

    var sprite_vs =
      {
        attribute:
        {
          vposition : 'vec2'
        },

        uniform:
        {
          sprite_dims : 'vec3',
          sprite_velpos : 'vec4',
          screen_dims : 'vec4',
          sprite_tex_transform : 'vec4'
        },

        varying:
        {
          v_Texcoord: 'vec2'
        },

        text: '\
void main() {\n\
  vec2 pre_rot = vposition * sprite_dims.xy;\n\
  vec2 dir = normalize(sprite_velpos.xy);\n\
  vec2 tdir = vec2(-dir.y, dir.x);\n\
  gl_Position.x = dot(dir, pre_rot);\n\
  gl_Position.y = dot(tdir, pre_rot);\n\
  gl_Position.xy = (gl_Position.xy + sprite_velpos.zw) *\n\
                     screen_dims.xy + screen_dims.zw;\n\
  gl_Position.z = sprite_dims.z;\n\
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
        sprite_color : 'vec4',
        sprite_texture : 'sampler2D'
      },

      varying:
      {
        v_Texcoord: 'vec2'
      },

      text: '\
void main() {\n\
  vec4 tex_color = texture2D(sprite_texture, v_Texcoord);\n\
  gl_FragColor = sprite_color * tex_color;\n\
}\n'
    };

    function createSpriteGeometry(gl_context) {
      var verts = new Float32Array([0,0, 0,1, 1,1, 1,0]);
      var indices = new Uint8Array([0,1,2, 0,2,3]);

      sprite_vbo = gl_context.createBuffer();
      gl_context.bindBuffer(gl_context.ARRAY_BUFFER, sprite_vbo);
      gl_context.bufferData(gl_context.ARRAY_BUFFER, verts,
                            gl_context.STATIC_DRAW);
      gl_context.bindBuffer(gl_context.ARRAY_BUFFER, null);

      sprite_ibo = gl_context.createBuffer();
      gl_context.bindBuffer(gl_context.ELEMENT_ARRAY_BUFFER, sprite_ibo);
      gl_context.bufferData(gl_context.ELEMENT_ARRAY_BUFFER, indices,
                            gl_context.STATIC_DRAW);
      gl_context.bindBuffer(gl_context.ELEMENT_ARRAY_BUFFER, null);
    }

    function init(parent_id, pwidth, pheight) {
      if (initializing) {
        return false;
      }

      initializing = true;
      Sprites.forEach(function(sprite) {
          sprite.gltexture = undefined;
        });
      sprite_program = null;
      sprite_vbo = null;
      sprite_ibo = null;
      gl = null;

      if (!WebGLUtil.isSupported()) {
        initializing = false;
        return false;
      }

      var parent = document.getElementById(parent_id);
      parent.innerHTML +=
        '<canvas id="gamecanvas"' +
        ' width="' + pwidth +
        '" height="' + pheight +
        '" style="position:absolute;left:0px,top:0px;' +
        'width:' + pwidth +
        'px;height:' + pheight +
        'px;"></canvas>';

      var canvas = document.getElementById('gamecanvas');
      var gl_attribs =
        {
          alpha : GameFrame.settings.webgl_blended_canvas,
          depth : false,
          stencil : false,
          antialias : false // no need for geometry antialiasing
        };

      var gl_context;
      if (GameFrame.settings.webgl_debug) {
        gl_context = WebGLDebug.createContext(canvas, gl_attribs);
      } else {
        gl_context = WebGLUtil.createContext(canvas, gl_attribs);
      }

      if (!gl_context) {
        initializing = false;
        return false;
      }

      sprite_program = gl_context.loadProgram(sprite_vs, sprite_fs);

      if (!sprite_program) {
        initializing = false;
        return false;
      }

      createSpriteGeometry(gl_context);

      viewport =
        {
          width : pwidth,
          height : pheight
        };

      gl = gl_context;
      initializing = false;
      return true;
    }

    function begin() {
      if (!gl) {
        return;
      }

      gl.viewport(0, 0, viewport.width, viewport.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.disable(gl.CULL_FACE);
      gl.enable(gl.BLEND);
      gl.blendEquation(gl.FUNC_ADD);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      // get ready to draw sprites: bind the shaders and geometry
      sprite_program.bind();
      gl.enableVertexAttribArray(0);
      gl.bindBuffer(gl.ARRAY_BUFFER, sprite_vbo);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sprite_ibo);

      sprite_program.sprite_color(1, 1, 1, 1);
      sprite_program.screen_dims(2.0 / viewport.width,
                                 -2.0 / viewport.height,
                                 -1.0,
                                 1.0);

      // set sprite texture sampler to use texture 0
      sprite_program.sprite_texture(0);
      gl.activeTexture(gl.TEXTURE0);
    }

    function draw(framedata) {
      if (!gl) {
        return;
      }

      // setup size
      var w = framedata.size[0] * framedata.scale;
      var h = framedata.size[1] * framedata.scale;
      sprite_program.sprite_dims(w, h, 0.1);

      // setup position and rotation
      sprite_program.sprite_velpos(framedata.vel[0], -framedata.vel[1],
                                   framedata.pos[0], framedata.pos[1]);

      // setup texture
      var sprite = framedata.sprite;
      var imgmulx = 1 / sprite.imageel.width;
      var imgmuly = 1 / sprite.imageel.height;
      sprite_program.sprite_tex_transform(framedata.size[0] * imgmulx,
                                          framedata.size[1] * imgmuly,
                                          framedata.x * imgmulx,
                                          framedata.y * imgmuly);

      if (!sprite.gltexture) {
        sprite.gltexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, sprite.gltexture);
        gl.texImage2D(gl.TEXTURE_2D, 0,
                      gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
                      sprite.imageel);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        cur_gltexture = sprite.gltexture;
      } else if (sprite.gltexture != cur_gltexture) {
        gl.bindTexture(gl.TEXTURE_2D, sprite.gltexture);
        cur_gltexture = sprite.gltexture;
      }

      // draw
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0);
    }

    function end() {
      if (!gl) {
        return;
      }

      gl.flush();
      cur_gltexture = undefined;
    }

    var WebGLRender = {};
    WebGLRender.init = init;
    WebGLRender.begin = begin;
    WebGLRender.draw = draw;
    WebGLRender.end = end
    return WebGLRender;
  })();
