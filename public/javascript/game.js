// Copyright 2004-present Facebook, Inc.

// Licensed under the Apache License, Version 2.0 (the "License"); you may
// not use this file except in compliance with the License. You may obtain
// a copy of the License at

//     http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.

var Game = (function() {
    var viewports = {fluid_width: [null, 640], normal: [960, 640]};
    var sprites_loaded;

    function loadTiles() {
      Sprites.add('shot', {url: '/images/shot.png', frames: 8,
        framepos: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0]],
        width: 64, height: 64});

      Sprites.add('ship_idle', {url: '/images/ship_idle.png', frames: 24, no_anim: true,
            framepos: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0],
                       [0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1],
                       [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [7, 2]],
            width: 128, height: 128,
            top: 0, left: 0});

      Sprites.add('ship_f1', {url: '/images/ship_thrust_frame1.png', frames: 24, no_anim: true,
            framepos: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0],
                       [0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1],
                       [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [7, 2]],
            width: 128, height: 128,
            top: 0, left: 0});

      Sprites.add('ship_f2', {url: '/images/ship_thrust_frame2.png', frames: 24, no_anim: true,
            framepos: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0],
                       [0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1],
                       [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [7, 2]],
            width: 128, height: 128,
            top: 0, left: 0});

      Sprites.add('asteroid', {url: '/images/asteroid.png', frames: 60, no_anim: true,
            framepos: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0],
                       [0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1],
                       [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [7, 2],
                       [0, 3], [1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [6, 3], [7, 3],
                       [0, 4], [1, 4], [2, 4], [3, 4], [4, 4], [5, 4], [6, 4], [7, 4],
                       [0, 5], [1, 5], [2, 5], [3, 5], [4, 5], [5, 5], [6, 5], [7, 5],
                       [0, 6], [1, 6], [2, 6], [3, 6], [4, 6], [5, 6], [6, 6], [7, 6],
                       [0, 7], [1, 7], [2, 7], [3, 7]],
            width: 128, height: 128});


      Sprites.add('Rock', {url: '/images/Rock.png', frames: 1, no_anim: true,
            framepos: [[0, 0]],
            width: 128, height: 128});

      Sprites.add('boom', {url: '/images/explosion.png', frames: 59, no_anim: true,

            framepos: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0],
                       [0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1],
                       [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [7, 2],
                       [0, 3], [1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [6, 3], [7, 3],
                       [0, 4], [1, 4], [2, 4], [3, 4], [4, 4], [5, 4], [6, 4], [7, 4],
                       [0, 5], [1, 5], [2, 5], [3, 5], [4, 5], [5, 5], [6, 5], [7, 5],
                       [0, 6], [1, 6], [2, 6], [3, 6], [4, 6], [5, 6], [6, 6], [7, 6],
                       [0, 7], [1, 7], [2, 7]],
            width: 256, height: 256});

      Sprites.add('powerup', {url: '/images/powerup.png', frames: 40, no_anim: true,
            framepos: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0],
                       [0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1],
                       [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [7, 2],
                       [0, 3], [1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [6, 3], [7, 3],
                       [0, 4], [1, 4], [2, 4], [3, 4], [4, 4], [5, 4], [6, 4], [7, 4]],
            width: 64, height: 64});

      Sprites.add('world', {url: '/images/stars.png', frames: 1,
            framepos: [[0, 0]],
            width: 512, height: 511});
      sprites_loaded = 1;
    }

    var thrust = ['ship_idle', 'ship_f1', 'ship_f2'];

    var scr_pos = [];
    var init_complete = 0;
    var blocks = [];
    var TILE_X = 100;
    var TILE_Y = 120;
    var mobs = [];

    function hitWall(pos,self_id) {
      var size;
      var self_obj = Grid.findById(client_user.ent_grid, self_id);
      size = [64, 37];
      var list = Grid.findByArea(client_user.world_grid, pos, size);
      for (var i in list) {
        var obj = list[i];
        if (obj.name != 'Rock') {
          continue;
      }
        var ret = Mathx.overlap(pos, size, obj.extent[0], obj.extent[1]);
        if (ret)
          return ret;
      }
      return false;
    }

    function getTile(pos) {
      var list = Grid.findByArea(client_user.world_grid, pos, [1, 1]);
      for (i in list) {
        if (list[i].name != 'girl') {
          return list[i];
        }
      }
    }

    function getRock(me) {
      var best;
      var mindist;
      var ship = Vec.add(me.extent[0],Vec.scale(me.extent[1],.5));
      var list = Grid.findByArea(client_user.world_grid, me.extent[0], me.extent[1]);
      for (i in list) {
        var hit = list[i];
        if (hit.name != 'Rock') {
          continue;
        }
        var center = Vec.add(hit.extent[0],Vec.scale(hit.extent[1],.5));
        var d = Vec.dist(ship,center);
        if (mindist == undefined || d < mindist) {
          mindist = d;
          best = hit;
        }
      }
      return best;
    }

  function makeMob(pos, vel, type) {
    var sprite;
    var life;
    switch (type) {
      case 'shot':
        sprite = 'shot';
        life = 1000;
        break;
      case 'bonus':
        sprite = bonus[parseInt(Math.random() * bonus.length)];
        life = 10000;
        break;
    }
    var id = Utils.uuidv4();
    var obj = { extent: [pos, [TILE_X, TILE_Y]], pos: pos, vel: vel, uuid: id, name: sprite, z: 10, time: (new Date).getTime(), life: life, type: type};
    GridClient.add(client_user.ent_grid, obj);
    mobs.push(obj);
  }

  function moveMobs(time) {
    for (var i = 0, len = mobs.length; i < len; i++) {
      var mob = mobs[i];
      if (mob) {
        if (time > mob.life + mob.time) {
          GridClient.remove(client_user.ent_grid, mob.uuid);
          mobs.splice(i, 1);
          continue;
        }
        var extent = Utils.clone(mob.extent);
        switch (mob.type) {
          case 'shot':
            extent[0] = Vec.add(mob.pos, Vec.scale(mob.vel, (time - mob.time)));
            GridClient.transform(client_user.ent_grid, mob.uuid, {extent: extent});

            var list = Grid.findByArea(ent_grid,mob.extent[0],mob.extent[1]);
            for(var j=0;j<list.length;j++) {
              var hit = list[j];
              if (hit.name == 'asteroid') {
                Xhr.toServer({cmd: 'explode', args: [hit.uuid]});
                GridClient.remove(client_user.ent_grid, mob.uuid);
                mobs.splice(i, 1);
                break;
              }
            }
            break;
          case 'bonus':
            if (time - mob.time < 500) {
              extent[0] = Vec.add(mob.pos, Vec.scale(mob.vel, 0.1 * (time - mob.time)));
            }
            GridClient.transform(client_user.ent_grid, mob.uuid, {extent: extent});
            break;
        }
      }
    }
  }

  function shootForward(me) {
    var dir = [];
    dir[0] = -Math.sin(me.angle);
    dir[1] = -Math.cos(me.angle);
    dir = Vec.norm(dir);
    JSGlobal.mouse.buttons[0] = 0;
    if (0) {
      Xhr.toServer({cmd: 'shoot', args: [me.extent[0], dir]});
    } else {
      makeMob(me.extent[0], dir, 'shot');
    }
  }

  function checkStanding() {
    var obj = getTile(Vec.add(client_user.plr_pos, [TILE_X / 2, TILE_Y / 2]));
    if (obj) {
      var tx = parseInt((client_user.plr_pos[0] + TILE_X / 2) / TILE_X);
      var ty = parseInt((client_user.plr_pos[1] + TILE_Y / 2) / TILE_Y);
      //Xhr.toServer({cmd: 'tagtile', args: [obj.uuid, [tx, ty]]});
      return 1;
      var name = obj.name;
      if (name == 'PlainBlock')
      return 1;
      if (name == 'StoneBlock')
      return 1;
      if (name == 'GemBlue') {
        var me = Grid.findById(client_user.ent_grid, horngirl_id);
        if (me.name == 'ship')
        me.name = 'girl';
        else
        me.name = 'ship';
        GridClient.transform(client_user.ent_grid, horngirl_id, {name: me.name});

        GridClient.transform(client_user.ent_grid, obj.uuid, {name: 'DirtBlock'});
        var pos = [Math.random() * 2000, Math.random() * 2000];
        var obj = getTile(pos);
        GridClient.transform(client_user.ent_grid, obj.uuid, {name: 'GemBlue'});
      }
    }
    return 1;
  }

  function keyDown(ascii) {
    return JSGlobal.key_state[ascii.charCodeAt(0)] > 0;
  }

  function fbLogin() {
    var client_id, redirect_url;
    redirect_url = location.href;
    if (redirect_url[redirect_url.length-1]!='/'){
      redirect_url += '/';
    }
    redirect_url += 'oauth_redirect';
    window.location = 'https://graph.facebook.com/oauth/authorize?client_id=' + client_user.app_id + '&redirect_uri=' + redirect_url +
    '&scope=publish_stream,read_stream,user_about_me';
    //user_photos,user_photo_video_tags,friends_photo_video_tags,
    // friends_photos,publish_stream,read_stream,offline_access,
    // user_about_me,xmpp_login
  }

  function getCookie(name) {
    name += '=';
    start = document.cookie.indexOf(name);
    var val = document.cookie.substr(start + name.length);
    var end = val.indexOf(';');
    if (end >= 0) {
      val = val.substr(0, end);
    }
    return val;
  }

  function reflect(v,n) {
    var nn = Vec.dot(n,n); // square length of normal of collision
    var vn = Vec.dot(n,v); // impact velocity (collision impulse).
    if (vn > 0) return v; // no bounce, else ball will stick to monster.
    var t = Vec.scale(n,-2 * vn / nn);
    r = Vec.add(v,t);
    return r;
  }

  function updatePlayer(me) {
    var plr_pos = client_user.plr_pos;
    var dx = 0, dy = 0, forward = 0;
    var angle = me.angle;
    if (window.DeviceMotionEvent == undefined) {
      if (JSGlobal.key_state[Key.UP] > 0 || keyDown('W')) {
        forward = 1;
      }
      if (JSGlobal.key_state[Key.DOWN] > 0 || keyDown('S')) {
        //forward = -1;
      }
      if (JSGlobal.key_state[Key.RIGHT] > 0 || keyDown('D')) {
        angle -= 0.2;
      }
      if (JSGlobal.key_state[Key.LEFT] > 0 || keyDown('A')) {
        angle += 0.2;
      }
      if (angle < 0) {
        angle += 2 * Math.PI;
      }
      angle %= (2 * Math.PI);
    } else {
      var accel = UI.getGyro();
      if (accel[2] > 10 || accel[2] < -10) {
        forward = accel[2] / 20;
      }
      if (accel[1] > 10 || accel[1] < -10) {
        angle += accel[1] / 100;
      }
    }

    var MAXVEL = 18;
    var FRICTION = .98;
    var MINVEL = 0.1;
    vel = me.vel;
    if (forward) {
      vel[0] += -forward * Math.sin(angle);
      vel[1] += -forward * Math.cos(angle);
    }
    for(var i=0;i<2;i++) {
      vel[i] *= FRICTION;
      if (Math.abs(vel[i]) < MINVEL) {
        vel[i] = 0;
      }
      vel[i] = Math.min(vel[i],MAXVEL);
      vel[i] = Math.max(vel[i],-MAXVEL);
    }
    if (Vec.mag(vel) < MINVEL) {
      vel[0] = vel[1] = 0;
    }
    if (!client_user.dir || Vec.mag(vel) > 0.01) {
      client_user.dir = Vec.norm(vel);
    }
    if (1) {
      var hit = getRock(me);
      if (hit) {
        var center = Vec.add(hit.extent[0],Vec.scale(hit.extent[1],.5));
        var ship = Vec.add(me.extent[0],Vec.scale(me.extent[1],.5));
        var normal = (Vec.sub(ship,center));
        var r = reflect(vel,normal);
        vel = r;
      }
      plr_pos[0] += vel[0];
      plr_pos[1] += vel[1];
    } else {
      if (!hitWall(Vec.add(plr_pos, [vel[0], 0]), horngirl_id))
      plr_pos[0] += vel[0];
      if (!hitWall(Vec.add(plr_pos, [0, vel[1]]), horngirl_id))
      plr_pos[1] += vel[1];
    }
    if (vel[0] || vel[1] || angle != me.angle || forward) {
      if (forward) {
        if (me.state < 2) {
          me.state++;
        }
      }
      else {
        me.state = 0;
      }

      for(var i=0;i<2;i++) {
        vel[i] *= FRICTION;
        if (Math.abs(vel[i]) < MINVEL) {
          vel[i] = 0;
        }
        vel[i] = Math.min(vel[i],MAXVEL);
        vel[i] = Math.max(vel[i],-MAXVEL);
      }
      if (Vec.mag(vel) < MINVEL) {
        vel[0] = vel[1] = 0;
      }
      if (!client_user.dir || Vec.mag(vel) > 0.01) {
        client_user.dir = Vec.norm(vel);
      }
      if (1) {
        var hit = getRock(me);
        if (hit) {
          var center = Vec.add(hit.extent[0],Vec.scale(hit.extent[1],.5));
          var ship = Vec.add(me.extent[0],Vec.scale(me.extent[1],.5));
          var normal = (Vec.sub(ship,center));
          var r = reflect(vel,normal);
          vel = r;
        }
        plr_pos[0] += vel[0];
        plr_pos[1] += vel[1];
      } else {
        if (!hitWall(Vec.add(plr_pos, [vel[0], 0]), horngirl_id))
          plr_pos[0] += vel[0];
        if (!hitWall(Vec.add(plr_pos, [0, vel[1]]), horngirl_id))
          plr_pos[1] += vel[1];
      }
      if (vel[0] || vel[1] || angle != me.angle || forward) {
        if (forward) {
          if (me.state < 2) {
            me.state++;
          }
        }
        else {
          me.state = 0;
        }
        GridClient.transform(client_user.ent_grid, horngirl_id, {angle:angle, extent: [Utils.clone(plr_pos), [TILE_X, TILE_Y]], vel: vel, state:me.state});
      }
      if (JSGlobal.key_state[32] > 0 || JSGlobal.mouse.buttons[0]) {
        JSGlobal.key_state[32] = 0;
        JSGlobal.mouse.buttons[0] = 0;
        shootForward(me);
      }
    }
  }

  function completeInit() {
    var plr_pos = client_user.plr_pos = [0,0];
    client_user.id = getCookie('id');
    Xhr.toServer({cmd: 'userid', args: [client_user.id]});

    var wsize = 512;
    for(var y=0;y<=Math.ceil(JSGlobal.h/wsize);y++) {
      for(var x=0;x<=Math.ceil(JSGlobal.w/wsize);x++) {
        World.add(Utils.uuidv4(), 'world', [x*wsize,y*wsize], 0);
      }
    }
    horngirl_id = Utils.uuidv4();
    var sprite = 'ship';
    var obj = { extent: [Utils.clone(plr_pos), [TILE_X, TILE_Y]], vel: [0, 0], angle:0, uuid: horngirl_id, name: sprite, state: 0, z: 10, user_name: 'unknown' };
    GridClient.add(client_user.ent_grid, obj);
    Xhr.toServer({cmd: 'linktouser', args: [horngirl_id]});
    Xhr.toServer({cmd: 'setview', args: [[-JSGlobal.w/2,-JSGlobal.h/2], [JSGlobal.w, JSGlobal.h]]});
  }

  function tick() {
    if (!Sprites.fullyLoaded() || !sprites_loaded) {
      return;
    }
    if (keyDown('L')) {
      if (!client_user.is_logging_in) {
        fbLogin();
        client_user.is_logging_in = true;
      }
    }
    if (!init_complete++) {
      completeInit();
      return;
    }
    var plr_pos = client_user.plr_pos;
    var me = Grid.findById(client_user.ent_grid, horngirl_id);
    if (me) {
      updatePlayer(me);
    }
    var plr_pos = client_user.plr_pos;

    moveMobs((new Date()).getTime());
    var old_pos = scr_pos;
    var half = Vec.scale(JSGlobal.winsize, 0.5);
    scr_pos = Vec.sub(plr_pos, half);
    if ((parseInt(old_pos[0] / TILE_X) != parseInt(scr_pos[0] / TILE_X))
    || (parseInt(old_pos[1] / TILE_Y) != parseInt(scr_pos[1] / TILE_Y))) {
      Xhr.toServer({cmd: 'setview', args: [scr_pos, [JSGlobal.w, JSGlobal.h]]});
    }

    GridClient.interpReceived(client_user.ent_grid);
    // GridClient.interpReceived(client_user.world_grid); // maybe not?
    // Draw entities
    Gob.delAll();
    var list = Grid.findByArea(client_user.ent_grid, scr_pos,[TILE_X + JSGlobal.w, TILE_Y + JSGlobal.h]);

    for (var i in list) {
      var obj = list[i];
      var pos = Vec.sub(obj.extent[0], scr_pos);
      if (obj.name == 'ship') {
        if (!obj.dir || Vec.mag(obj.vel) > 0.01) {
          obj.dir = Vec.norm(obj.vel);
        }
        var frame = parseInt(24 * (Math.PI + Math.atan2(obj.dir[0], obj.dir[1]))
        / Math.PI / 2);
        frame = parseInt(obj.angle * 24 / (2 * Math.PI));
        frame = Math.max(frame,0);
        frame = Math.min(frame,23);

        var th = thrust[me ? me.state : 0];
        Gob.addSimple(obj.uuid, th, pos, obj.z ? obj.z : -1000, frame);
      } else {
        Gob.addSimple(obj.uuid, obj.name, pos, obj.z ? obj.z : -1000, parseInt(obj.frame || 0));
        var num_frames = Gob.numFrames(obj.uuid);
        var frame = obj.frame || 0;
        if (!obj.spin) {
          obj.frame = (frame+1) % num_frames;
        } else {
          obj.frame = (frame+num_frames+obj.spin) % num_frames;
        }
      }
      if (obj.owner_id && obj.user_name) {
        var id = 'id' + obj.owner_id;
        var points = obj.points || 0;
        var tag = obj.user_name + ' ['+points+']';
        UI.addHTML(null, id, {uiclass: 'testype ui_html', pos: pos, resetlast: true, markup: tag});
      }
    }
    // Draw world
    var list = Grid.findByArea(client_user.world_grid, scr_pos,
      [TILE_X + JSGlobal.w, TILE_Y + JSGlobal.h]);
      for (var i in list) {
        var obj = list[i];
        World.add(obj.uuid, obj.name, Vec.sub(obj.extent[0], scr_pos), 0);
      }
      return true;
    }

    function init(test) {
      PerfTest.pushTest(function() {
          Gob.delAll();
          UI.hookUIEvents('gamebody');
          GameFrame.updateSettings(test.settings, true);
          GameFrame.setXbyY(test.viewport);

          loadTiles();
          client_user.game_active = true;
        });

      PerfTest.pushStop(function() {
        sprites_loaded = false;
      });
    }

    var Game = {};
    Game.tick = tick;
    Game.init = init;
    return Game;
  })();

