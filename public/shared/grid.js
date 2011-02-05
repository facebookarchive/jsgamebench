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

// add, del, move
// collide, trigger near, raycast, pathfind, send diff, render
// obj: uuid, extent

// grid
// version
// pos[][] - 2d array of cells
// cell:
// version
// entries[] - obj pointers

var Grid = (function() {
    var clock_skew = 0;
    var cell_size = 1024;
    function cellSnap(p) {
      var t = parseInt((p + (1 << 24)) / cell_size, 10);
      t -= (1 << 24) / cell_size;
      return parseInt(t, 10);
    }

    function findCell(grid,pos) {
      var x = cellSnap(pos[0]);
      var y = cellSnap(pos[1]);
      if (grid.pos[y]) {
       return grid.pos[y][x];
      }
    }

    function link(grid,obj) {
      if (obj.extent[1][0] >= cell_size || obj.extent[1][1] >= cell_size)
        console.log('object is bigger than max cell size! ' + obj.extent[1] + ' >= ' + [cell_size, cell_size]);
      var x = cellSnap(obj.extent[0][0]);
      var y = cellSnap(obj.extent[0][1]);
      grid.pos[y] = grid.pos[y] || [];
      var cell = grid.pos[y][x] = grid.pos[y][x] || {};
      cell.entries = cell.entries || [];
      cell.entries.push(obj);
      return cell;
    }

    function debugObjCellPos(grid,obj) {
      for(var y=0;y<grid.pos.length;y++) {
        for(var x=0;x<grid.pos[y].length;x++) {
          var cell = grid.pos[y][x];
          for(var i=0;i<cell.entries.length;i++) {
            if (cell.entries[i] == obj) {
              console.log('obj is in cell: ' + x + ' ' + y);
            }
          }
        }
      }
    }

    function unlink(grid,obj) {
      var cell = findCell(grid, obj.extent[0]);
      if (cell) {
        var entries = cell.entries;
        for (var i = 0; i < entries.length; i++) {
          if (entries[i].uuid == obj.uuid) {
            entries.splice(i, 1);
            return cell;
          }
        }
      }
      console.log('cant find for unlink: ' + obj.uuid + ' (name = '+obj.name+')');
      console.log('was expected in cell: ' + cellSnap(obj.extent[0][0]) + ' ' + cellSnap(obj.extent[0][1]));
    }

    function addCommand(grid,cell,cmd_name,uuid,args) {
      if (!cell) {
        return;
      }
      var obj = findById(grid, uuid);
      if (!obj) {
        return;
      }
      if (grid.version) {
        var version = ++grid.version;
        obj.version = version;
      }
      if (!(cell.version >= obj.version))
      cell.version = obj.version;
    }

    function setFieldVersions(grid, obj, options) {
      if (!grid.version)
        return;
      var uuid = obj.uuid;
      grid.field_versions = grid.field_versions || {};
      var fields = grid.field_versions[uuid] = grid.field_versions[uuid] || {};
      for(var i in options) {
        fields[i] = obj.version;
      }
    }

    function add(grid,obj) {
      obj.date = (new Date).getTime();
      grid.uuids = grid.uuids || {};
      grid.pos = grid.pos || [];
      if (grid.uuids[obj.uuid]) {
        return grid.uuids[obj.uuid];
        console.log('dup add: ' + obj.uuid);
        a = a / b;
      }
      grid.uuids[obj.uuid] = obj;
      var cell = link(grid, obj);
      addCommand(grid, cell, 'add', obj.uuid, [obj]);
      setFieldVersions(grid,obj,obj);
      return obj;
    }

    function remove(grid,uuid) {
      var obj = grid.uuids[uuid];
      if (!obj) {
        console.log('cant find for remove: ' + uuid);
        return;
      }
      obj.date = (new Date).getTime() + clock_skew;
      //console.log("remove from p("+obj.extent[0][0]+","+obj.extent[0][1]+")");
      var cell = unlink(grid, obj);
      addCommand(grid, cell, 'remove', uuid, [uuid]);
      delete grid.uuids[uuid];
      if (grid.field_versions && grid.field_versions[uuid]) {
        delete grid.field_versions[uuid];
      }
      grid.removeCB && grid.removeCB(uuid);
      return obj;
    }

    function transform(grid,uuid,options) {
      var obj = grid.uuids[uuid];
      if (!obj) {
        console.log('cant find for update: ' + uuid);
        return;
      }
      if (!options.date) {
        options.date = (new Date).getTime();
      }
      var cell = findCell(grid, obj.extent[0]);
      if (!cell) {
        // FIXMEBRUCE - should only need to call this for objects the client is controlling
        var local = Grid.findById(grid,uuid);
        if (local) {
          cell = findCell(grid, local.extent[0]);
        }
      }
      if (options.extent) {
        new_cell = findCell(grid, options.extent[0]);
        if (new_cell != cell)
          cell = 0;
         /*
        if (obj.name == 'ship') {
          var x = cellSnap(obj.extent[0][0]);
          var y = cellSnap(obj.extent[0][1]);
          console.log('pos: ' + obj.extent[0] + 'grid: ' + [x,y]);
        }
        */
      }
      if (!cell) {
        unlink(grid, obj);
      }
      for (var i in options)
        obj[i] = options[i];
      if (!cell) {
       cell = link(grid, obj);
      }
      addCommand(grid, cell, 'transform', uuid, [uuid, options]);
      setFieldVersions(grid,obj,options);
      return obj;
    }

    function findById(grid,uuid) {
      return grid.uuids[uuid];
    }

    function walkCells(grid,pos,size,cb) {
      var start_x = cellSnap(pos[0]) - 1;
      var y = cellSnap(pos[1]) - 1;
      var cx = cellSnap(pos[0] + size[0]);
      var cy = cellSnap(pos[1] + size[1]);
      for (; y <= cy; y++) {
        for (var x = start_x; x <= cx; x++) {
          if (!grid.pos || !grid.pos[y])
            continue;
          var cell = grid.pos[y][x];
          if (cell)
            cb(cell, x, y);
        }
      }
    }

    function findByArea(grid,pos,size) {
      var list = [];
      walkCells(grid, pos, size, function(cell,x,y) {
          var entries = cell.entries;
          for (var i = 0; i < entries.length; i++) {
            var obj = entries[i];
            if (Mathx.overlap(obj.extent[0], obj.extent[1], pos, size)) {
              list.push(obj);
            }
          }
        });
      return list;
    }

    function setClockSkew(skew) {
      Grid.clock_skew = clock_skew;
    }
    
    var Grid = {};
    Grid.add = add;
    Grid.remove = remove;
    Grid.transform = transform;
    Grid.findByArea = findByArea;
    Grid.findById = findById;
    Grid.walkCells = walkCells;
    Grid.cell_size = cell_size;
    Grid.debugObjCellPos = debugObjCellPos;
    Grid.setClockSkew = setClockSkew;
    return Grid;
  })();

exports.debugObjCellPos = Grid.debugObjCellPos;
exports.add = Grid.add;
exports.remove = Grid.remove;
exports.transform = Grid.transform;
exports.findByArea = Grid.findByArea;
exports.findById = Grid.findById;
exports.walkCells = Grid.walkCells;
exports.cell_size = Grid.cell_size;
