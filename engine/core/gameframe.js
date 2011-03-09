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

var GameFrame = (function() {
    var WEBGL = 'webgl';
    var WEBGL3D = 'webgl3d';
    var CANVAS_ONLY = 'canvas';
    var CANVAS_HTML_HYBRID = 'hybrid';
    var HTML_ONLY = 'html';

    var settings = {
      render_mode: HTML_ONLY,
      last_render_mode: -1,
      update_existing: true,
      css_transitions: false,
      transition_time: 3000,
      multi_img: false,
      use_div_background: true,
      canvas_background: true,
      sprite_sheets: true,
      css_keyframe: true,
      int_snap: true,
      transform3d: true,
      webgl_blended_canvas: false,
      webgl_debug: false,
      offset: 0,
      hidefps: false,
      viewport: 'fluid'
    };

    function updateSettings(newset, force_rendermode) {
      if (newset.css_transitions) {
        if (Browser.browser != Browser.CHROME && Browser.browser != Browser.WEBKIT) {
          newset.css_transitions = false;
        }
      }
      if (newset.transform3d && !Browser.threeD) {
        newset.transform3d = false;
      }
      if (newset.render_mode == CANVAS_ONLY) {
        newset.css_transitions = false;
      }
      for (var id in newset) {
        if (settings[id] !== undefined) {
          settings[id] = newset[id];
        }
      }
      if (force_rendermode) {
        settings.last_render_mode = -1;
      }
    }

    var kbhandler = null;
    var mousemove = null;
    var mousebutton = null;
    var mousewheel = null;
    var targetfps = 60;

    var gameframe = {};
    var gameviewport = {};
    var gamebackground = {};

    function checkRenderMode() {
      if (settings.render_mode != settings.last_render_mode) {
        if (!settings.render_mode)
          render_mode = HTML_ONLY;
        settings.last_render_mode = settings.render_mode;
        Tick.reset();
        Render.setAllDirty();
        var viewel = document.getElementById(gameviewport.id);
        viewel.innerHTML = '';
        var backgroundel = document.getElementById('gamebackground');
        backgroundel.innerHTML = '';
        switch (settings.render_mode) {
          case WEBGL:
            WebGLRender.init(gameviewport.id,
                             gameviewport.dstyle.width,
                             gameviewport.dstyle.height);
            break;
          case WEBGL3D:
            WebGLRender.init(gameviewport.id,
                             gameviewport.dstyle.width,
                             gameviewport.dstyle.height);
            break;
          case CANVAS_ONLY:
            CanvasRender.init(gameviewport.id,
                              gameviewport.dstyle.width,
                              gameviewport.dstyle.height,
                              gameviewport.dstyle.width,
                              gameviewport.dstyle.height);
            break;
          default:
            break;
        }
      }
    }

    function makeDiv(parentid, id, dclass, dstyle, color, hidden, add) {
      var pel = document.getElementById(parentid);
      if (pel) {
        var stylestr = '';
        stylestr += dstyle && dstyle.left ? 'left:' + dstyle.left + 'px;' : 'left:0px;';
        stylestr += dstyle && dstyle.top ? 'top:' + dstyle.top + 'px;' : 'top:0px;';
        stylestr += dstyle && dstyle.width ? 'width:' + dstyle.width + 'px;' : 'width:100%;';
        stylestr += dstyle && dstyle.height ? 'height:' + dstyle.height + 'px;' : 'height:100%;';
        stylestr += dstyle && dstyle.zindex ? 'z-index:' + dstyle.zindex + ';' : 'z-index:2;';
        stylestr += color ? 'background:' + color + ';' : '';
        var overflow = (dstyle && dstyle.overflow) || '';
        if (add) {
          pel.innerHTML += '<div id="' + id + '" class="' + dclass + '"' +
            (hidden ?
             ' style="position:absolute;' + overflow + ';visibility:hidden;' :
             ' style="position:absolute;' + overflow + ';') +
            stylestr + '"></div>';
        } else {
          pel.innerHTML = '<div id="' + id + '" class="' + dclass + '"' +
            (hidden ?
             ' style="position:absolute;' + overflow + ';visibility:hidden' :
             ' style="position:absolute;' + overflow + ';') +
            stylestr + '"></div>';
        }
      }
    }

    function setFrame(parentid, id, dclass, dstyle, color) {
      gameframe.parentid = parentid;
      gameframe.id = id;
      gameframe.dclass = dclass;
      gameframe.dstyle = dstyle;
      gameframe.color = color;
    }

    function getFrame() {
      return gameframe;
    }

    function setViewport(parentid, id, dclass, dstyle, color) {
      gameviewport.parentid = parentid;
      gameviewport.id = id;
      gameviewport.dclass = dclass;
      gameviewport.dstyle = dstyle;
      gameviewport.color = color;

      gamebackground = Utils.clone(gameviewport);
      gamebackground.dstyle.zindex = 1;
    }

    function getViewport() {
      return gameviewport;
    }

    function layout() {
      makeDiv(gameframe.parentid, gameframe.id, gameframe.dclass, gameframe.dstyle, gameframe.color);
      makeDiv(gameviewport.parentid, gameviewport.id, gameviewport.dclass, gameviewport.dstyle, null);
      makeDiv(gameviewport.parentid, 'gamebackground', '', gamebackground.dstyle, gamebackground.color, false, true);
      makeDiv(gameframe.id, 'spritecache', '', null, null, true, true);
      UI.init(gameframe.id);
      Render.setAllDirty();
      checkRenderMode();
    }

    function setKBHandler(func) {
      kbhandler = func;
    }

    function setMouseMove(func) {
      mousemove = func;
    }

    function setMouseButton(func) {
      mousebutton = func;
    }

    function setMouseWheel(func) {
      mousewheel = func;
    }

    function setTargetFPS(fps) {
      targetfps = fps;
    }

    function getTargetMSperFrame() {
      return parseInt(1000 / targetfps, 10);
    }

    function page2view(pos) {
      return [pos[0] - gameviewport.dstyle.left - gameframe.dstyle.left, pos[1] - gameviewport.dstyle.top - gameframe.dstyle.top];
    }

    function setXbyY(viewport) {
      var viewports = {fluid: [null, null], fluid_width: [null, 640], normal: [960, 640], tiny: [320,320]};
      if (viewport) {
        settings.viewport = viewport;
      } else {
        viewport = settings.viewport;
      }
      Browser.w = viewports[viewport][0] || Browser.winsize[0];
      Browser.h = viewports[viewport][1] || Browser.winsize[1];
      Browser.h -= settings.offset;

      setFrame('gamebody', 'gameframe', 'gameframe',
                         {left: Browser.winpos[0],
                             top: Browser.winpos[1],
                             width: Browser.winsize[0],
                             height: Browser.winsize[1]},
                         '#f2f2f2');

      var midx = 0.5 * (Browser.winsize[0] - Browser.winpos[0]);
      var midy = settings.offset*0.5 + 0.5 * (Browser.winsize[1] - (Browser.winpos[1]));

      setViewport('gameframe', 'gameviewport', 'gameviewport',
                            {left: midx - (Browser.w * 0.5),
                                top: midy - (Browser.h * 0.5),
                             width: Browser.w,
                             height: Browser.h},
                            '#112');
      layout();
      updateSettings({},true);
      checkRenderMode();
      Render.setAllDirty();
    }


    var GameFrame = {};
    GameFrame.WEBGL = WEBGL;
    GameFrame.WEBGL3D = WEBGL3D;
    GameFrame.CANVAS_ONLY = CANVAS_ONLY;
    GameFrame.CANVAS_HTML_HYBRID = CANVAS_HTML_HYBRID;
    GameFrame.HTML_ONLY = HTML_ONLY;
    GameFrame.settings = settings;
    GameFrame.updateSettings = updateSettings;
    GameFrame.checkRenderMode = checkRenderMode;
    GameFrame.setFrame = setFrame;
    GameFrame.getFrame = getFrame;
    GameFrame.setViewport = setViewport;
    GameFrame.getViewport = getViewport;
    GameFrame.setKBHandler = setKBHandler;
    GameFrame.SetMouseMove = setMouseMove;
    GameFrame.setMouseButton = setMouseButton;
    GameFrame.setMouseWheel = setMouseWheel;
    GameFrame.setTargetFPS = setTargetFPS;
    GameFrame.getTargetMSperFrame = getTargetMSperFrame;
    GameFrame.layout = layout;
    GameFrame.page2view = page2view;
    GameFrame.setXbyY = setXbyY;
    return GameFrame;
  })();
