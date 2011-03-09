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

  var max_delta = 0.1; // max frame time delta, in seconds

  var render_inited = false;
  var box_model = null;
  var ship_model = null;
  var play_game = false;
  var needs_reset = true;

  function tick() {
    if (!client_user.fb_logged_in) {
      UI.addButton('buttons', 'login', {
          pos: [200, 0], width: 80, height: 40,
          fontsize: '100%', text: 'Login', command: {cmd: 'login' }
        });
      UI.del('request');
    } else {
      UI.addButton('buttons', 'request', {
          pos: [200, 0], width: 80, height: 40,
          fontsize: '100%', text: 'Request', command: {cmd: 'sendGame' }
        });
      UI.del('login');
    }

    if (!render_inited && WebGLRender.isInitialized()) {
      render_inited = true;

      var material_table = WebGLRender.getMaterialTable();
      var model_context = WebGLRender.getModelContext();
      var viewport = WebGLRender.getViewport();

      TrenchMaterials.registerMaterials(WebGLRender.getMaterialTable());
      box_model = model_context.createModel(Box_Model);
      ship_model = model_context.createModel(Ship_Junebug_01);

      TrenchPlayer.init(ship_model);
      TrenchCamera.init(viewport);
      TrenchTrack.init(box_model);
      TrenchProjectile.init(box_model);
    }

    if (render_inited && needs_reset) {
      TrenchPlayer.reset();
      TrenchCamera.reset();
      TrenchTrack.reset();
      TrenchProjectile.reset();
      needs_reset = false;
    }

    // tick subsystems
    var delta_time = Tick.delta * 0.001;
    if (delta_time > max_delta) {
      delta_time = max_delta;
    }

    if (play_game) {
      TrenchProjectile.tick(delta_time);
      TrenchPlayer.tick(delta_time);
      TrenchTrack.tick(delta_time);
    }

    TrenchCamera.tick(delta_time, !play_game);
  }

  function startCmd() {
    play_game = true;
  }

  function resetCmd() {
    needs_reset = true;
    play_game = false;
  }

  function sendGameCmd() {
    Publish.sendRequest({key:0});
  }

  function init() {
    Init.reset();

    window.console && window.console.log('fb_app_id ' + fb_app_id);
    Publish.fbInit(fb_app_id);

    GameFrame.updateSettings({
      render_mode: GameFrame.WEBGL3D,
      //webgl_debug: true,
      sprite_sheets: false
    });

    GameFrame.setXbyY();
    Input.hookEvents('gamebody');

    ClientCmd.install('start', startCmd);
    ClientCmd.install('reset', resetCmd);
    ClientCmd.install('login', Publish.fbLogin);
    ClientCmd.install('sendGame', sendGameCmd);
  }

  function resize() {
    render_inited = false;

    UI.addCollection('', 'buttons', {pos: [0, 0]});
    UI.addButton('buttons', 'start', {
        pos: [0, 0], width: 80, height: 40,
          fontsize: '100%', text: 'Start!',
          command: {cmd: 'start' }
      });
    UI.addButton('buttons', 'reset', {
        pos: [100, 0], width: 80, height: 40,
          fontsize: '100%', text: 'Reset',
          command: {cmd: 'reset' }
      });
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

