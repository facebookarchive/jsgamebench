(function() {

function loadImageList(path,list) {
  for(var i=0;i<list.length;i++) {
    var label = list[i].split('.')[0];
    var url = path + list[i];
    Sprites.add(label, {url: url, frames: 1, framepos: [[0, 0]], width: 0, height: 0});
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
  loadImageList('/pvn/images/',['bouncing_pirate.png']);
  ClientCmd.install('sendRequest',sendMove);
  ClientCmd.install('publishStory',Publish.publishStory);
  ClientCmd.install('login',Publish.fbInit);

  Publish.fbInit(fb_app_id);
}

function sendMove() {
  Publish.sendRequest('I made my move!',{board: { a1: 'king', a2: 'queen', a3: 'pawn'}});
}

function resize() {
  UI.addCollection('', 'buttons', {pos: [0, 0]});
  UI.addButton('buttons', 'request', {pos: [200, 0], width: 150, height: 60, fontsize: '300%', text: 'Request', command: {cmd: 'sendRequest' }});
  UI.addButton('buttons', 'publish', {pos: [0, 0], width: 150, height: 60, fontsize: '300%', text: 'Stream', command: {cmd: 'publishStory' }});
}

function draw() {
  Pieces.tick();
  Board.tick();
  Render.tick();
}

Init.setFunctions({app: tick, init: init, draw: draw, ui: UI.tick, resize: resize, postLoad: postImageLoad, fps:1000 });

})();
