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
  if (!added) {
    added = 1;
    FB.Demo.playing = false;
    Publish.checkReplayUrl();
    World.add('bg_idx', 'background', [JSGlobal.w*0.45,win_size[1] - 768], 0);
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
}

function loadImageList(path,list) {
  for(var i=0;i<list.length;i++) {
    var label = list[i].split('.')[0];
    var url = path + list[i];
    Sprites.add(label, {url: url, frames: 1, framepos: [[0, 0]], width: 0, height: 0});
  }
}

function init() {
  Init.reset();
  Publish.fbInit(fb_app_id);
  ClientCmd.install('playGame',FB.Demo.play);
  ClientCmd.install('publishStory',Publish.publishStory);
  ClientCmd.install('sendRequest',Publish.sendRequest);
  ClientCmd.install('replay',FB.Demo.replay);

  UI.addCollection('', 'gameOpts', {pos: [0, 0]});
  UI.addButton('gameOpts', 'play', {pos: [10, 5], width: 150, height: 40, text: 'Reset', command: {cmd: 'playGame'}});
  UI.addButton('gameOpts', 'replay', {pos: [170, 5], width: 150, height: 40, text: 'Replay', command: {cmd: 'replay'}});
  UI.addButton('gameOpts', 'publish', {pos: [330, 5], width: 150, height: 40, text: 'Publish', command: {cmd: 'publishStory'}});
  UI.addButton('gameOpts', 'gift', {pos: [490, 5], width: 150, height: 40, text: 'Gift', command: {cmd: 'sendRequest'}});
  loadImageList('/public/apps/pvn/images/',[
                  'bouncing_pirate.png',
                  'ninja1.png','cannon_chassis.png','cannon_barrel.png','board_vert.png','wall.png',
                  'board_horiz.png','background.jpg']);

  GameFrame.settings.offset = 0;
  GameFrame.updateSettings({render_mode: GameFrame.HTML_ONLY, update_existing: true, use_div_background: true, css_transitions: false, css_keyframe: false, sprite_sheets: false, int_snap: true, transform3d:false});
  client_user.game_active = true;
  UI.hookUIEvents('gamebody');
}

function resizeMe() {
  Init.winresize();
  FB.Demo.play(false);
}

function resize() {
  if (added) {
    FB.Demo.play(false);
  }
}

Init.setFunctions({app: tick, init: init, draw: Render.tick, ui: UI.tick, resize: resize });
