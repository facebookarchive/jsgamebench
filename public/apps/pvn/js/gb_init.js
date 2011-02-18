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

var added=0;

function tick() {
  if (!Sprites.fullyLoaded()) {
    return;
  }
  if (!added) {
    added = 1;
    ClientCmd.install('playGame',FB.Demo.play);
    ClientCmd.install('publishStory',Publish.publishStory);
    ClientCmd.install('sendRequest',Publish.sendRequest);
    ClientCmd.install('replay',FB.Demo.replay);

    UI.addCollection('', 'gameOpts', {pos: [0, 0]});
    UI.addButton('gameOpts', 'play', {pos: [10, 5], width: 150, height: 40, text: 'Reset', command: {cmd: 'playGame'}});
    UI.addButton('gameOpts', 'replay', {pos: [170, 5], width: 150, height: 40, text: 'Replay', command: {cmd: 'replay'}});
    UI.addButton('gameOpts', 'publish', {pos: [330, 5], width: 150, height: 40, text: 'Publish', command: {cmd: 'publishStory'}});
    UI.addButton('gameOpts', 'gift', {pos: [490, 5], width: 150, height: 40, text: 'Gift', command: {cmd: 'sendRequest'}});

    FB.Demo.play();
    Publish.checkReplayUrl();
  }
  FB.Demo.tick();
  UI.tick();
  Render.tick();
}

function game_init(test) {
  PerfTest.pushTest(function() {
    GameFrame.settings.offset = 0;
    Init.winresize();
    Gob.delAll();
    GameFrame.updateSettings(test.settings, true);
    GameFrame.setXbyY(test.viewport);
    client_user.game_active = true;
    UI.hookUIEvents('gamebody');
  });
}

function loadImageList(path,list) {
  for(var i=0;i<list.length;i++) {
    var label = list[i].split('.')[0];
    var url = path + list[i];
    Sprites.add(label, {url: url, frames: 1, framepos: [[0, 0]], width: 0, height: 0});
  }
}

function init() {
  Publish.fbInit(fb_app_id);
  game_init({viewport: 'fluid', settings: {render_mode: GameFrame.CANVAS_ONLY, update_existing: true, use_div_background: true, css_transitions: false, css_keyframe: false, sprite_sheets: false, int_snap: true, transform3d:false}, tfps: 30, background: 'world', sprites: 'cute', demo: true, hack: true });

  PerfTest.doAll();
  loadImageList('/public/apps/pvn/images/',[
    'bouncing_pirate.png',
    'ninja1.png','cannon_chassis.png','cannon_barrel.png','board_vert.png','wall.png',
    'board_horiz.png','background.jpg']);
    // 'pirate_fire.gif','flying_pirate.png','explosion.gif',
  setInterval('tick();', 33);
  PerfTest.pushTest(function() {
    GameFrame.updateSettings(test.settings, true);
    GameFrame.setXbyY(test.viewport);
  });
}

function resizeMe() {
  Init.winresize();
  FB.Demo.play();
}

Init.setFunctions({init: init, draw: Render.tick, ui: UI.tick, setup: FB.Demo.play});
