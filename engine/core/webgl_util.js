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

var WebGLUtil = (function() {

    function loadShader(shader_text, shader_type) {
      var shader_obj = this.createShader(shader_type);
      if (!shader_obj) {
        this.log('loadShader failed to create shader');
        return null;
      }

      this.shaderSource(shader_obj, shader_text);
      this.compileShader(shader_obj);

      if (!this.getShaderParameter(shader_obj,
                                   this.COMPILE_STATUS)) {
        var compile_error = this.getShaderInfoLog(shader_obj);
        this.log('loadShader failed to compile shader:' + compile_error);
        this.deleteShader(shader_obj);
        return null;
      }

      return shader_obj;
    }

    var bind_table = {};
    bind_table['float'] = function(gl, loc) {
      return function(f) {
        gl.uniform1f(loc, f);
      }
    };

    bind_table['vec2'] = function(gl, loc) {
      return function(v) {
        gl.uniform2f(loc, v[0], v[1]);
      }
    };

    bind_table['vec3'] = function(gl, loc) {
      return function(v) {
        gl.uniform3f(loc, v[0], v[1], v[2]);
      }
    };

    bind_table['vec4'] = function(gl, loc) {
      return function(v) {
        gl.uniform4f(loc, v[0], v[1], v[2], v[3]);
      }
    };

    bind_table['mat3'] = function(gl, loc) {
      return function(m) {
        gl.uniform3f(loc[0], m[0], m[3], m[6]);
        gl.uniform3f(loc[1], m[1], m[4], m[7]);
        gl.uniform3f(loc[2], m[2], m[5], m[8]);
      }
    };

    bind_table['mat4'] = function(gl, loc) {
      return function(m) {
        gl.uniform4f(loc[0], m[0], m[4], m[8],  m[12]);
        gl.uniform4f(loc[1], m[1], m[5], m[9],  m[13]);
        gl.uniform4f(loc[2], m[2], m[6], m[10], m[14]);
        gl.uniform4f(loc[3], m[3], m[7], m[11], m[15]);
      }
    };

    bind_table['sampler2D'] = function(gl, loc) {
      return function(s) {
        gl.uniform1i(loc, s);
        gl.activeTexture(gl.TEXTURE0 + s);
      }
    };

    function loadProgram(vshader, fshader) {
      var uniforms = {};

      function genDecls(obj, name, accum) {
        var text = [];
        var nobj = obj[name];
        for (var o in nobj) {
          var type = nobj[o];
          if (type === 'mat4') {
            text.push([name, ' vec4 ', o, '0;'].join(''));
            text.push([name, ' vec4 ', o, '1;'].join(''));
            text.push([name, ' vec4 ', o, '2;'].join(''));
            text.push([name, ' vec4 ', o, '3;'].join(''));
          } else if (type === 'mat3') {
            text.push([name, ' vec3 ', o, '0;'].join(''));
            text.push([name, ' vec3 ', o, '1;'].join(''));
            text.push([name, ' vec3 ', o, '2;'].join(''));
          } else {
            text.push([name, ' ', type, ' ', o, ';'].join(''));
          }
          if (accum) {
            accum[o] = nobj[o];
          }
        }
        return text;
      }

      // safety check the varying params
      for (var v in fshader.varying) {
        if (vshader.varying[v] !== fshader.varying[v]) {
          if (vshader.varying[v] === undefined) {
            this.log('Warning: varying param "' + v +
                     '" is used by the fragment shader but not output' +
                     ' by the vertex shader');
          } else {
            this.log('Warning: varying param "' + v +
                     '" is not the same type in vertex and fragment shader');
          }
        }
      }

      var vtext = genDecls(vshader, 'attribute');
      vtext = vtext.concat(genDecls(vshader, 'uniform', uniforms),
                           genDecls(vshader, 'varying'),
                           vshader.text);

      var vertex_shader = this.loadShader(vtext.join('\n'),
                                          this.VERTEX_SHADER);
      if (!vertex_shader) {
        return null;
      }

      var ftext =
        [
          '#ifdef GL_ES',
          '  precision ' + fshader.fprecision + ' float;',
          '#endif'
        ];
      ftext = ftext.concat(genDecls(fshader, 'uniform', uniforms),
                           genDecls(fshader, 'varying'),
                           fshader.text);

      var fragment_shader = this.loadShader(ftext.join('\n'),
                                            this.FRAGMENT_SHADER);
      if (!fragment_shader) {
        this.deleteShader(vertex_shader);
        return null;
      }

      var program_obj = this.createProgram();
      if (!program_obj) {
        this.log('createProgram failed to create a program');
        this.deleteShader(vertex_shader);
        this.deleteShader(fragment_shader);
        return null;
      }

      this.attachShader(program_obj, vertex_shader);
      this.attachShader(program_obj, fragment_shader);

      var ii = 0;
      for (attrib in vshader.attribute) {
        this.bindAttribLocation(program_obj, ii, attrib);
        ii += 1;
      }

      this.linkProgram(program_obj);

      if (!this.getProgramParameter(program_obj,
                                    this.LINK_STATUS)) {
        var link_error = this.getProgramInfoLog(program_obj);
        this.log('createProgram failed to link:' + link_error);
        this.deleteProgram(program_obj);
        this.deleteShader(vertex_shader);
        this.deleteShader(fragment_shader);
        return null;
      }

      var program_wrapper = {};
      var gl = this;

      for (var uniform in uniforms) {
        var type = uniforms[uniform];
        var loc;
        if (type == 'mat4') {
          loc = [
            gl.getUniformLocation(program_obj, uniform + '0'),
            gl.getUniformLocation(program_obj, uniform + '1'),
            gl.getUniformLocation(program_obj, uniform + '2'),
            gl.getUniformLocation(program_obj, uniform + '3')
          ];
        } else if (type == 'mat3') {
          loc = [
            gl.getUniformLocation(program_obj, uniform + '0'),
            gl.getUniformLocation(program_obj, uniform + '1'),
            gl.getUniformLocation(program_obj, uniform + '2')
          ];
        } else {
          loc = gl.getUniformLocation(program_obj, uniform);
        }
        if (bind_table[type]) {
          program_wrapper[uniform] = bind_table[type](gl, loc);
        } else {
          throw 'BadTypeException';
        }
      }

      program_wrapper.bind = function() {
        gl.useProgram(program_obj);
      };

      program_wrapper.destroy = function() {
        gl.deleteProgram(program_obj);
        gl.deleteShader(vertex_shader);
        gl.deleteShader(fragment_shader);
        program_obj = null;
        vertex_shader = null;
        fragment_shader = null;
      };

      return program_wrapper;
    }

    function isSupported() {
      return window.WebGLRenderingContext ? true : false;
    }

    function createBareContext(canvas, attribs) {
      var context_types = ['webgl',
                           'experimental-webgl',
                           'webkit-3d',
                           'moz-webgl'];
      for (var type = 0; type < context_types.length; ++type) {
        var gl_context = null;
        try {
          gl_context = canvas.getContext(context_types[type], attribs);
        } catch (e) {
        }
        if (gl_context) {
          return gl_context;
        }
      }
      return null;
    }

    /**
     * extends the gl context with useful util functions
     * none of these should affect performance!
     */
    function extendContext(gl) {
      gl.log = ('console' in window) ?
        function(text_param) { window.console.log(text_param) } :
        function(text_param) {};

      gl.loadShader = function() {
        return loadShader.apply(gl, arguments);
      };

      gl.loadProgram = function() {
        return loadProgram.apply(gl, arguments);
      };

      gl.loadTextureData = function(image_element) {
        gl.texImage2D(gl.TEXTURE_2D, 0,
                      gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
                      image_element);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      };

      gl.loadTexture = function(image_element) {
        var gltexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, gltexture);
        gl.loadTextureData(image_element);
        return gltexture;
      };

      var active_draw_context = undefined;

      gl.setDrawContext = function(draw_context) {
        if (active_draw_context === draw_context) {
          return false;
        }

        if (active_draw_context && active_draw_context.unsetContext) {
          active_draw_context.unsetContext();
        }

        active_draw_context = draw_context;
        return true;
      };

      gl.isDrawContextActive = function(draw_context) {
        return active_draw_context === draw_context;
      };

      var gl_flush = gl.flush;
      gl.flush = function() {
        gl.setDrawContext(undefined);
        return gl_flush.apply(gl, arguments);
      };
    }

    function createContext(canvas, attribs) {
      var gl_context = WebGLUtil.createBareContext(canvas, attribs);
      if (!gl_context) {
        return null;
      }

      WebGLUtil.extendContext(gl_context);
      return gl_context;
    }

    var WebGLUtil = {};
    WebGLUtil.isSupported = isSupported;
    WebGLUtil.createContext = createContext;
    WebGLUtil.createBareContext = createBareContext;
    WebGLUtil.extendContext = extendContext;
    return WebGLUtil;
  })();
