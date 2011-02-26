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
    var gl = null;
    var initializing = false;

    var viewport;

    var sprite_context;

    var texture_table;
    var material_table;
    var model_context;

    function init(parent_id, pwidth, pheight) {

      // prevent re-entry, not perfectly safe but good enough
      if (initializing) {
        return false;
      }
      initializing = true;

      // clear out old data, if it exists
      Sprites.forEach(function(sprite) {
          sprite.gltexture = undefined;
        });
      sprite_context = null;
      texture_table = null;
      material_table = null;
      model_context = null;
      gl = null;

      // check if webgl is supported
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
          depth : true,
          stencil : false,
          antialias : true
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

      sprite_context = WebGLSprite.createContext(gl_context);
      if (!sprite_context) {
        initializing = false;
        return false;
      }

      texture_table = WebGLTexture.createTextureTable(gl_context);
      if (!texture_table) {
        sprite_context = null;
        initializing = false;
        return false;
      }

      material_table = WebGLMaterial.createMaterialTable(gl_context,
                                                         texture_table);
      if (!material_table) {
        sprite_context = null;
        texture_table = null;
        initializing = false;
        return false;
      }

      model_context = WebGLModel.createContext(gl_context,
                                               material_table);
      if (!model_context) {
        sprite_context = null;
        texture_table = null;
        material_table = null;
        initializing = false;
        return false;
      }

      viewport = {
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
      sprite_context.setViewport(viewport);
      gl.clearColor(0, 0, 0, 0);
      gl.clearDepth(1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }

    function drawSprite(framedata) {
      if (!gl) {
        return;
      }

      var sprite = framedata.sprite;
      if (!sprite.gltexture) {
        sprite.gltexture = gl.loadTexture(sprite.imageel);
        sprite.imgmulx = 1 / sprite.imageel.width;
        sprite.imgmuly = 1 / sprite.imageel.height;
      }

      var pos = [framedata.pos[0], framedata.pos[1], 0.1];
      var size = [framedata.size[0] * framedata.scale,
                  framedata.size[1] * framedata.scale];
      var texpos = [framedata.x * sprite.imgmulx,
                    framedata.y * sprite.imgmuly];
      var texsize = [framedata.size[0] * sprite.imgmulx,
                     framedata.size[1] * sprite.imgmuly];

      sprite_context.drawSprite(pos, framedata.theta, size,
                                texpos, texsize, sprite.gltexture);
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
    WebGLRender.drawSprite = drawSprite;
    WebGLRender.end = end;
    WebGLRender.isInitialized = function() { return gl !== null; };
    WebGLRender.getMaterialTable = function() { return material_table; };
    WebGLRender.getModelContext = function() { return model_context; };
    WebGLRender.getViewport = function() { return viewport; };
    return WebGLRender;
  })();
