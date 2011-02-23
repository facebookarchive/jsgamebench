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

var Vec = (function() {
    function equal(v1, v2) {
      if (v1[0] != v2[0])
        return false;
      if (v1[1] != v2[1])
        return false;
      return true;
    }

    function dist(v1, v2) {
      var dst = v1.slice(0, v1.length);
      var total = 0;
      for (var i = dst.length - 1; i >= 0; i--) {
        dst[i] -= v2[i];
        dst[i] *= dst[i];
        total += dst[i];
      }
      return Math.sqrt(total);
    }

    function mag(v1) {
      var dst = v1.slice(0, v1.length);
      var total = 0;
      for (var i = dst.length - 1; i >= 0; i--) {
        dst[i] *= dst[i];
        total += dst[i];
      }
      return Math.sqrt(total);
    }

    function norm(v1) {
      var dst = v1.slice(0, v1.length);
      var total = 0;
      for (var i = dst.length - 1; i >= 0; i--) {
        dst[i] *= dst[i];
        total += dst[i];
      }
      if (total) {
        total = 1.0 / Math.sqrt(total);
      } else {
        total = 1.0;
      }
      for (var i = dst.length - 1; i >= 0; i--) {
        dst[i] = v1[i] * total;
      }
      return dst;
    }

    function dot(v1, v2) {
      var dst = v1.slice(0, v1.length);
      var total = 0;
      for (var i = dst.length - 1; i >= 0; i--) {
        dst[i] *= v2[i];
        total += dst[i];
      }
      return total;
    }

    function add(pos, dv) {
      if (!dv || !pos.slice)
        console.log('xxx');
      var dst = pos.slice(0, pos.length);
      for (var i = dst.length - 1; i >= 0; i--)
        dst[i] += dv[i];
      return dst;
    }

    function sub(pos, dv) {
      if (!pos)
        console.log('no pos');
      var dst = pos.slice(0, pos.length);
      for (var i = dst.length - 1; i >= 0; i--)
        dst[i] -= dv[i];
      return dst;
    }

    function scale(pos, scale) {
      if (pos == undefined)
        console.log('w00t');
      var dst = pos.slice(0, pos.length);
      if (!scale.length) {
        for (var i = dst.length - 1; i >= 0; i--)
          dst[i] *= scale;
      } else {
        for (var i = dst.length - 1; i >= 0; i--)
          dst[i] *= scale[i];
      }
      return dst;
    }

    var Vec = {};
    Vec.equal = equal;
    Vec.dist = dist;
    Vec.mag = mag;
    Vec.norm = norm;
    Vec.dot = dot;
    Vec.add = add;
    Vec.sub = sub;
    Vec.scale = scale;
    return Vec;
  })();

exports.equal = Vec.equal;
exports.dist = Vec.dist;
exports.mag = Vec.mag;
exports.norm = Vec.norm;
exports.dot = Vec.dot;
exports.add = Vec.add;
exports.sub = Vec.sub;
exports.scale = Vec.scale;
