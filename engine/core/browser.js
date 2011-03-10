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

var exports = {}; // compatibility with nodejs

var Browser = (function() {
    var Browser = {
      CHROME: 1,
      FIREFOX: 2,
      WEBKIT: 3,
      IE: 4,
      IE9: 5,
      OPERA: 6,
      OTHER: -99,

      browser: 0,
      mobile: false,
      ios: false,
      threeD: false,
      os: '',

      winsize: [0,0],
      winpos: [0,0]
    }

    var user_agent = navigator.userAgent.toLowerCase();

    if (/chrome/.test(user_agent)) {
      Browser.browser = Browser.CHROME;
      Browser.threeD = true;
    }
    else if (/webkit/.test(user_agent)) {
      Browser.browser = Browser.WEBKIT;
      Browser.threeD = true;
    }
    else if (/gecko/.test(user_agent)) {
      Browser.browser = Browser.FIREFOX;
      Browser.threeD = false;
    }
    else if (/msie 9/.test(user_agent)) {
      Browser.browser = Browser.IE9;
      Browser.threeD = false;
    }
    else if (/msie/.test(user_agent)) {
      Browser.browser = Browser.IE;
      Browser.threeD = false;
    }
    else if (/opera/.test(user_agent)) {
      Browser.browser = Browser.OPERA;
      Browser.threeD = false;
    }
    else {
      Browser.browser = Browser.OTHER;
      Browser.threeD = false;
    }

    if (/iphone/.test(user_agent)) {
      Browser.threeD = true;
      Browser.mobile = true;
      Browser.ios = true;
      Browser.os = 'iPhone';
    }
    else if (/ipod/.test(user_agent)) {
      Browser.threeD = true;
      Browser.mobile = true;
      Browser.os = 'iPod';
    }
    else if (/ipad/.test(user_agent)) {
      Browser.threeD = true;
      Browser.mobile = true;
      Browser.ios = true;
      Browser.os = 'iPad';
    }
    else if (/os x/.test(user_agent)) {
      Browser.os = 'OS X';
    }
    else if (/android/.test(user_agent)) {
      Browser.mobile = true;
      Browser.threeD = false;
      Browser.os = 'Android';
    }
    else if (/linux/.test(user_agent)) {
      Browser.os = 'Linux';
    }
    else if (/windows phone/.test(user_agent)) {
      Browser.os = 'Win Mobile';
    }
    else if (/windows/.test(user_agent)) {
      Browser.os = 'Windows';
    }
    else {
      Browser.os = '?';
    }

    switch (Browser.browser) {
      case Browser.CHROME:
        version = user_agent.toLowerCase().match(/chrome\/([\d\w\.]+)\s/);
        if (version) {
          Browser.browser_version = 'Chrome ' + version[1].match(/(\d+)\..*/)[1];
        } else {
          Browser.browser_version = 'Chrome';
        }
        break;
      case Browser.FIREFOX:
        version = user_agent.toLowerCase().match(/firefox\/([\d\w\.]+)/);
        if (version) {
          Browser.browser_version = 'Firefox ' + version[1].match(/(\d+)\..*/)[1];
        } else {
          Browser.browser_version = 'Firefox';
        }
        break;
      case Browser.WEBKIT:
        version = user_agent.toLowerCase().match(/safari\/([\d\w\.]+)/);
        if (version) {
          Browser.browser_version = 'Safari ' + version[1].match(/(\d+)\..*/)[1];
        } else {
          Browser.browser_version = 'Safari';
        }
        break;
      case Browser.IE:
      case Browser.IE9:
        version = user_agent.toLowerCase().match(/msie ([\d\w\.]+);/);
        if (version) {
          Browser.browser_version = 'IE ' + version[1].match(/(\d+)\..*/)[1];
        } else {
          Browser.browser_version = 'IE';
        }
      break;
      case Browser.OPERA:
        version = user_agent.toLowerCase().match(/version\/([\d\w\.]+)/);
        if (version) {
          Browser.browser_version = 'Opera ' + version[1].match(/(\d+)\..*/)[1];
        } else {
          Browser.browser_version = 'Opera';
        }
        break;
    }
    Browser.browser_version = Browser.os + ' ' + Browser.browser_version;

    function getWindowSize() {
      var width = 0;
      var height = 0;

      if (typeof(window.innerWidth) == 'number') {
        width = window.innerWidth;
        height = window.innerHeight;
      } else if (document.documentElement &&
                 (document.documentElement.clientWidth ||
                  document.documentElement.clientHeight)) {
        width = document.documentElement.clientWidth;
        height = document.documentElement.clientHeight;
      } else if (document.body &&
                 (document.body.clientWidth ||
                  document.body.clientHeight)) {
        width = document.body.clientWidth;
        height = document.body.clientHeight;
      }

      Browser.winsize[0] = width;
      Browser.winsize[1] = height;
    }

    Browser.getWindowSize = getWindowSize;
    return Browser;
  })();
