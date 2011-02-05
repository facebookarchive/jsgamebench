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

var WebGLDebug = (function() {

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

    function createContext(canvas, attribs) {
      var gl_context = WebGLUtil.createBareContext(canvas, attribs);
      if (!gl_context) {
        return null;
      }

      var last_gl_error = 0;
      var dbg_context = {};

      function errorWrapper(function_name, call_args) {
        // call the underlying WebGL function
        var result = gl_context[function_name].apply(gl_context, call_args);
        last_gl_error = gl_context.getError();
        if (last_gl_error != 0) {
          dbg_context.log('WebGL error (' +
                          dbg_context.getEnumName(last_gl_error) +
                          ') from: ' +
                          dbg_context.functionCallToString(function_name,
                                                           call_args,
                                                           result));
        }
        return result;
      }

      function createErrorWrapper(name) {
        return function() {
          return errorWrapper(name, arguments);
        };
      }

      // create wrapper context
      for (var prop in gl_context) {
        if (typeof gl_context[prop] == 'function') {
          // wrap function calls in our own function that records error
          // codes and handles call logging
          dbg_context[prop] = createErrorWrapper(prop);
        } else {
          dbg_context[prop] = gl_context[prop];
        }
      }

      // populate enum reverse lookup table the first time
      if (!enum_values_to_names) {
        enum_values_to_names = {};
        for (var prop in gl_context) {
          if (typeof gl_context[prop] == 'number') {
            enum_values_to_names[gl_context[prop]] = prop;
          }
        }
      }

      // do standard extensions after making wrapper functions so that
      // the extensions don't get wrapped
      WebGLUtil.extendContext(dbg_context);

      // override getError function with our own
      dbg_context.getError = function() {
        return last_gl_error;
      };

      dbg_context.getEnumName = function(evalue) {
        var ename = enum_values_to_names[evalue];
        return ename !== undefined ? ename : '0x' + evalue.toString(16);
      };

      dbg_context.getArgumentString = function() {
        return getArgumentString.apply(dbg_context, arguments);
      };
      dbg_context.functionCallToString = function() {
        return functionCallToString.apply(dbg_context, arguments);
      };

      return dbg_context;
    }

    var WebGLDebug = {};
    WebGLDebug.createContext = createContext;
    return WebGLDebug;
  })();
