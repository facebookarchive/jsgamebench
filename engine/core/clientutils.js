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

var Clientutils = (function() {
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

      JSGlobal.winsize[0] = width;
      JSGlobal.winsize[1] = height;
    }

    var Clientutils = {};
    Clientutils.getWindowSize = getWindowSize;
    return Clientutils;
  })();
