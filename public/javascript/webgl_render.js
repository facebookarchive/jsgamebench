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

    var sprite_vs =
      'uniform vec3 sprite_dims;\n' +
      'uniform vec3 sprite_matrix_x;\n' +
      'uniform vec3 sprite_matrix_y;\n' +
      'uniform vec4 screen_dims;\n' +
      'uniform vec4 sprite_tex_transform;\n' +
      'attribute vec2 vposition;\n' +
      'varying vec2 v_Texcoord;\n' +
      'void main() {\n' +
      '  vec3 pre_rot = vec3(vposition * sprite_dims.xy, 1);\n' +
      '  gl_Position = vec4(dot(sprite_matrix_x, pre_rot) *\n' +
      '                       screen_dims.x + screen_dims.z,\n' +
      '                     dot(sprite_matrix_y, pre_rot) *' +
      '                       screen_dims.y + screen_dims.w,\n' +
      '                     sprite_dims.z, 1);\n' +
      '  vec2 texcoord = vec2(vposition.x, 1.0 - vposition.y);\n' +
      '  v_Texcoord = texcoord * sprite_tex_transform.xy +\n' +
      '               sprite_tex_transform.zw;\n' +
      '}\n';

    var sprite_fs =
      '#ifdef GL_ES\n' +
      '  precision mediump float;\n' +
      '#endif\n' +
      'uniform vec4 sprite_color;\n' +
      'uniform sampler2D sprite_texture;\n' +
      'varying vec2 v_Texcoord;\n' +
      'void main() {\n' +
      '  vec4 tex_color = texture2D(sprite_texture, v_Texcoord);\n' +
      '  gl_FragColor = sprite_color * tex_color;\n' +
      '}\n';

    var sprite_attribs = ['vposition'];

    var sprite_uniforms = ['sprite_dims',
                           'sprite_matrix_x',
                           'sprite_matrix_y',
                           'screen_dims',
                           'sprite_tex_transform',
                           'sprite_color'
                          ];

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

      sprite_program = gl_context.loadProgram(sprite_vs,
                                              sprite_fs,
                                              sprite_attribs,
                                              sprite_uniforms);

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
      gl.clearColor(0, 1.0, 0, 0);
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

      gl.uniform4f(sprite_program.uniform('sprite_color'),
                   1, 1, 1, 1);
      gl.uniform4f(sprite_program.uniform('screen_dims'),
                   2.0 / viewport.width,
                   2.0 / viewport.height,
                   -1.0,
                   -1.0);
    }

    function draw(framedata) {
      if (!gl) {
        return;
      }

      // setup size
      var w = framedata.size[0] * framedata.scale;
      var h = framedata.size[1] * framedata.scale;
      gl.uniform3f(sprite_program.uniform('sprite_dims'),
                   w, h, 0.1);

      // setup matrix
      var ct = 1, st = 0;
      if (framedata.vel[1]) {
        var theta = Math.atan2(framedata.vel[1], framedata.vel[0]);
        ct = Math.cos(theta);
        st = Math.sin(theta);
      }

      gl.uniform3f(sprite_program.uniform('sprite_matrix_x'),
                   ct, st, framedata.pos[0]);
      gl.uniform3f(sprite_program.uniform('sprite_matrix_y'),
                   -st, ct, framedata.pos[1]);

      // setup texture
      var sprite = framedata.sprite;
      var imgmulx = 1 / sprite.imageel.width;
      var imgmuly = 1 / sprite.imageel.height;
      gl.uniform4f(sprite_program.uniform('sprite_tex_transform'),
                   framedata.size[0] * imgmulx, framedata.size[1] * imgmuly,
                   framedata.x * imgmulx, framedata.y * imgmuly);

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
      } else {
        gl.bindTexture(gl.TEXTURE_2D, sprite.gltexture);
      }

      // draw
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0);
    }

    function end() {
      if (!gl) {
        return;
      }

      gl.flush();
    }

    var WebGLRender = {};
    WebGLRender.init = init;
    WebGLRender.begin = begin;
    WebGLRender.draw = draw;
    WebGLRender.end = end
    return WebGLRender;
  })();
