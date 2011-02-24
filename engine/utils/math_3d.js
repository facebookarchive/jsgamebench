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
      res[14] = -(m[8] * m[12] + m[9] * m[13] + m[10] * m[14]);
      res[15] = 1;

      return res;
    }

    function dotVec3(v1, v2) {
      return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
    }

    // right handed
    function crossVec3(v1, v2) {
      return [
        v1[1] * v2[2] - v2[1] * v1[2],
        v2[0] * v1[2] - v1[0] * v2[2],
        v1[0] * v2[1] - v2[0] * v1[1]
      ];
    }

    function lengthVec3Squared(v) {
      return dotVec3(v, v);
    }

    function lengthVec3(v) {
      return Math.sqrt(dotVec3(v, v));
    }

    function normalizeVec3(v) {
      var length = lengthVec3(v);
      if (length !== 0) {
        var ool = 1.0 / length;
        v[0] *= ool;
        v[1] *= ool;
        v[2] *= ool;
      }
    }

    function addVec3(v1, v2) {
      return [
        v1[0] + v2[0],
        v1[1] + v2[1],
        v1[2] + v2[2]
      ];
    }

    function addVec3Self(vout, vin) {
      vout[0] += vin[0];
      vout[1] += vin[1];
      vout[2] += vin[2];
    }

    function scaleVec3(v, scale) {
      return [
        v[0] * scale,
        v[1] * scale,
        v[2] * scale
      ];
    }

    function scaleVec3Self(vout, scale) {
      vout[0] *= scale;
      vout[1] *= scale;
      vout[2] *= scale;
    }

    function orientMat4x4(mout, vforward, vup) {
      var vright = crossVec3(vforward, vup);
      var vnewup = crossVec3(vright, vforward);

      mout[0] = vright[0];
      mout[1] = vright[1];
      mout[2] = vright[2];

      mout[4] = vforward[0];
      mout[5] = vforward[1];
      mout[6] = vforward[2];

      mout[8] = vnewup[0];
      mout[9] = vnewup[1];
      mout[10] = vnewup[2];
    }

    function translateMat4x4(mout, vtrans) {
      mout[12] += vtrans[0];
      mout[13] += vtrans[1];
      mout[14] += vtrans[2];
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
    Math3D.crossVec3 = crossVec3;
    Math3D.lengthVec3Squared = lengthVec3Squared;
    Math3D.lengthVec3 = lengthVec3;
    Math3D.normalizeVec3 = normalizeVec3;
    Math3D.addVec3 = addVec3;
    Math3D.addVec3Self = addVec3Self;
    Math3D.scaleVec3 = scaleVec3;
    Math3D.scaleVec3Self = scaleVec3Self;
    Math3D.orientMat4x4 = orientMat4x4;
    Math3D.translateMat4x4 = translateMat4x4;
    Math3D.perspective = perspectiveYForward;
    return Math3D;
  })();
