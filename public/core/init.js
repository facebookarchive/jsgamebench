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

var Init = (function() {
    var routed = false;
    var app_init_func = 0;

    var setupFunc = null;
    var commsFunc = null;
    var appFunc = null;
    var uiFunc = null;
    var drawFunc = null;
    var teardownFunc = null;

    function setFunctions(args) {
      if (args.setup)
        setupFunc = args.setup;
      else
        setupFunc = function() {};

      if (args.comms)
        commsFunc = args.comms;
      else
        commsFunc = function() {};

      if (args.app)
        appFunc = args.app;
      else
        appFunc = function() {};

      if (args.ui)
        uiFunc = args.ui;
      else
        uiFunc = function() {};

      drawFunc = args.draw;

      if (args.teardown)
        teardownFunc = args.teardown;
      else
        teardownFunc = function() {};
    }

    function quit() {
      Xhr.toServer({cmd: 'logout', args: []});
    }

    function delatedStart() {
    }

    function timer_kick_off() {
      JSGlobal.TIMERS_LAUNCHED = true;
      Render.setupBrowserSpecific();
      setInterval('Init.tick();', 1);
      Xhr.toServer({cmd: '', args: []});
      UI.hookUIEvents('gamebody');

      if (stand_alone) {
        Game.initStandalone();
      }
    }

    function tick() {
      Tick.tick();
      if (Sprites.fullyLoaded()) {
        appFunc();
        drawFunc();
      } else {
        Tick.reset();
      }
      uiFunc();
    }

    function reset() {
      var gbel = document.getElementById('gamebody');
      gbel.innerHTML = '';

      var path = window.location.pathname;

      commsFunc();

      if (app_init_func) {
        !routed && app_init_func();
        routed = true;
      }
      GameFrame.setFrame('gamebody', 'gameframe', 'gameframe',
                         {left: JSGlobal.winpos[0],
                             top: JSGlobal.winpos[1],
                             width: JSGlobal.winsize[0],
                             height: JSGlobal.winsize[1],
                             overflow: 'overflow-x:hidden;overflow-y:auto;'},
                         '#fff');

      GameFrame.setViewport('gameframe', 'gameviewport', 'gameviewport',
                         {left: JSGlobal.winpos[0],
                             top: JSGlobal.winpos[1] + GameFrame.settings.offset,
                             width: JSGlobal.winsize[0],
                             height: JSGlobal.winsize[1] - GameFrame.settings.offset},
                            '#fff');

      GameFrame.layout();
      setTimeout("Init.hideBar();", 100);
    }


    function hideBar() {
      window.scrollTo(0,1);
    }


    function winresize() {
      Render.setupBrowserSpecific();

      var meta_viewport = document.querySelector("meta[name=viewport]");
      if (meta_viewport && window.devicePixelRatio >= 2 ) {
        JSGlobal.lowres = false;
        meta_viewport.setAttribute('content', 'user-scalable=no, width=device-width, height=device-height, initial-scale=0.5, maximum-scale=0.5');
      } else if (JSGlobal.mobile) {
        JSGlobal.lowres = true;
      }


      var last_width = JSGlobal.winsize[0];
      var last_height = JSGlobal.winsize[1];

      Clientutils.getWindowSize();

      if (JSGlobal.mobile) {
        JSGlobal.winsize[1] += 176;
      }

      var width = JSGlobal.winsize[0];
      var height = JSGlobal.winsize[1];

      if (last_height == height && last_width == width) {
        return;
      }

      JSGlobal.winpos[0] = 0;
      JSGlobal.winpos[1] = 0;
      JSGlobal.winsize[0] = width;
      JSGlobal.winsize[1] = height;

      GameFrame.setXbyY();
    }

    function init(init_func) {
      if (!drawFunc) {
        alert("No draw function set. You need to call Init.setFunctions from your code prior to the page's onload event firing.");
        return;
      }

      setupFunc();

      app_init_func = init_func;
      if (fb_app_id) {
        if (document.getElementById('fb-root')) {
          FB.init({
              appId  : fb_app_id,
                status : true, // check login status
                cookie : true, // enable cookies to allow the server to access the session
                xfbml  : false  // parse XFBML
                });
          FB.getLoginStatus(function(response) {
              if (response.session) {
                client_user.fb_logged_in = true;
                console.log('logged in');
              } else {
                client_user.fb_logged_in = false;
                console.log('not logged in');
              }
            });
        }
      }
      winresize();
      timer_kick_off();
    }

    var Init = {};
    Init.init = init;
    Init.winresize = winresize;
    Init.quit = quit;
    Init.tick = tick;
    Init.reset = reset;
    Init.hideBar = hideBar;
    Init.setFunctions = setFunctions;
    return Init;
  })();
