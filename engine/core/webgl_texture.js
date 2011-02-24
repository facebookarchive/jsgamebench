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

var WebGLTexture = (function() {

    function createTextureTable(gl) {
      var texture_table = {};
      var texture_dictionary = {};

      texture_table.getTexture = function(name) {
        var texture = texture_dictionary[name];
        if (!texture) {
          texture = {};
          texture_dictionary[name] = texture;

          var gl_texture = gl.createTexture();

          var image_data_ready = false;
          var texture_image = new Image();
          texture_image.onload = function() {
            image_data_ready = true;
          };

          texture.bindGLTexture = function() {
            gl.bindTexture(gl.TEXTURE_2D, gl_texture);

            if (image_data_ready) {
              gl.loadTextureData(texture_image);
              image_data_ready = false;
            }
          };

          // load it in the background
          texture_image.src = name;
        }
      };
    }

    var WebGLTexture = {};
    WebGLTexture.createTextureTable = createTextureTable;
    return WebGLTexture;
  })();

