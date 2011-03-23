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
    FB.Demo.setupBackground();
  }
  if (playing_state != FB.Demo.playing)
  {
    playing_state = FB.Demo.playing;
    if (FB.Demo.playing) {
      UI.removeTree('Play');
      UI.removeTree('Replay');
      UI.removeTree('Publish');
      UI.removeTree('Gift');
    } else {
      UI.button('Play',[110, 100],function() { FB.Demo.play(true); });
      UI.button('Replay',[300, 100],FB.Demo.replay);
      UI.button('Publish',[110, 200],Publish.publishStory);
      UI.button('Gift',[300, 200],Publish.sendRequest);
     }
  }
  if (!FB.Demo.playing && !Publish.isLoggedIn()) {
    UI.button('Opt In',[200, 300],function() { Publish.fbLogin(0); });
  } else {
    UI.removeTree('Opt In');
  }
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
  Publish.fbInit(fb_app_id);
  GameFrame.settings.offset = 0;
  GameFrame.updateSettings({render_mode: GameFrame.HTML_ONLY, update_existing: true, use_div_background: true, css_transitions: false, css_keyframe: false, sprite_sheets: false, int_snap: true, transform3d:true});
  Input.hookEvents('gamebody');
}

function setup() {
  GameFrame.setXbyY();
  loadImageList('/pvn/images/',[
                  'bouncing_pirate.png','Mate_01.png','Pirate_Captain_Idle_00.png','flying_pirate.png',
                  'ninja1.png','cannon_chassis.png','cannon_barrel.png','board_vert.png','wall.png',
                  'board_horiz.png','background.jpg', 'ninja_cartwheel.png', 'treasure_chest.png']);

}

function resize() {
  if (added) {
    FB.Demo.play(false);
    FB.Demo.playing = false;
  }
}

Init.setFunctions({app: tick, init: init, setup:setup,  draw: Render.tick, ui: UI.tick, resize: resize, fps:1000 });
