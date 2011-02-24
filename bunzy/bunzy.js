function tick() {
  console.log('tick');
}

function init() {
  console.log('init');
}

function resize() {
  console.log('resize');
}

Init.setFunctions({app: tick, init: init, draw: Render.tick, ui: UI.tick, resize: resize, fps:1000 });
