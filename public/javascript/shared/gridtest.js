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

var seed = 133241;

function qrand() {
  seed = (seed * 214013 + 2531011) & 0x7fffffff;
  return seed * 1.0 / 0x7fffffff;
}

function printCmds(list) {
  console.log('\nupdate len: ' + list.length);
  for (var i = 0; i < list.length; i++) {
    var obj = list[i];
    console.log('cmd: ' + obj.cmd + ' id: ' + obj.uuid + '  ver: ' + obj.version);
  }
}

function applyChanges(grid, list) {
  for (var i = 0; i < list.length; i++) {
    var entry = list[i];
    switch (entry.cmd) {
      case 'add':
        Grid.add(grid, entry.args[0]);
        break;
      case 'remove':
        var obj = Grid.findById(grid, entry.uuid);
        Grid.remove(grid, entry.uuid);
        break;
      case 'transform':
        Grid.transform(grid, entry.uuid, entry.args[0]);
        break;
    }
  }
}

function compare(src, dst, base, pos, size) {
  if (!dst) {
    if (src)
      console.log(base + ': dst invalid');
    return;
  }
  for (var i in src) {
    var field = base + '.' + i;
    if (src[i] && typeof src[i] == 'object')
      compare(src[i], dst[i], field);
    else if (src[i] != dst[i] && i != 'version') {
      console.log('mismatch field: ' + field + ' (src: ' + src[i] + ' dst: ' + dst[i] + ')');
    }
  }
}

function compareGrids(src, dst, pos, size) {
  Grid.walkCells(src, pos, size, function(cell, x, y) {
      var src_entries = cell.entries;
      var dst_entries = dst.pos[y][x].entries;
      if (src_entries.length != dst_entries.length)
        console.log('cell length mismatch, src ' + src_entries.length + ' dst ' + dst_entries.length);
      for (var i = 0; i < src_entries.length; i++) {
        var src_obj = src_entries[i];
        var dst_obj = dst_entries[i];
        compare(src_obj, dst_obj, '');
      }
    });
}

function test() {
  var size = 10000;
  var grid = {version: 1};
  console.log('testing');
  /*
    var obj = { uuid:-42, extent:[[256,-221],[255,255]] };
    Grid.add(grid,obj);
    var list = Grid.findByArea(grid,[256,-221],[1,1025]);
    console.log('list len: ' + list.length);
    var ret = Grid.findById(grid,obj.uuid);
    if (ret)
    console.log('found: ' + ret.uuid);
    Grid.remove(grid,obj.uuid);
    Grid.add(grid,obj);
    var ret = Grid.findById(grid,obj.uuid);
    if (!ret)
    console.log('not found');
    Grid.transform(grid,obj.uuid,{extent:[[0,0],[255,255]]});
    var list = Grid.findByArea(grid,[-2,0],[2,1]);
    console.log('list len: ' + list.length);
    Grid.remove(grid,obj.uuid);
  */

  var user = {};
  var new_grid = {version: 0};
  var tnum = 100;
  var reps = 100;
  var objs = [];
  for (var j = 0; j < reps; j++) {
    for (var i = 0; i < tnum; i++) {
      var obj = objs[i];
      var op = qrand() * 10;
      if (op < 2) {
        if (obj) {
          Grid.remove(grid, obj.uuid);
          objs[i] = 0;
        } else {
          var obj = {uuid: i, extent: [[], []]};
          obj.extent[0][0] = (qrand() - 0.5) * size;
          obj.extent[0][1] = (qrand() - 0.5) * size;
          obj.extent[1][0] = qrand() * Grid.cell_size;
          obj.extent[1][1] = qrand() * Grid.cell_size;
          Grid.add(grid, obj);
          objs[i] = obj;
        }
      } else if (obj) {
        var extent = Utils.clone(obj.extent);
        extent[0][0] += qrand() * size / 2 - size / 4;
        extent[0][1] += qrand() * size / 2 - size / 4;
        Grid.transform(grid, obj.uuid, {extent: extent});
      }
    }
    var updates = GridSvr.findUpdates(user, grid, [-size / 2, -size / 2], [size, size]);
    //printCmds(updates);
    applyChanges(new_grid, updates);
    compareGrids(grid, new_grid, [-size / 2, -size / 2], [size, size]);
  }
  obj = { uuid: -42, extent: [[256, -221], [255, 255]] };
  Grid.add(grid, obj);
  updates = GridSvr.findUpdates(user, grid, [-size / 2, -size / 2], [size, size]);
  if (updates.length != 1)
    console.log('updates.length != 1');
}

exports.test = test;
