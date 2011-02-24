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
}

function resize() {
}

function draw() {
  Pieces.tick();
  Board.tick();
  Render.tick();
}

Init.setFunctions({app: tick, init: init, draw: draw, ui: UI.tick, resize: resize, postLoad: postImageLoad, fps:1000 });

})();
