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

var Math3D = (function() {

    function mulMat4x4(m1, m2) {
      var res = [];
      for (var ii = 0; ii < 4; ++ii) {
        var r = ii * 4;
        res[r+0] = m1[0]  * m2[r+0] + m1[4]  * m2[r+1] +
                   m1[8]  * m2[r+2] + m1[12] * m2[r+3];
        res[r+1] = m1[1]  * m2[r+0] + m1[5]  * m2[r+1] +
                   m1[9]  * m2[r+2] + m1[13] * m2[r+3];
        res[r+2] = m1[2]  * m2[r+0] + m1[6]  * m2[r+1] +
                   m1[10] * m2[r+2] + m1[14] * m2[r+3];
        res[r+3] = m1[3]  * m2[r+0] + m1[7]  * m2[r+1] +
                   m1[11] * m2[r+2] + m1[15] * m2[r+3];
      }
      return res;
    }

    function fastInvertMat4x4(m) {
      var res = [];
      res[0] = m[0];
      res[1] = m[4];
      res[2] = m[8];
      res[3] = 0;

      res[4] = m[1];
      res[5] = m[5];
      res[6] = m[9];
      res[7] = 0;

      res[8] = m[2];
      res[9] = m[6];
      res[10] = m[10];
      res[11] = 0;

      res[12] = -(m[0] * m[12] + m[1] * m[13] + m[2]  * m[14]);
      res[13] = -(m[4] * m[12] + m[5] * m[13] + m[7]  * m[14]);
      res[14] = -(m[8] * m[12] + m[9] * m[13] + m[11] * m[14]);
      res[15] = 1;

      return res;
    }

    function dotVec3(v1, v2) {
      return [ v1[0] * v2[0], v1[1] * v2[1], v1[2] * v2[2] ];
    }

    // right handed, y forward, z up
    function perspectiveYForward(l, r, b, t, n, f) {
      var res = [];
      var oorl = 1.0 / (r - l);
      var ootb = 1.0 / (t - b);
      var oofn = 1.0 / (f - n);
      var twon = 2.0 * n;

      res[0] = twon * oorl;
      res[1] = res[2] = res[3] = 0;

      res[4] = (r + l) * oorl;
      res[5] = (t + b) * ootb;
      res[6] = (f + n) * oofn;
      res[7] = 1;

      res[8] = 0;
      res[9] = twon * ootb;
      res[10] = res[11] = 0;

      res[12] = res[13] = 0;
      res[14] = -twon * f * oofn;
      res[15] = 0;
      return res;
    }

    // left handed, z forward; requires fewer camera code hacks
    function perspectiveZForward(l, r, b, t, n, f) {
      var res = [];
      var oorl = 1.0 / (r - l);
      var ootb = 1.0 / (t - b);
      var oofn = 1.0 / (f - n);
      var twon = 2.0 * n;

      res[0] = twon * oorl;
      res[1] = res[2] = res[3] = 0;

      res[4] = 0;
      res[5] = twon * ootb;
      res[6] = res[7] = 0;

      res[8] = (r + l) * oorl;
      res[9] = (t + b) * ootb;
      res[10] = (f + n) * oofn;
      res[11] = 1;

      res[12] = res[13] = 0;
      res[14] = -twon * f * oofn;
      res[15] = 0;
      return res;
    }

    // this is the opengl default, right handed
    function perspectiveZBackward(l, r, b, t, n, f) {
      var res = [];
      var oorl = 1.0 / (r - l);
      var ootb = 1.0 / (t - b);
      var oofn = 1.0 / (f - n);
      var twon = 2.0 * n;

      res[0] = twon * oorl;
      res[1] = res[2] = res[3] = 0;

      res[4] = 0;
      res[5] = twon * ootb;
      res[6] = res[7] = 0;

      res[8] = (r + l) * oorl;
      res[9] = (t + b) * ootb;
      res[10] = -(f + n) * oofn;
      res[11] = -1;

      res[12] = res[13] = 0;
      res[14] = -twon * f * oofn;
      res[15] = 0;
      return res;
    }

    var Math3D = {};
    Math3D.mat3x3 = function() { return [1,0,0, 0,1,0, 0,0,1]; };
    Math3D.mat4x4 = function() { return [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]; };
    Math3D.mulMat4x4 = mulMat4x4;
    Math3D.fastInvertMat4x4 = fastInvertMat4x4;
    Math3D.dotVec3 = dotVec3;
    Math3D.perspective = perspectiveYForward;
    return Math3D;
  })();
