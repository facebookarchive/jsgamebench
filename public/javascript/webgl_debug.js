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

    function errorWrapper(gl_context, function_name, call_arguments) {
      // call the underlying WebGL function
      var result = gl_context[function_name].apply(gl_context, call_arguments);
      last_gl_error = gl_context.getError();
      if (last_gl_error != 0) {
        gl_context.log('WebGL error (' +
                       gl_context.getEnumName(last_gl_error) +
                       ') from: ' +
                       gl_context.functionCallToString(function_name,
                                                       call_arguments,
                                                       result));
      }
      return result;
    }

    function createContext(canvas, attribs) {
      var gl_context = WebGLUtil.createBareContext(canvas, attribs);
      if (!gl_context) {
        return null;
      }

      var last_gl_error = 0;

      function createErrorWrapper(name) {
        return function() {
          return errorWrapper(gl_context, name, arguments);
        };
      }

      // create wrapper context
      var dbg_context = {};
      for (var prop in gl_context) {
        if (typeof gl_context[prop] == 'function') {
          // wrap function calls in our own function that records error
          // codes and handles call logging
          dbg_context[prop] = createErrorWrapper(prop);
        } else {
          dbg_context[prop] = gl_context[prop];
        }
      }

      // do standard extensions after making wrapper functions so that
      // the extensions don't get wrapped
      WebGLUtil.extendContext(gl_context, dbg_context);

      // override getError function with our own
      dbg_context.getError = function() {
        return last_gl_error;
      };

      return dbg_context;
    }

    var WebGLDebug = {};
    WebGLDebug.createContext = createContext;
    return WebGLDebug;
  })();
