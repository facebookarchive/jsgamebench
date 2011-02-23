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
    var initFunc = null;
    var setupFunc = null;
    var appFunc = null;
    var uiFunc = null;
    var drawFunc = null;
    var teardownFunc = null;
    var quitFunc = null;
    var resizeFunc = null;
    var maxFPS = 1000;

    function setFunctions(args) {
      if (args.init)
        initFunc = args.init;
      else
        initFunc = function() {};

      if (args.setup)
        setupFunc = args.setup;
      else
        setupFunc = function() {};

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

      if (args.resize)
        resizeFunc = args.resize;
      else
        resizeFunc = function() {};

      if (args.quit)
        quitFunc = args.quit;
      else
        quitFunc = function() {};

      if (args.fps)
        maxFPS = args.fps;
    }

    function quit() {
      quitFunc();
    }

    function delatedStart() {
    }

    function timer_kick_off() {
      JSGlobal.TIMERS_LAUNCHED = true;
      Render.setupBrowserSpecific();
      setInterval('Init.tick();', parseInt(1000/maxFPS));
      initFunc();
      winresize();
      reset();
    }

    function tick() {
      if (Sprites.fullyLoaded()) {
        Tick.tick();
        appFunc();
        drawFunc();
      }
      uiFunc();
    }

    function reset() {
      teardownFunc();

      var gbel = document.getElementById('gamebody');
      gbel.innerHTML = '';

      var path = window.location.pathname;

      setupFunc();

      GameFrame.setXbyY();
    }


    function hideBar() {
      window.scrollTo(0,1);
      GameFrame.setXbyY();
      resizeFunc();
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

      var width = JSGlobal.winsize[0];
      var height = JSGlobal.winsize[1];

      if (last_height == height && last_width == width) {
        return;
      }

      JSGlobal.winpos[0] = 0;
      JSGlobal.winpos[1] = 0;

      GameFrame.setXbyY();
      resizeFunc();
      if (JSGlobal.mobile) {
        setTimeout("Init.hideBar();", 1);
      }
    }

    function init() {
      if (!drawFunc) {
        alert("No draw function set. You need to call Init.setFunctions from your code prior to the page's onload event firing.");
        return;
      }
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
