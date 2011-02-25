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

  var box_model_data = {"verts":[0,0,0,0,0,0,0,-1,1,1,0,0,1,0,0,-1,1,0,0,1,1,0,0,-1,0,1,0,1,0,0,0,-1,0,0,0,0,0,-1,0,0,0,1,1,0,1,-1,0,0,0,1,0,1,1,-1,0,0,0,0,1,1,0,-1,0,0,0,1,0,0,0,0,1,0,1,1,1,0,1,0,1,0,1,1,0,1,1,0,1,0,0,1,1,1,0,0,1,0,1,0,0,0,0,1,0,0,1,1,0,0,1,1,0,0,1,1,1,1,1,1,0,0,1,0,1,1,0,1,0,0,0,0,0,0,0,0,-1,0,1,0,0,0,1,0,-1,0,1,0,1,1,1,0,-1,0,0,0,1,1,0,0,-1,0,0,0,1,0,0,0,0,1,1,0,1,0,1,0,0,1,1,1,1,1,1,0,0,1,0,1,1,1,0,0,0,1],"indices":[0,1,2,0,3,1,4,5,6,4,7,5,8,9,10,8,11,9,12,13,14,12,14,15,16,17,18,16,18,19,20,21,22,20,22,23],"materials":["default"],"counts":[36]};

  var render_inited = false;
  var box_model = null;

  function tick() {
    if (!render_inited && WebGLRender.isInitialized()) {
      render_inited = true;

      var material_table = WebGLRender.getMaterialTable();
      var model_context = WebGLRender.getModelContext();
      var viewport = WebGLRender.getViewport();

      TrenchMaterials.registerMaterials(WebGLRender.getMaterialTable());
      box_model = model_context.createModel(box_model_data);

      TrenchPlayer.init(box_model);
      TrenchCamera.init(viewport);
      TrenchTrack.init(box_model);
    }

    // tick subsystems
    var delta_time = Tick.delta * 0.001;
    TrenchPlayer.tick(delta_time);
    TrenchCamera.tick(delta_time);
    TrenchTrack.tick(delta_time);
  }

  function init() {
    Init.reset();

    GameFrame.updateSettings({
      render_mode: GameFrame.WEBGL3D,
      //webgl_debug: true,
      sprite_sheets: false
    });

    GameFrame.setXbyY();
    UI.hookUIEvents('gamebody');
  }

  function resize() {
    //console.log('resize');
    render_inited = false;
  }

  Init.setFunctions({
    app: tick,
    init: init,
    draw: Render.tick,
    ui: UI.tick,
    resize: resize,
    //postLoad: postImageLoad,
    fps: 300
  });

})();

