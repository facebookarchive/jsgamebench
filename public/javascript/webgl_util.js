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
    var enum_values_to_names = null;

    var gl_function_info = {

      'activeTexture': { 0:{'type':'enum'} },
      'attachShader': { 0:{'type':'program'},
                        1:{'type':'shader'}},
      'bindAttribLocation': { 0:{'type':'program'},
                              1:{'type':'uint'},
                              2:{'type':'string'}},
      'bindBuffer': { 0:{'type':'enum'},
                      1:{'type':'buffer'}},
      'bindFramebuffer': { 0:{'type':'enum'},
                           1:{'type':'framebuffer'}},
      'bindRenderbuffer': { 0:{'type':'enum'},
                            1:{'type':'renderbuffer'}},
      'bindTexture': { 0:{'type':'enum'},
                       1:{'type':'texture'}},
      'blendColor': { 0:{'type':'clampf'},
                      1:{'type':'clampf'},
                      2:{'type':'clampf'},
                      3:{'type':'clampf'}},
      'blendEquation': { 0:{'type':'enum'} },
      'blendEquationSeparate': { 0:{'type':'enum'},
                                 1:{'type':'enum'}},
      'blendFunc': { 0:{'type':'enum'},
                     1:{'type':'enum'} },
      'blendFuncSeparate': { 0:{'type':'enum'},
                             1:{'type':'enum'},
                             2:{'type':'enum'},
                             3:{'type':'enum'}},
      'bufferData': { 0:{'type':'enum'},
                      1:{'type':'arraybuffer'},
                      2:{'type':'enum'} },
      'bufferSubData': { 0:{'type':'enum'},
                         1:{'type':'intptr'},
                         2:{'type':'arraybuffer'}},
      'checkFramebufferStatus': {99:{'type':'enum'},
                                  0:{'type':'enum'}},
      'clear': { 0:{'type':'enum'} },
      'clearColor': { 0:{'type':'clampf'},
                      1:{'type':'clampf'},
                      2:{'type':'clampf'},
                      3:{'type':'clampf'}},
      'clearDepth': { 0:{'type':'clampf'}},
      'clearStencil':{ 0:{'type':'int'}},
      'colorMask':{ 0:{'type':'bool'},
                    1:{'type':'bool'},
                    2:{'type':'bool'},
                    3:{'type':'bool'}},
      'compileShader':{ 0:{'type':'shader'}},
      'copyTexImage2D': { 0:{'type':'enum'},
                          1:{'type':'int'},
                          2:{'type':'enum'},
                          3:{'type':'int'},
                          4:{'type':'int'},
                          5:{'type':'sizei'},
                          6:{'type':'sizei'},
                          7:{'type':'int'}},
      'copyTexSubImage2D': { 0:{'type':'enum'},
                             1:{'type':'int'},
                             2:{'type':'int'},
                             3:{'type':'int'},
                             4:{'type':'int'},
                             5:{'type':'int'},
                             6:{'type':'sizei'},
                             7:{'type':'sizei'}},
      'createBuffer': {99:{'type':'buffer'}},
      'createFramebuffer': {99:{'type':'framebuffer'}},
      'createProgram': {99:{'type':'program'}},
      'createRenderbuffer': {99:{'type':'renderbuffer'}},
      'createShader': {99:{'type':'shader'},
                        0:{'type':'enum'}},
      'createTexture': {99:{'type':'texture'}},
      'cullFace': { 0:{'type':'enum'} },
      'deleteBuffer': { 0:{'type':'buffer'}},
      'deleteFramebuffer': { 0:{'type':'framebuffer'}},
      'deleteProgram': { 0:{'type':'program'}},
      'deleteRenderbuffer': { 0:{'type':'renderbuffer'}},
      'deleteShader': { 0:{'type':'shader'}},
      'deleteTexture': { 0:{'type':'texture'}},
      'depthFunc': { 0:{'type':'enum'} },
      'depthMask': { 0:{'type':'bool'} },
      'depthRange': { 0:{'type':'clampf'},
                      1:{'type':'clampf'}},
      'detachShader': { 0:{'type':'program'},
                        1:{'type':'shader'}},
      'disable': { 0:{'type':'enum'} },
      'disableVertexAttribArray': { 0:{'type':'uint'} },
      'drawArrays': { 0:{'type':'enum'},
                      1:{'type':'int'},
                      2:{'type':'sizei'}},
      'drawElements': { 0:{'type':'enum'},
                        1:{'type':'sizei'},
                        2:{'type':'enum'},
                        3:{'type':'intptr'}},
      'enable': { 0:{'type':'enum'}},
      'enableVertexAttribArray': { 0:{'type':'uint'} },
      'finish': {},
      'flush': {},
      'framebufferRenderbuffer': { 0:{'type':'enum'},
                                   1:{'type':'enum'},
                                   2:{'type':'enum'},
                                   3:{'type':'renderbuffer'}},
      'framebufferTexture2D': { 0:{'type':'enum'},
                                1:{'type':'enum'},
                                2:{'type':'enum'},
                                3:{'type':'texture'},
                                4:{'type':'int'}},
      'frontFace': { 0:{'type':'enum'} },
      'generateMipmap': { 0:{'type':'enum'} },
      'getActiveAttrib': {99:{'type':'activeinfo'},
                           0:{'type':'program'},
                           1:{'type':'uint'}},
      'getActiveUniform': {99:{'type':'activeinfo'},
                            0:{'type':'program'},
                            1:{'type':'uint'}},
      'getAttachedShaders': {99:{'type':'shader[]'},
                              0:{'type':'program'}},
      'getAttribLocation': {99:{'type':'int'},
                             0:{'type':'program'},
                             1:{'type':'string'}},
      'getParameter': {99:{'type':'any'},
                        0:{'type':'enum'}},
      'getBufferParameter': {99:{'type':'any'},
                              0:{'type':'enum'},
                              1:{'type':'enum'}},
      'getFramebufferAttachmentParameter': {99:{'type':'any'},
                                             0:{'type':'enum'},
                                             1:{'type':'enum'},
                                             2:{'type':'enum'}},
      'getProgramParameter': {99:{'type':'any'},
                               0:{'type':'program'},
                               1:{'type':'enum'}},
      'getProgramInfoLog': {99:{'type':'string'},
                             0:{'type':'program'}},
      'getRenderbufferParameter': {99:{'type':'any'},
                                    0:{'type':'enum'},
                                    1:{'type':'enum'}},
      'getShaderParameter': {99:{'type':'any'},
                              0:{'type':'shader'},
                              1:{'type':'enum'}},
      'getShaderInfoLog': {99:{'type':'string'},
                            0:{'type':'shader'}},
      'getShaderSource': {99:{'type':'string'},
                           0:{'type':'shader'}},
      'getTexParameter': {99:{'type':'any'},
                           0:{'type':'enum'},
                           1:{'type':'enum'}},
      'getUniform': {99:{'type':'any'},
                      0:{'type':'program'},
                      1:{'type':'uniformlocation'}},
      'getUniformLocation': {99:{'type':'uniformlocation'},
                              0:{'type':'program'},
                              1:{'type':'string'}},
      'getVertexAttrib': {99:{'type':'any'},
                           0:{'type':'uint'},
                           1:{'type':'enum'}},
      'getVertexAttribOffset': {99:{'type':'sizeiptr'},
                                 0:{'type':'uint'},
                                 1:{'type':'enum'}},
      'hint': { 0:{'type':'enum'},
                1:{'type':'enum'}},
      'isBuffer': {99:{'type':'bool'},
                    0:{'type':'buffer'}},
      'isEnabled': {99:{'type':'bool'},
                    0:{'type':'enum'}},
      'isFramebuffer': {99:{'type':'bool'},
                         0:{'type':'framebuffer'}},
      'isProgram': {99:{'type':'bool'},
                     0:{'type':'program'}},
      'isRenderbuffer': {99:{'type':'bool'},
                          0:{'type':'renderbuffer'}},
      'isShader': {99:{'type':'bool'},
                    0:{'type':'shader'}},
      'isTexture': {99:{'type':'bool'},
                     0:{'type':'texture'}},
      'lineWidth': { 0:{'type':'float'} },
      'linkProgram': { 0:{'type':'program'} },
      'pixelStorei': { 0:{'type':'enum'},
                       1:{'type':'int'} },
      'polygonOffset': { 0:{'type':'float'},
                         1:{'type':'float'}},
      'readPixels': { 0:{'type':'int'},
                      1:{'type':'int'},
                      2:{'type':'sizei'},
                      3:{'type':'sizei'},
                      4:{'type':'enum'},
                      5:{'type':'enum'},
                      6:{'type':'arraybufferview'}},
      'renderbufferStorage': { 0:{'type':'enum'},
                               1:{'type':'enum'},
                               2:{'type':'sizei'},
                               3:{'type':'sizei'}},
      'sampleCoverage': { 0:{'type':'clampf'},
                          1:{'type':'bool'}},
      'scissor': { 0:{'type':'int'},
                   1:{'type':'int'},
                   2:{'type':'sizei'},
                   3:{'type':'sizei'}},
      'shaderSource': { 0:{'type':'shader'},
                        1:{'type':'string'}},
      'stencilFunc': { 0:{'type':'enum'},
                       1:{'type':'int'},
                       2:{'type':'uint'}},
      'stencilFuncSeparate': { 0:{'type':'enum'},
                               1:{'type':'enum'},
                               2:{'type':'int'},
                               3:{'type':'uint'}},
      'stencilMask': { 0:{'type':'uint'} },
      'stencilMaskSeparate': { 0:{'type':'enum'},
                               1:{'type':'uint'}},
      'stencilOp': { 0:{'type':'enum'},
                     1:{'type':'enum'},
                     2:{'type':'enum'} },
      'stencilOpSeparate': { 0:{'type':'enum'},
                             1:{'type':'enum'},
                             2:{'type':'enum'},
                             3:{'type':'enum'} },
      'texImage2D': { 0:{'type':'enum'},
                      1:{'type':'int'},
                      2:{'type':'enum'},
                      3:{'type':'enum'},
                      4:{'type':'enum'},
                      5:{'type':'imageelement'}},
      'texParameterf': { 0:{'type':'enum'},
                         1:{'type':'enum'},
                         2:{'type':'float'}},
      'texParameteri': { 0:{'type':'enum'},
                         1:{'type':'enum'},
                         2:{'type':'int'}},
      'texSubImage2D': { 0:{'type':'enum'},
                         1:{'type':'int'},
                         2:{'type':'int'},
                         3:{'type':'int'},
                         4:{'type':'enum'},
                         5:{'type':'enum'},
                         6:{'type':'imageelement'}},
      'useProgram': { 0:{'type':'program'} },
      'validateProgram': { 0:{'type':'program'} },
      'vertexAttribPointer': { 0:{'type':'uint'},
                               1:{'type':'int'},
                               2:{'type':'enum'},
                               3:{'type':'bool'},
                               4:{'type':'sizei'},
                               5:{'type':'intptr'}},
      'viewport': { 0:{'type':'int'},
                    1:{'type':'int'},
                    2:{'type':'sizei'},
                    3:{'type':'sizei'}},
    };

    function getArgumentString(function_name, arg_index, value) {
      if (value == undefined) {
        return '(undefined)';
      }
      var func_info = gl_function_info[function_name];
      if (func_info) {
        var arg_info = func_info[arg_index];
        if (arg_info) {
          switch (arg_info['type']) {
            case 'enum':
              return this.getEnumName(value);
            case 'bool':
              return value ? 'true' : 'false';
            case 'arraybuffer':
            case 'buffer':
            case 'framebuffer':
            case 'intptr':
            case 'program':
            case 'renderbuffer':
            case 'shader':
            case 'texture':
              return value.toString();
            case 'imageelement':
              return '<' +
                     (value.name ? value.name : value.id) +
                     '>';
          }
        }
      }
      return value.toString();
    }

    function functionCallToString(function_name,
                                  call_arguments,
                                  return_value) {
      var callstr = function_name + '(';
      for (var arg_idx = 0; arg_idx < call_arguments.length; ++arg_idx) {
        callstr += arg_idx == 0 ? '' : ', ';
        callstr += this.getArgumentString(function_name,
                                          arg_idx,
                                          call_arguments[arg_idx]);
      }
      callstr += ')';
      if (return_value) {
        callstr += ' => ';
        callstr += this.getArgumentString(function_name,
                                          99,
                                          return_value);
      }
      return callstr;
    }

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
    bind_table['vec2'] = function(gl, loc) {
      return function(x, y) {
        gl.uniform2f(loc, x, y);
      }
    };

    bind_table['vec3'] = function(gl, loc) {
      return function(x, y, z) {
        gl.uniform3f(loc, x, y, z);
      }
    };

    bind_table['vec4'] = function(gl, loc) {
      return function(x, y, z, w) {
        gl.uniform4f(loc, x, y, z, w);
      }
    };

    bind_table['sampler2D'] = function(gl, loc) {
      return function(s) {
        gl.uniform1i(loc, s);
      }
    };

    function loadProgram(vshader, fshader) {
      var uniforms = {};

      function genDecls(obj, name, accum) {
        var text = '';
        var nobj = obj[name];
        for (var o in nobj) {
          text += name + ' ' + nobj[o] + ' ' + o + ';\n';
          if (accum) {
            accum[o] = nobj[o];
          }
        }
        return text;
      }

      var vtext = genDecls(vshader, 'attribute');
      vtext += genDecls(vshader, 'uniform', uniforms);
      vtext += genDecls(vshader, 'varying');
      vtext += vshader.text;

      var vertex_shader = this.loadShader(vtext, this.VERTEX_SHADER);
      if (!vertex_shader) {
        return null;
      }

      var ftext =
        '#ifdef GL_ES\n' +
        '  precision ' + fshader.fprecision + ' float;\n' +
        '#endif\n';
      ftext += genDecls(fshader, 'uniform', uniforms);
      ftext += genDecls(fshader, 'varying');
      ftext += fshader.text;

      var fragment_shader = this.loadShader(ftext, this.FRAGMENT_SHADER);
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
        var loc = gl.getUniformLocation(program_obj, uniform);
        var type = uniforms[uniform];
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
    function extendContext(gl_context, dbg_context) {
      // populate enum reverse lookup table the first time
      if (!enum_values_to_names) {
        enum_values_to_names = {};
        for (var prop in gl_context) {
          if (typeof gl_context[prop] == 'number') {
            enum_values_to_names[gl_context[prop]] = prop;
          }
        }
      }

      gl_context.log = ('console' in window) ?
        function(text_param) { window.console.log(text_param) } :
        function(text_param) {};

      dbg_context.log = gl_context.log;

      gl_context.getEnumName = function(evalue) {
        var ename = enum_values_to_names[evalue];
        return ename !== undefined ? ename : '0x' + evalue.toString(16);
      };

      gl_context.getArgumentString = function() {
        return getArgumentString.apply(gl_context, arguments);
      };
      gl_context.functionCallToString = function() {
        return functionCallToString.apply(gl_context, arguments);
      };
      dbg_context.loadShader = function() {
        return loadShader.apply(dbg_context, arguments);
      };
      dbg_context.loadProgram = function() {
        return loadProgram.apply(dbg_context, arguments);
      };

      return gl_context;
    }

    function createContext(canvas, attribs) {
      var gl_context = WebGLUtil.createBareContext(canvas, attribs);
      if (!gl_context) {
        return null;
      }

      WebGLUtil.extendContext(gl_context, gl_context);
      return gl_context;
    }

    var WebGLUtil = {};
    WebGLUtil.isSupported = isSupported;
    WebGLUtil.createContext = createContext;
    WebGLUtil.createBareContext = createBareContext;
    WebGLUtil.extendContext = extendContext;
    return WebGLUtil;
  })();
