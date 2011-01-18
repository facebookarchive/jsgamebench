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

var exports = {}; // compatibility with node
var g_head;

var JSGlobal = {};

JSGlobal.user_agent = '';
JSGlobal.browser = 0;
JSGlobal.CHROME = 1;
JSGlobal.FIREFOX = 2;
JSGlobal.WEBKIT = 3;
JSGlobal.IE = 4;
JSGlobal.OTHER = -99;
JSGlobal.IE9 = 5;
JSGlobal.OPERA = 6;

JSGlobal.winsize = [0, 0];
JSGlobal.winpos = [0, 0];

JSGlobal.modified = 0;
JSGlobal.world_modified = 0;

JSGlobal.TIMERS_LAUNCHED = 0;

JSGlobal.key_state = [];

JSGlobal.myscore = null;

JSGlobal.mouse = {
  x: 0,
  y: 0,
  left: 0,
  right: 0,
  wheel: 0,
  buttons: [],
  double_click: false
};

var world_grid = {idx: 0};
var ent_grid = {idx: 1, interp: {} };

var client_user = {
  unique_id: 0,
  world_grid: world_grid,
  ent_grid: ent_grid,
  grids: [world_grid, ent_grid]
};

var Key = {
  UP: 38,
  DOWN: 40,
  LEFT: 37,
  RIGHT: 39
};
