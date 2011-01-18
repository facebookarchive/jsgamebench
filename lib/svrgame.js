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
  obj.name = 'asteroid';
  obj.spin = Math.random()*1.4+0.7;
  if (Math.random() < 0.5) {
    obj.spin = -obj.spin;
  }
  Grid.add(ent_grid, obj);
}

function init() {
  var grid = world_grid;

  var total = 100;
  for(var i=0;i<total;i++) {
    var x = Math.sin(i*2*Math.PI / total) * playfield_radius;
    var y = Math.cos(i*2*Math.PI / total) * playfield_radius;
    var obj = {};
    obj.uuid = Utils.uuidv4();
    obj.extent = [[x, y], [100, 120]];
    obj.name = 'Rock';
    Grid.add(world_grid, obj);
  }
  for(var i=0;i<50;i++) {
    addAsteroid();
  }
}

/*
  for (var y = 0; y < 20; y++) {
    tiles[y] = [];
    for (var x = 0; x < 20; x++) {
      var obj = {};
      obj.uuid = Utils.uuidv4();
      obj.extent = [[x * 100, y * 120], [100, 120]];
      obj.name = 'DirtBlock';
      if ((x == 3 && y == 3) || (x == 14 && y == 3))
        obj.name = 'Rock';
      Grid.add(grid, obj);
      tiles[y][x] = obj;
    }
  }
*/


function tagTile(user,uuid,tile_pos) {
  user.color = gem_names[(user.idx % gem_names.length)];
  var x = parseInt(tile_pos[0]);
  var y = parseInt(tile_pos[1]);
  if (tiles[y])
    var obj = tiles[y][x];
  if (obj && obj.name != user.color) {
    Grid.transform(world_grid, uuid, {name: user.color});
    fillConnected(x, y, user.color);
  }
}

function getVal(t,x,y) {
  var line = t[y];
  if (line) {
    var obj = line[x];
    if (obj) {
      return obj.name;
    }
  }
}

function checkPerimeter(start_x,start_y,end_x,end_y,match)
{
  var x, y;

  for (x = start_x; x <= end_x; x++) {
    if (getVal(tiles, x, start_y) == match || getVal(tiles, x, end_y) == match) {
      return 1;
    }
  }
  for (y = start_y; y <= end_y; y++) {
    if (getVal(tiles, start_x, y) == match || getVal(tiles, end_x, y) == match) {
      return 1;
    }
  }
  return 0;
}

function getBounds(x,y,match) {
  var start_x = x;
  var end_x = x;
  var start_y = y;
  var end_y = y;
  for (;;) {
    start_x = Math.max(start_x - 1, -1);
    start_y = Math.max(start_y - 1, -1);
    end_x = Math.min(end_x + 1, tiles[0].length);
    end_y = Math.min(end_y + 1, tiles.length);
    if (!checkPerimeter(start_x, start_y, end_x, end_y, match))
      break;
    // console.log('curr: ' + [start_x,start_y]+'  '+[end_x,end_y]);
  }
  //console.log('bounds: '+[end_x-start_x,end_y-start_y]+'  '+
  //[start_x,start_y] + ' to ' + [end_x,end_y]);
  return [[start_x, start_y], [end_x, end_y]];
}

function printRect(rect) {
  var txt = '';
  for (var y = 0; y < rect.length; y++) {
    for (var x = 0; x < rect[y].length; x++) {
      txt += ' ' + rect[y][x];
    }
    txt += '\n';
  }
  //console.log(txt);
}

function fillConnected(x,y,match) {
  var bounds = getBounds(x, y, match);
  var min = bounds[0];
  var max = bounds[1];
  var rect = [];
  for (var y = min[1]; y <= max[1]; y++) {
    var line = [];
    for (var x = min[0]; x <= max[0]; x++) {
      var val = getVal(tiles, x, y);
      line.push(val ? val : 0);
    }
    rect.push(line);
  }
  // console.log('rect size: ' + [rect.length,rect[0].length]);
  printRect(rect);
  var count = floodFill(rect, 0, 0, match);
  //console.log('result');
  printRect(rect);
  if (giveBonus(rect, min, max, match)) {
    clearPerimeter(rect, min, max, match);
  }
}


function giveBonus(rect,min,max,match) {
  var bonus = 0;
  for (var y = 0; y < rect.length; y++) {
    for (var x = 0; x < rect[y].length; x++) {
      var tx = x + min[0];
      var ty = y + min[1];
      var obj = tiles[ty] && tiles[ty][tx];
      if (rect[y][x] != match) {
        Grid.transform(world_grid, obj.uuid, {name: 'star'});
        bonus++;
      }
    }
  }
  return bonus;
}

function clearPerimeter(rect,min,max,match) {
  for (var y = 0; y < rect.length; y++) {
    for (var x = 0; x < rect[y].length; x++) {
      var tx = x + min[0];
      var ty = y + min[1];
      var obj = tiles[ty] && tiles[ty][tx];
      if (obj && obj.name == match) {
        Grid.transform(world_grid, obj.uuid, {name: 'star'});
      }
    }
  }
}

var Stack = [];

function floodFill(rect, x, y, match) {
  fillPixel(rect, x, y, match);

  while (Stack.length > 0) {
    toFill = Stack.pop();
    fillPixel(rect, toFill[0], toFill[1], match);
  }
}

function fillPixel(rect, x, y, match) {
  if (!alreadyFilled(rect, x, y, match)) fill(rect, x, y, match);

  if (!alreadyFilled(rect, x, y - 1, match)) Stack.push([x, y - 1]);
  if (!alreadyFilled(rect, x + 1, y, match)) Stack.push([x + 1, y]);
  if (!alreadyFilled(rect, x, y + 1, match)) Stack.push([x, y + 1]);
  if (!alreadyFilled(rect, x - 1, y, match)) Stack.push([x - 1, y]);
}

function fill(rect, x, y, match) {
  rect[y][x] = match;
}

function alreadyFilled(rect, x, y, match) {
  var line = rect[y];
  if (!line) {
    return true;
  }
  if (line[x] == undefined) {
    return true;
  }
  return line[x] == match;
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
  if (!hit || hit.name != 'asteroid') {
    return;
  }
  Grid.transform(ent_grid, uuid, {name: 'boom', frame: 0, spin: 1});
  hit.ttl = 59;
  live_ents.push(hit);
  var pos = Utils.clone(hit.extent[0]);
  var uuid = Utils.uuidv4();
  var obj = { uuid:uuid, name:'powerup', ttl:400, extent:[pos, [100, 100]] };
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

exports.tick = tick;
exports.shoot = shoot;
exports.explode = explode;
exports.init = init;
exports.tagTile = tagTile;
exports.grids = g_grids;

