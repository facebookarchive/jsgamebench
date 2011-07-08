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

var TrenchProjectile = (function() {

    var projectile_pool = [];
    var projectile_model;

    function init(model) {
      projectile_model = model;
      for (var ii = 0; ii < projectile_pool.length; ++ii) {
        if (typeof proj !== 'undefined') {
          World3D.updateDynamic(proj.id, projectile_model);
        }
      }
    }

    function destroy(proj) {
      World3D.removeDynamic(proj.id);
      projectile_pool[proj.idx] = undefined;
    }

    function collisionHandler(result) {
      result.source.lifespan = 0;
      return true;
    }

    function reset() {
      for (var ii = 0; ii < projectile_pool.length; ++ii) {
        if (typeof proj !== 'undefined') {
          destroy(proj);
        }
      }
    }

    function tick(dt) {
      for (var ii = 0; ii < projectile_pool.length; ++ii) {
        var proj = projectile_pool[ii];
        if (typeof proj === 'undefined') {
          continue;
        }

        proj.lifespan -= dt;
        if (proj.lifespan <= 0) {
          destroy(proj);
          continue;
        }

        var proj_matrix = Math3D.mat4x4();
        var delta = Math3D.scaleVec3(proj.vel, dt);
        Math3D.addVec3Self(proj.pos, delta);
        Math3D.scaleMat4x4(proj_matrix, proj.radius);
        proj_matrix[12] = proj.pos[0] - proj.radius * 0.5;
        proj_matrix[13] = proj.pos[1] - proj.radius * 0.5;
        proj_matrix[14] = proj.pos[2] - proj.radius * 0.5;

        if (typeof proj.id === 'undefined') {
          proj.id = World3D.addDynamic(projectile_model, proj_matrix,
                                       proj.pos, proj.radius, proj);
        } else {
          World3D.moveDynamic(proj.id, proj_matrix, proj.pos, null);
        }
      }
    }

    function create(origin, velocity, radius, lifespan, owner) {
      var proj = {};
      proj.pos = Math3D.dupVec3(origin);
      proj.vel = Math3D.dupVec3(velocity);
      proj.radius = radius;
      proj.lifespan = lifespan;
      proj.owner = owner;

      // insert into pool
      proj.idx = projectile_pool.length;
      for (var ii = 0; ii < proj.idx; ++ii) {
        if (typeof projectile_pool[ii] === 'undefined') {
          proj.idx = ii;
        }
      }
      projectile_pool[proj.idx] = proj;

      return proj;
    }

    var TrenchProjectile = {};
    TrenchProjectile.init = init;
    TrenchProjectile.reset = reset;
    TrenchProjectile.tick = tick;
    TrenchProjectile.create = create;
    return TrenchProjectile;
  })();
