#! /usr/bin/env node

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

sys = require('sys');
fs = require('fs');
path = require('path');
util = require('util');

Array.prototype.each = function(callback) {
  for (var ii = 0; ii < this.length; ++ii) {
    callback(this[ii], ii);
  }
  return this;
};

Array.prototype.remap = function(callback) {
  for (var ii = 0; ii < this.length; ++ii) {
    this[ii] = callback(this[ii], ii);
  }
  return this;
};

Array.prototype.setSize = function(size, val) {
  for (var ii = 0; ii < size; ++ii) {
    if (this[ii] === undefined) {
      this[ii] = val;
    }
  }
  for (var ii = size; ii < this.length; ++ii) {
    this[ii] = undefined;
  }
  this.length = size;
  return this;
};

Array.prototype.remove = function(val) {
  var modified = [];
  for (var ii = 0; ii < this.length; ++ii) {
    if (this[ii] !== val) {
      modified.push(this[ii]);
    }
  }
  return modified;
};

function keys(object) {
  var keys = [];
  for (var property in object) {
    keys.push(property);
  }
  return keys;
}

function values(object) {
  var values = [];
  for (var property in object) {
    values.push(object[property]);
  }
  return values;
}

function toInt(val) {
  if (!val) {
    return 0;
  }
  return parseInt(val);
}

function toFloat(val) {
  if (!val) {
    return 0;
  }
  return parseFloat(val);
}

function toIntIndex(val) {
  if (!val) {
    return 0;
  }
  if (val === ' ') {
    return 0;
  }
  return parseInt(val) - 1;
}

function parseObj(filedata, file_options) {
  var cur_material = 'default';
  var raw_verts = { 0:[], 1:[], 2:[] };
  var vert_refs = {};
  var inv_vert_refs = [];
  var faces = {};

  var type_sizes = [3,2,3];

  function addVert(type, val) {
    val.setSize(type_sizes[type], '0');
    raw_verts[type].push(val.remap(toFloat));
  }

  function addFace(val) {
    var vrs = [];

    for (var ii = 0; ii < val.length; ++ii) {
      // parse to int and decrement to get 0-based indices
      var vidxs = val[ii].split('/').remap(toIntIndex);
      var vhash = vidxs.setSize(3, 0).join('/');

      if (vert_refs[vhash] === undefined) {
        vert_refs[vhash] = inv_vert_refs.length;
        inv_vert_refs.push(vhash);
      }

      vrs.push(vert_refs[vhash]);
    }

    if (!faces[cur_material]) {
      faces[cur_material] = [];
    }

    for (var ii = 2; ii < vrs.length; ++ii) {
      faces[cur_material].push(vrs[0]);
      faces[cur_material].push(vrs[ii-1]);
      faces[cur_material].push(vrs[ii]);
    }
  }

  // parse object file and execute its instructions
  filedata.split('\n').each(function(str) {
      if (str.length <= 1) {
        return;
      }
      var params = str.split(' ');
      var cmd = params.shift();
      params = params.remove('');
      switch (cmd) {
        case 'v':
          addVert(0, params);
          break;
        case 'vt':
          addVert(1, params);
          break;
        case 'vn':
          addVert(2, params);
          break;
        case 'f':
          addFace(params);
          break;
        case 'usemtl':
          cur_material = params.join(' ');
          break;
        default:
          break;
      }
    });

  // util.print('Finished parsing\n');

  // explode raw verts into final interleaved form
  var vert_array = [];
  inv_vert_refs.each(function(vhash) {
      var vidx = vhash.split('/').remap(toInt);
      var vert = [];
      for (var ii = 0; ii < 3; ++ii) {
        if (raw_verts[ii].length <= vidx[ii]) {
          raw_verts[ii][vidx[ii]] = [].setSize(type_sizes[ii], 0);
        }
        vert = vert.concat(raw_verts[ii][vidx[ii]]);
      }
      if (vert.length !== 8) {
        throw {name:'Invalid vertex data!'};
      }

      vert[0] *= file_options.model_scale;
      vert[1] *= file_options.model_scale;
      vert[2] *= file_options.model_scale;
      if (file_options.invert_y_texcoord) {
        vert[4] = 1.0 - vert[4];
      }
      if (file_options.transform_z_up) {
        // transform position
        var oldy = vert[1];
        vert[1] = -vert[2];
        vert[2] = oldy;

        // transform normal
        oldy = vert[6];
        vert[6] = -vert[7];
        vert[7] = oldy;
      }
      vert_array = vert_array.concat(vert);
    });

  // util.print('Finished interleaving\n');

  // concat face data from each group
  var face_array = [];
  var materials = [];
  var index_counts = [];
  materials = keys(faces);
  materials.sort();
  materials.each(function(material, idx) {
      face_array = face_array.concat(faces[material]);
      index_counts[idx] = faces[material].length;
    });

  // util.print('Finished face sorting\n');

  var ret = {
      verts: vert_array,
      indices: face_array,
      materials: materials,
      counts: index_counts
    };

  return ret;
}

var files = fs.readdirSync('.');
files.each(function(filename) {

    var flen = filename.length;
    if (flen < 5 || filename.slice(-4) !== '.obj') {
      return;
    }

    util.print('\n' + filename + '\n');

    var filenameBase = filename.slice(0, -4);

    var file_options;
    try {
      file_options = fs.readFileSync(filenameBase + '.opt');
    } catch (e) {
      file_options = null;
    }

    if (file_options) {
      file_options = JSON.parse(file_options);
    } else {
      file_options = {};
    }

    if (typeof file_options.model_scale !== 'undefined') {
      file_options.model_scale = toFloat(file_options.model_scale);
    } else {
      file_options.model_scale = 1;
    }
    if (typeof file_options.invert_y_texcoord === 'undefined') {
      file_options.invert_y_texcoord = true;
    }
    if (typeof file_options.transform_z_up === 'undefined') {
      file_options.transform_z_up = true;
    } else {
      file_options.transform_z_up = file_options.transform_z_up !== 'false';
    }

    var filedata = fs.readFileSync(filename, 'ascii');
    if (!filedata) {
      util.print('Failed to read file\n');
      return;
    }

    try {
      var modelobj = parseObj(filedata, file_options);
    } catch (e) {
      util.print(e.name + '\n');
    }

    if (modelobj) {
      var newFilename = filenameBase + '.js';
      var fileData = 'var ' + filenameBase + ' = ' +
                     JSON.stringify(modelobj) + ';';
      fs.writeFile(newFilename, fileData, function(err) {
          if (err) {
            util.print(err + '\n');
          } else {
            util.print(newFilename + ' saved!\n');
          }
        });
    }
  });

util.print('\n');

