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

var Mathx = (function() {
    function overlap(pos_a, size_a, pos_b, size_b) {
      var i, len;
      for (i = 0, len = pos_a.length; i < len; i++) {
        if (pos_a[i] + size_a[i] < pos_b[i]) {
          return false;
        }
      }
      for (i = 0, len = pos_b.length; i < len; i++) {
        if (pos_b[i] + size_b[i] < pos_a[i]) {
          return false;
        }
      }
      return true;
    }

    var Mathx = {};
    Mathx.overlap = overlap;
    return Mathx;
  })();

exports.overlap = Mathx.overlap;

