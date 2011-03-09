(function() {

function loadImageList(path,list) {
  for(var i=0;i<list.length;i++) {
    var label = list[i].split('.')[0];
    var url = path + list[i];
    Sprites.add(label, {url: url, frames: 1, framepos: [[0, 0]], width: 0, height: 0});
  }
}

var pirate,p2;
var pirate_dir = 1;
var rot = 0;

function tick() {
  pirate.pos[0] += pirate_dir;
  if (pirate.pos[0] < 0) {
    pirate_dir = 1;
  } else if (pirate.pos[0] > Browser.w) {
    pirate_dir = -1;
  }
  pirate.dirty = 1;
  rot += 0.02;
  if (rot > 2*Math.PI) {
    rot -= 2*Math.PI;
  }
  p2.pos[0] = 200 + Math.sin(rot) * 100;
  p2.pos[1] = 200 + Math.cos(rot) * 100;
  p2.dirty = true;

  if (Input.mouse.buttons[0]) {
    Input.mouse.buttons[0] = 0;
    var dx = Input.mouse.x;
    var dy = Input.mouse.y;
    console.log([dx.dy]);
  }
  if (!client_user.fb_logged_in) {
    UI.addButton('buttons', 'login', {pos: [200, 140], width: 150, height: 60, fontsize: '300%', text: 'Login', command: {cmd: 'login' }});
  } else {
    UI.del('login');
  }
}

var size = 75;

function postImageLoad() {
  World.add('bg_idx', 'background', [Browser.w*0.5,Browser.h*0.5], 0);
  pirate = Gob.add(Utils.uuidv4(), 'bouncing_pirate', 0, [100,150], [0,0], 10, 1);
  p2 = Gob.add(Utils.uuidv4(), 'bouncing_pirate', 0, [100,150], [0,0], 10, 1);
}

function clickButton() {
  pirate_dir = -pirate_dir;
}

function sendMove() {
  Publish.sendRequest('I made my move!',{board: { a1: 'king', a2: 'queen', a3: 'pawn'}});
}

function init() {
  Init.reset();

  console.log('fb_app_id ' + fb_app_id);
  Publish.fbInit(fb_app_id);
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
  Input.hookEvents('gamebody');
  loadImageList('/pvn/images/',['bouncing_pirate.png','background.jpg']);
  ClientCmd.install('clickButton',clickButton);
  ClientCmd.install('sendRequest',sendMove);
  ClientCmd.install('publishStory',Publish.publishStory);
  ClientCmd.install('login',Publish.fbInit);
}

function resize() {
  UI.addCollection('', 'buttons', {pos: [0, 0]});
  UI.addButton('buttons', 'optin', {pos: [0, 0], width: 150, height: 60, fontsize: '300%', text: 'ClickMe!', command: {cmd: 'clickButton' }});
  UI.addButton('buttons', 'request', {pos: [200, 0], width: 150, height: 60, fontsize: '300%', text: 'Request', command: {cmd: 'sendRequest' }});
  UI.addButton('buttons', 'publish', {pos: [0, 140], width: 150, height: 60, fontsize: '300%', text: 'Stream', command: {cmd: 'publishStory' }});
}

Init.setFunctions({app: tick, init: init, draw: Render.tick, ui: UI.tick, resize: resize, postLoad: postImageLoad, fps:1000 });

})();
