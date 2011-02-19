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
var playing_state;

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
    //FB.Demo.play(false);
    FB.Demo.playing = false;
    Publish.checkReplayUrl();
    World.add('bg_idx', 'background', [0,win_size[1] - 768], 0);
  }
  if (playing_state != FB.Demo.playing)
  {
    playing_state = FB.Demo.playing;
    if (FB.Demo.playing) {
      UI.del('play');
      UI.del('replay');
      UI.del('publish');
      UI.del('gift');
    } else {
      UI.addButton('gameOpts', 'play', {pos: [110, 100], width: 150, height: 60, fontsize: '300%', text: 'Play', command: {cmd: 'playGame', args: [true]}});
      UI.addButton('gameOpts', 'replay', {pos: [300, 100], width: 150, height: 60, fontsize: '300%', text: 'Replay', command: {cmd: 'replay'}});
      UI.addButton('gameOpts', 'publish', {pos: [110, 200], width: 150, height: 60, fontsize: '300%', text: 'Publish', command: {cmd: 'publishStory'}});
      UI.addButton('gameOpts', 'gift', {pos: [300, 200], width: 150, height: 60, fontsize: '300%', text: 'Gift', command: {cmd: 'sendRequest'}});
    }
  }
//  UI.addHTML('gameOpts', 'info', {pos: [490, 65], width: 150, height: 40, markup: 'Mode: '+FB.Demo.playing});
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
 // Init.reset();
  game_init({viewport: 'fluid', settings: {render_mode: GameFrame.HTML_ONLY, update_existing: true, use_div_background: true, css_transitions: false, css_keyframe: false, sprite_sheets: false, int_snap: true, transform3d:true}, tfps: 30, background: 'world', sprites: 'cute', demo: true, hack: true });
  PerfTest.doAll();
  loadImageList('/public/apps/pvn/images/',[
    'bouncing_pirate.png',
    'ninja1.png','cannon_chassis.png','cannon_barrel.png','board_vert.png','wall.png',
    'board_horiz.png','background.jpg']);
    // 'pirate_fire.gif','flying_pirate.png','explosion.gif',
  setInterval('tick();', 20);
  PerfTest.pushTest(function() {
    GameFrame.updateSettings(test.settings, true);
    GameFrame.setXbyY(test.viewport);
  });
}

function resizeMe() {
  Init.winresize();
  FB.Demo.play(false);
}

Init.setFunctions({init: init, draw: Render.tick, ui: UI.tick });
