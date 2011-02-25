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

    //
    // 4x4 matrices are arrays of 16 numbers, arranged in column major order:
    // matrix4x4[x * 4 + y]
    //
    // 4x3 matrices are arrays of 12 numbers, arranged in column major order:
    // matrix4x4[x * 3 + y]
    //
    // vectors are arrays of 3 numbers
    //

    //************************ matrix functions ************************/

    function dupMat4x4(min) {
      var mout = [];
      for (var ii = 0; ii < min.length; ++ii) {
        mout[ii] = min[ii];
      }
      return mout;
    }

    function copyMat4x4(mout, min) {
      for (var ii = 0; ii < min.length; ++ii) {
        mout[ii] = min[ii];
      }
      return mout;
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

    //************************ vector functions ************************/

    function dupVec3(v) {
      return [v[0], v[1], v[2]];
    }

    function copyVec3(vout, vin) {
      vout[0] = vin[0];
      vout[1] = vin[1];
      vout[2] = vin[2];
      return vout;
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
      return vout;
    }

    function subVec3(v1, v2) {
      return [
        v1[0] - v2[0],
        v1[1] - v2[1],
        v1[2] - v2[2]
      ];
    }

    function subVec3Self(vout, vin) {
      vout[0] -= vin[0];
      vout[1] -= vin[1];
      vout[2] -= vin[2];
      return vout;
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
      return vout;
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
      return length;
    }

    function distanceVec3(v1, v2) {
      return lengthVec3(subVec3(v1, v2));
    }

    function distanceVec3Squared(v1, v2) {
      return lengthVec3Squared(subVec3(v1, v2));
    }

    //************************ projection matrices ************************/

    // right handed, Z up, Y forward
    function perspectiveZUp(l, r, b, t, n, f) {
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

    // this is the opengl default, right handed, Y up, negative Z forward
    function perspectiveYUp(l, r, b, t, n, f) {
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

    //************************ intersection ************************/

    function boxSphereCollision(sphere_mid, sphere_radius,
                                box_min, box_max, box_mid, box_radius) {
      // sphere-sphere check
      var dist_sq = distanceVec3Squared(sphere_mid, box_mid);
      var r = sphere_radius + box_radius;
      if (dist_sq > r * r) {
        // not colliding
        return false;
      }

      var sphere_min = [
        sphere_mid[0] - sphere_radius,
        sphere_mid[1] - sphere_radius,
        sphere_mid[2] - sphere_radius
      ];
      var sphere_max = [
        sphere_mid[0] + sphere_radius,
        sphere_mid[1] + sphere_radius,
        sphere_mid[2] + sphere_radius
      ];

      // box-box check
      if (box_min[0] > sphere_max[0] || sphere_min[0] > box_max[0] ||
          box_min[1] > sphere_max[1] || sphere_min[1] > box_max[1] ||
          box_min[2] > sphere_max[2] || sphere_min[2] > box_max[2]) {
        return false;
      }

      return true;
    }

    function lineSphereIntersection(sphere_mid, sphere_radius,
                                    line_start, line_vector) {
      var result = { t: -1 };

      var c = subVec3(sphere_mid, line_start);
      var v2 = dotVec3(line_vector, line_vector);
      var vc = dotVec3(c, line_vector);
      var c2 = dotVec3(c, c);
      var r2 = sphere_radius * sphere_radius;

      var a = vc * vc - v2 * (c2 - r2);
      if (a < 0) {
        return result;
      }
      a = Math.sqrt(a);

      var t1 = (vc + a) / v2;
      var t2 = (vc - a) / v2;
      if (t1 < 0 || t1 > 1) {
        t1 = -1;
      }
      if (t2 < 0 || t2 > 1) {
        t2 = -1;
        result.t = t1;
      } else if (t1 < 0) {
        result.t = t2;
      } else if (t1 < t2) {
        result.t = t1;
      } else {
        result.t = t2;
      }

      if (result.t >= 0) {
        result.p = addVec3(line_start, scaleVec3(line_vector, result.t));
        result.n = subVec3(result.p, sphere_mid);
        normalizeVec3(result.n);
      }

      return result;
    }

    function lineBoxIntersection(box_min, box_max,
                                 line_start, line_vector) {
      var result = { t: 100 };
      var ti = -1;
      var ts = 0;
      for (var ii = 0; ii < 3; ++ii) {
        if (line_vector[ii] != 0) {
          var tmin = (box_min[ii] - line_start[ii]) / line_vector[ii];
          var tmax = (box_max[ii] - line_start[ii]) / line_vector[ii];
          if (tmin >= 0 && tmin <= 1 && tmin < result.t) {
            result.t = tmin;
            ti = ii;
            ts = -1;
          }
          if (tmax >= 0 && tmax <= 1 && tmax < result.t) {
            result.t = tmax;
            ti = ii;
            ts = 1;
          }
        }
      }

      if (ti < 0) {
        result.t = -1;
      }

      if (result.t >= 0) {
        result.p = addVec3(line_start, scaleVec3(line_vector, result.t));
        result.n = [0,0,0];
        result.n[ti] = ts;
      }

      return result;
    }

    function sweptSphereBoxIntersection(box_min, box_max,
                                        box_mid, box_radius,
                                        old_sphere_mid, new_sphere_mid,
                                        sphere_radius) {
      // transform the problem into line intersections

      var sphere_vector = subVec3(new_sphere_mid, old_sphere_mid);

      var mod_box_min = dupVec3(box_min);
      mod_box_min[0] -= sphere_radius;
      mod_box_min[1] -= sphere_radius;
      mod_box_min[2] -= sphere_radius;

      var mod_box_max = dupVec3(box_max);
      mod_box_max[0] += sphere_radius;
      mod_box_max[1] += sphere_radius;
      mod_box_max[2] += sphere_radius;

      // test line against expanded box
      var result1 = lineBoxIntersection(mod_box_min, mod_box_max,
                                        old_sphere_mid, sphere_vector);

      if (result1.t < 0) {
        return result1;
      }

      var mod_box_radius = box_radius + sphere_radius;

      // test line against expanded box bounding sphere
      var result2 = lineSphereIntersection(box_mid, mod_box_radius,
                                           old_sphere_mid, sphere_vector);

      // whichever intersection is farther is the correct result
      if (result1.t > result2.t) {
        return result1;
      }
      return result2;
    }

    //************************ exports ************************/

    var Math3D = {};

    Math3D.mat3x3 = function() { return [1,0,0, 0,1,0, 0,0,1]; };
    Math3D.mat4x4 = function() { return [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]; };
    Math3D.dupMat4x4 = dupMat4x4;
    Math3D.copyMat4x4 = copyMat4x4;
    Math3D.orientMat4x4 = orientMat4x4;
    Math3D.translateMat4x4 = translateMat4x4;
    Math3D.mulMat4x4 = mulMat4x4;
    Math3D.fastInvertMat4x4 = fastInvertMat4x4;

    Math3D.dupVec3 = dupVec3;
    Math3D.copyVec3 = copyVec3;
    Math3D.dotVec3 = dotVec3;
    Math3D.crossVec3 = crossVec3;
    Math3D.addVec3 = addVec3;
    Math3D.addVec3Self = addVec3Self;
    Math3D.subVec3 = subVec3;
    Math3D.subVec3Self = subVec3Self;
    Math3D.scaleVec3 = scaleVec3;
    Math3D.scaleVec3Self = scaleVec3Self;
    Math3D.lengthVec3Squared = lengthVec3Squared;
    Math3D.lengthVec3 = lengthVec3;
    Math3D.normalizeVec3 = normalizeVec3;
    Math3D.distanceVec3 = distanceVec3;
    Math3D.distanceVec3Squared = distanceVec3Squared;

    Math3D.boxSphereCollision = boxSphereCollision;
    Math3D.lineSphereIntersection = lineSphereIntersection;
    Math3D.lineBoxIntersection = lineBoxIntersection;
    Math3D.sweptSphereBoxIntersection = sweptSphereBoxIntersection;

    Math3D.perspectiveZUp = perspectiveZUp;
    Math3D.perspectiveYUp = perspectiveYUp;

    return Math3D;
  })();
