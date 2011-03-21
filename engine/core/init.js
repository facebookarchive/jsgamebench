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
    var spritesLoaded = false;

    function setFunctions(args) {
      initFunc = args.init || function() {};
      setupFunc = args.setup || function() {};
      appFunc = args.app || function() {};
      uiFunc = args.ui || function() {};
      drawFunc = args.draw || function() {};
      teardownFunc = args.teardown || function() {};
      resizeFunc = args.resize || function() {};
      quitFunc = args.quit || function() {};
      postLoad = args.postLoad || function() {};
      maxFPS = args.fps || undefined;
    }

     function quit() {
      quitFunc();
    }

    function delatedStart() {
    }

    function timer_kick_off() {
      Render.setupBrowserSpecific();
      setInterval('Init.tick();', parseInt(1000/maxFPS));
      initFunc();
      winresize();
      setupFunc();
    }

    function tick() {
      if (Sprites.fullyLoaded()) {
        if (!spritesLoaded) {
          postLoad();
          spritesLoaded = true;
        }
        Tick.tick();
        appFunc();
        drawFunc();
      }
      uiFunc();
    }

    function reset() {
      teardownFunc();

      var gbel = window.document.getElementById('gamebody');
      gbel.innerHTML = '';

      var path = window.location.pathname;

      setupFunc();

      GameFrame.setXbyY();
    }

    function hideBar() {
      window.scrollTo(0,1);
      var hidediv = window.document.getElementById('hidebardiv');
      if (hidediv)
        window.document.body.removeChild(hidediv);
      Browser.getWindowSize();
      GameFrame.setXbyY();
      resizeFunc();
    }

    function winresize() {
      var last_width = Browser.winsize[0];
      var last_height = Browser.winsize[1];

      Browser.getWindowSize();

      var width = Browser.winsize[0];
      var height = Browser.winsize[1];

      if (last_height == height && last_width == width) {
        return;
      }

      console.log("res:"+height + ":" +last_height);
      console.log("res:"+width + ":" +last_width);

      Browser.winpos[0] = 0;
      Browser.winpos[1] = 0;
      if ((window==window.top) && Browser.mobile) {
        var hidediv = window.document.getElementById('hidebardiv');
        if (!hidediv) {
          hidediv = window.document.createElement('div');
          hidediv.id = 'hidebardiv';
          hidediv.style.cssText = 'position:absolute;z-index:10000;left:0px;top:-1000px;width:5000px;height:5000px;background:#000';
          window.document.body.appendChild(hidediv);
          setTimeout("Init.hideBar();", 100);
        }
      } else  {
        GameFrame.setXbyY();
        resizeFunc();
      }
    }

    function init() {
      // in case we left in some debugging by accident
      // we might want to add the ability to hook this and send it to a server for mobile
      if (typeof(console) == 'undefined') {
        console = {};
      }
      console.log = console.log || function() {};

      if (!drawFunc) {
        alert("No draw function set. You need to call Init.setFunctions from your code prior to the page's onload event firing.");
        return;
      }
      Render.setupBrowserSpecific();

      if (window == window.top) {
        var meta_viewport = window.document.querySelector &&
          window.document.querySelector("meta[name=viewport]");
        if (meta_viewport && window.devicePixelRatio >= 2 ) {
          Browser.lowres = false;
          meta_viewport.setAttribute('content', 'user-scalable=no, width=device-width, height=device-height, initial-scale=0.5, maximum-scale=0.5');
        } else if (Browser.mobile) {
          Browser.lowres = true;
        }
      }

      timer_kick_off();

      if ((window == window.top) && Browser.mobile) {
        var hidediv = window.document.getElementById('hidebardiv');
        if (!hidediv) {
          hidediv = window.document.createElement('div');
          hidediv.id = 'hidebardiv';
          hidediv.style.cssText = 'position:absolute;z-index:10000;left:0px;top:-1000px;width:5000px;height:5000px;background:#000';
          window.document.body.appendChild(hidediv);
          setTimeout("Init.hideBar();", 10);
        }
      }
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
