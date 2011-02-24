function loadImageList(path,list) {
  for(var i=0;i<list.length;i++) {
    var label = list[i].split('.')[0];
    var url = path + list[i];
    Sprites.add(label, {url: url, frames: 1, framepos: [[0, 0]], width: 0, height: 0});
  }
}

var pirate;
var pirate_dir = 1;
function tick() {
  pirate.pos[0] += pirate_dir;
  if (pirate.pos[0] < 0) {
    pirate_dir = 1;
  } else if (pirate.pos[0] > JSGlobal.w) {
    pirate_dir = -1;
  }
  pirate.dirty = 1;
}

function postImageLoad() {
  World.add('bg_idx', 'background', [JSGlobal.w*0.5,JSGlobal.h*0.5], 0);
  pirate = Gob.add(Utils.uuidv4(), 'bouncing_pirate', 0, [100,150], [0,0], 10, 1);

}

function clickButton() {
  console.log('clicked!');
  pirate_dir = -pirate_dir;
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
  loadImageList('/pvn/images/',['bouncing_pirate.png','background.jpg']);
  ClientCmd.install('clickButton',clickButton);
  UI.addButton('gameOpts', 'optin', {pos: [10, 100], width: 150, height: 60, fontsize: '300%', text: 'ClickMe!', command: {cmd: 'clickButton' }});
}

function resize() {
  //console.log('resize');
}

Init.setFunctions({app: tick, init: init, draw: Render.tick, ui: UI.tick, resize: resize, postLoad: postImageLoad, fps:1000 });
