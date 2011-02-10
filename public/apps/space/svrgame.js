// Copyright 2004-present Facebook, Inc.

// Licensed under the Apache License, Version 2.0 (the "License"); you may
// not use this file except in compliance with the License. You may obtain
// a copy of the License at

//     http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.

var SvrGame = (function() {

  var tiles = [];
  var world_grid = {version: 1, idx: 0};
  var ent_grid = {version: 1, idx: 1};
  var g_grids = [world_grid, ent_grid];
  var live_ents = [];

  var gem_names = ['GemGreen', 'GemBlue', 'GemOrange'];
  var tile_names = ['DirtBlock', 'PlainBlock', 'StoneBlock'];
  var shots = ['shot'];
  var playfield_radius = 1600;

  function addAsteroid() {
    var r = playfield_radius * 0.9;
    var x = Math.sin(Math.random()*2*Math.PI) * r * Math.random();
    var y = Math.cos(Math.random()*2*Math.PI) * r * Math.random();
    var obj = {};
    obj.uuid = Utils.uuidv4();
    obj.extent = [[x, y], [100, 120]];
    obj.name = 'rock';
    obj.spin = Math.random()*1.4+0.7;
    if (Math.random() < 0.5) {
      obj.spin = -obj.spin;
    }
    Grid.add(ent_grid, obj);
  }

  function init(grids) {
    if (grids) {
      world_grid = g_grids[0] = grids[0];
      ent_grid = g_grids[1] = grids[1];
    }
    var grid = world_grid;

    var total = 100;
    for(var i=0;i<total;i++) {
      var x = Math.sin(i*2*Math.PI / total) * playfield_radius;
      var y = Math.cos(i*2*Math.PI / total) * playfield_radius;
      var obj = {};
      obj.uuid = Utils.uuidv4();
      obj.extent = [[x, y], [100, 120]];
      obj.name = 'wall';
      Grid.add(world_grid, obj);
    }
    for(var i=0;i<50;i++) {
      addAsteroid();
    }
  }


  function shoot(user,pos,vel) {
    var obj = {};
    obj.uuid = Utils.uuidv4();
    obj.extent = [pos, [32, 32]];
    obj.name = shots[user.idx % shots.length];
    obj.vel = Vec.scale(vel,40);
    obj.ttl = 50;
    obj.shot = 1;
    obj.owner = user.owned_uuid;
    obj = Grid.add(ent_grid, obj);
    live_ents.push(obj);
    console.log('shoot: '+pos+' ' + vel);
  }

  function explode(user, uuid) {
    var hit = Grid.findById(ent_grid, uuid);
    if (!hit || hit.name != 'rock') {
      return;
    }
    var pos = Utils.clone(hit.extent[0]);
    Grid.remove(ent_grid, uuid);

    var obj = { uuid:Utils.uuidv4(), name:'boom', ttl:59, extent:[pos, [100, 100]] };

    obj = Grid.add(ent_grid, obj);
    live_ents.push(obj);

    pos = Utils.clone(hit.extent[0]);
    obj = { uuid:Utils.uuidv4(), name:'powerup', ttl:400, extent:[pos, [100, 100]] };

    obj = Grid.add(ent_grid, obj);
    live_ents.push(obj);
    addAsteroid();
    var owner = Grid.findById(ent_grid,user.owned_uuid);
    if (owner) {
      var points = (owner.points || 0) + 1;
      Grid.transform(ent_grid, user.owned_uuid, {points:points});
    }
  }

  function tick() {
    for(var i=live_ents.length-1;i>=0;i--) {
      var ent = live_ents[i];
      if (ent.vel) {
        var extent = Utils.clone(ent.extent);
        extent[0] = Vec.add(ent.extent[0], ent.vel);
        Grid.transform(ent_grid, ent.uuid, {extent: extent});
      }
      if (--ent.ttl <= 0) {
        Grid.remove(ent_grid,ent.uuid);
        live_ents.splice(i,1);
      }
    }
  }

  Cmds.install('shoot', shoot);
  Cmds.install('explode', explode);

  var SvrGame = {};
  SvrGame.tick = tick;
  SvrGame.shoot = shoot;
  SvrGame.explode = explode;
  SvrGame.init = init;
  SvrGame.grids = g_grids;
  return SvrGame;
  })();

exports.overlap = Mathx.overlap;



exports.tick = SvrGame.tick;
exports.shoot = SvrGame.shoot;
exports.explode = SvrGame.explode;
exports.init = SvrGame.init;
exports.grids = SvrGame.grids;

