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

(function() {

var nameToIdx = {};
var idxToName = {};

function loadImageList(path,list) {
  for(var i=0;i<list.length;i++) {
    var label = list[i].split('.')[0];
    var url = path + list[i];
    Sprites.add(label, {url: url, frames: 1, framepos: [[0, 0]], width: 0, height: 0 });
  }
}

function tick() {
  if (JSGlobal.mouse.buttons[0]) {
    JSGlobal.mouse.buttons[0] = 0;
    var dx = JSGlobal.mouse.x;
    var dy = JSGlobal.mouse.y;
    Pieces.select(dx,dy);
  }
  if (!client_user.fb_logged_in) {
    UI.addButton('buttons', 'login', {pos: [0, 140], width: 150, height: 60, fontsize: '300%', text: 'Login', command: {cmd: 'login' }});
  } else {
    UI.del('login');
    UI.addHTML(null,"moves",{pos:[10,140],width:300,uiclass:"chess",markup:Board.getStateHTML()});
  }
}

function postImageLoad() {
  Board.init();
  Pieces.init();
}

function clickButton() {

}

function init() {
  GameFrame.updateSettings({
    render_mode: GameFrame.HTML_ONLY,
    update_existing: true,
    use_div_background: true,
    css_transitions: false,
    css_keyframe: false,
    sprite_sheets: false,
    int_snap: true,
    transform3d:true});

  GameFrame.setXbyY();
  UI.hookUIEvents('gamebody');
  loadImageList('/chess/images/',['Pirate_King.png', 'Pirate_King_Gray.png', 'Pirate_Queen.png', 'Pirate_Queen_Gray.png', 'Pirate_Bishop.png', 'Pirate_Bishop_Gray.png', 'Pirate_Knight.png', 'Pirate_Knight_Gray.png', 'Pirate_Rook.png', 'Pirate_Rook_Gray.png', 'Pirate_Pawn.png', 'Pirate_Pawn_Gray.png']);
  ClientCmd.install('sendRequest',sendMove);
  ClientCmd.install('publishStory',Publish.publishStory);
  ClientCmd.install('login',Publish.fbLogin);

  Publish.fbInit(fb_app_id);
}

function sendMove() {
  var state = Pieces.dumpBoard();
  Publish.sendRequest('I made my move!',{board: state});
}

function resize() {
  loadImageList('/chess/images/',['Pirate_King.png', 'Pirate_King_Gray.png', 'Pirate_Queen.png', 'Pirate_Queen_Gray.png', 'Pirate_Bishop.png', 'Pirate_Bishop_Gray.png', 'Pirate_Knight.png', 'Pirate_Knight_Gray.png', 'Pirate_Rook.png', 'Pirate_Rook_Gray.png', 'Pirate_Pawn.png', 'Pirate_Pawn_Gray.png']);
  UI.addCollection('', 'buttons', {pos: [0, 0]});
  UI.addButton('buttons', 'request', {pos: [200, 0], width: 150, height: 60, fontsize: '300%', text: 'Request', command: {cmd: 'sendRequest' }});
  UI.addButton('buttons', 'publish', {pos: [0, 0], width: 150, height: 60, fontsize: '300%', text: 'Stream', command: {cmd: 'publishStory' }});
  Board.init();
  Pieces.resetBoardGobs();
}

function draw() {
  Pieces.tick();
  Board.tick();
  Render.tick();
}

Init.setFunctions({app: tick, init: init, draw: draw, ui: UI.tick, resize: resize, postLoad: postImageLoad, fps:60 });

})();
