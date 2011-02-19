// Copyright 2004-present Facebook. All Rights Reserved.

// Licensed under the Apache License, Version 2.0 (the "License"); you may
// not use this file except in compliance with the License. You may obtain
// a copy of the License at

//     http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.ninja

var cam_pos = [0,0];

(function() {
  var display, physics;
  var uw, uh;
  var b2Vec2 = Box2D.Common.Math.b2Vec2;

  FB.provide('Demo', {

    // Default pictures to use
    defaultPic: 'images/facebook-logo.gif',
    friends: null,
    pirate: false,
    remainingPirates: 2,
    reloadButton: null,
    action: null,
    cameraTimer: 0,
    fireTime: 0,
    in_replay: true,

    play: function(clicked) {
      FB.Demo.inited = true;
      FB.Demo.did_shoot = false;
      FB.Demo.playing = true;
      FB.Demo.in_replay = false;
      cam_pos = [0,0];
      console.log('start play');
      display = new FB.Game.Display(2000 * JSGlobal.h/650, JSGlobal.h);
      physics = new FB.Game.Physics(display);
      physics.run();
      uw = display.lW / 100;
      uh = display.lH / 100;
      World.add('bg_idx', 'background', [JSGlobal.w*0.45,JSGlobal.h - 768 + 768/2], 0);
      FB.Demo.setupWalls();
      FB.Demo.setupWaitingPirates();
      FB.Demo.setupSling();
      FB.Demo.setupNodes();
      physics.contactListener.PreSolve = FB.Demo._preSolve;
    },

    replay: function() {
      var target = FB.Demo.replayData;
      if (!target) {
        return alert('launch a pirate first');
      }
      FB.Demo.play(false);
      FB.Demo.in_replay = true;
      window.setTimeout(function() {
        var piratePos = FB.Demo.pirate.GetPosition();
        FB.Demo._mouseJoint = physics.addMouseJoint(FB.Demo.pirate, piratePos.x, piratePos.y, 1000);
        var pos = new Box2D.Common.Math.b2Vec2(target.x, target.y);
        FB.Demo._mouseJoint.SetTarget(pos);
        window.setTimeout(function() {
          FB.Demo.firePirate();
        }, 2000);
      }, 1000);
    },

    _mouseJoint: null,
    _elastic: null,
    _firing: false,
    last_x: undefined,
    last_pos: [],
  
    tick: function() {
      if (!FB.Demo.inited) {
        return;
      }
      var pos = FB.Demo.pirate.GetPosition();
      var x = pos.x * display.getScale() - JSGlobal.w/2;
      var y = pos.y * display.getScale();
      //physics && physics.onUpdate();
      var timeElapsed = (new Date()).getTime() - FB.Demo.fireTime;
      if (timeElapsed < 3000) {
        this.setCanvasViewPort(x,y);
      } else {
        var xi = x|0;
        var yi = y|0;
        if (FB.Demo.did_shoot && this.last_pos[0] == xi && this.last_pos[1] == yi)
          FB.Demo.playing = false;
        this.last_pos[0] = xi;
        this.last_pos[1] = yi;

        var pos = new Box2D.Common.Math.b2Vec2(display.device2logic(JSGlobal.mouse.x + cam_pos[0]),
                      display.device2logic(JSGlobal.mouse.y + cam_pos[1]));

        if (JSGlobal.mouse.buttons[0]==1) { // mouse down / start touch
          if (FB.Demo.did_shoot) {
            FB.Demo.playing = false;
          }
          JSGlobal.mouse.buttons[0]++;
          FB.Demo.action = null;
          FB.Demo._clearJoint();
          var adjust_pos = {x: pos.x, y:pos.y-2};
          if (FB.Demo._checkApproximateTouch(FB.Demo.pirate, adjust_pos, uh * 20)) {
            FB.Demo.action = {type: 'aim'};
            console.log('Aim!');
            var piratePos = FB.Demo.pirate.GetPosition();
            FB.Demo._mouseJoint = physics.addMouseJoint(FB.Demo.pirate, piratePos.x, piratePos.y, 1000);
            FB.Demo._firing = false;
          }
          this.last_x = JSGlobal.mouse.x;
        } else if (JSGlobal.mouse.buttons[0]) {
          if (FB.Demo.action && FB.Demo.action.type == 'aim') {
            FB.Demo._mouseJoint.SetTarget(pos);
          } else {
            if (this.last_x != undefined) {
              var dx = this.last_x - JSGlobal.mouse.x;
              this.setCanvasViewPort(cam_pos[0] + dx,undefined);
            }
          }
          this.last_x = JSGlobal.mouse.x;
        }
        else {
          this.last_x = undefined;
          if (FB.Demo.action && FB.Demo.action.type == 'aim') {
            var piratePos = FB.Demo.pirate.GetPosition();
            FB.Demo.firePirate();
            FB.Demo.replayData = {x:piratePos.x, y:piratePos.y};
            console.log('launch pirate: '+JSON.stringify(FB.Demo.replayData));
            FB.Demo.action = null;
          }
        }
      }
      display.draw();
    },

    firePirate: function() {
      Publish.clearScore();
      FB.Demo.targetPosition = FB.Demo._mouseJoint.GetTarget();
      FB.Demo._clearJoint();
      FB.Demo._firing = true;
      if (FB.Demo.cameraTimer == 0) {
       // FB.Demo.cameraTimer = setInterval(FB.Demo.onCameraTimer, 10);
        FB.Demo.fireTime = (new Date()).getTime();
      }
      var visual = FB.Demo.pirate.GetUserData();
      display.setVisualImage(visual,'images/bouncing_pirate.png'); // in_sling_pirate.png
      physics.setSpeedScale(1.5);
      FB.Demo.did_shoot = 1;
      console.log('Fire!');
    },

    setCanvasViewPort: function(x,y) {
      if (x !== undefined) {
        cam_pos[0] = Math.max(Math.min(display.dW - JSGlobal.w, x), 0);
      }
      if (y !== undefined) {
        cam_pos[1] = Math.max(Math.min(display.dH - JSGlobal.h, y), 0);
      }
    },

    _checkApproximateTouch: function(body, pos, hitDistance) {
      var bodyPos = body.GetPosition().Copy();
      bodyPos.Subtract(pos);
      var l = Math.abs(bodyPos.Length());
      var diff = l - hitDistance;
      return diff < 0;

    },

    _preSolve: function(contact, oldManifold) {
	    var bA = contact.GetFixtureA().GetBody();
	    var bB = contact.GetFixtureB().GetBody();
	    if (bA.isSling || bB.isSling) {
        // Cancel all collisions involving any sling part
		    contact.SetEnabled(false);
        // But let loose the pirate if it made the contact
        // and the user is firing
        if (bA.isPirate || bB.isPirate) {
          // For some reason the preSolve fires it seems even when the pirate is being
          // plled quite far from the anchor. Double check that the two bodies are
          // indeed close
          var vec = bA.GetPosition().Copy();
          vec.Subtract(bB.GetPosition());
          var dist = vec.Length();
          // TODO: change to uh unit !!!
		      if (dist < 0.15 * 5 && FB.Demo._elastic && FB.Demo._firing) {
		        console.log('Cut!', bA, bB);
		        physics.breakJoint(FB.Demo._elastic);
            FB.Demo._firing = false;
			      FB.Demo._elastic = null;
		      }
        }
      }
    },

    _clearJoint: function() {
      if (FB.Demo._mouseJoint) {
        physics.breakJoint(FB.Demo._mouseJoint);
	      //FIXMEBRUCE FB.Demo.pirate.GetUserData().dom.style.backgroundImage = 'url(images/flying_pirate.png)';
        FB.Demo._mouseJoint = null;
      }
    },

    slingAnchor: null,
    pirate: null,

    setupSlingAnchor: function(point) {
      var anchorShapeInfo = {
        type: 'box',
        width: uh * 3,
        height: uh * 3,
      };

      var info =  {
        dynamic: false,
        density: 2,
        friction: 0.7,
        restitution: 0.9
      };

      info.shape = anchorShapeInfo;
      var visual = display.addVisual({
        x:  point.x,
        y:  point.y,
        angle: 0,
      });
      FB.Demo.slingAnchor = physics.addBody(visual, info);
      FB.Demo.slingAnchor.isSling = true;
    },

    setupSling: function() {

      var width = uh * 15;
      var height = uh * 45;
      var dx = uh * 40;
      var x =  dx + width / 2;
      var y = display.lH - height / 2;
      var slingPoint = {
        x: x,
        y: y - height * 0.3,
      };

      var barrelChassis = display.addVisual({
        x: x,
        y: y+1,
        width: width,
        height: height,
        imgSrc: 'images/cannon_chassis.png',
        motionCb: function(visual, x, y, angle) {
          visual.x = x;
        }
      });

      var barrelVisual = display.addVisual({
        x: x,
        y: y,
        width: width,
        height: height,
        imgSrc: 'images/cannon_barrel.png',
        motionCb: function(visual, x, y, angle) {
          visual.angle = angle;
          visual.x = x;
        }
      });
      barrelChassis.cutJointCB = barrelVisual.cutJointCB = function(visual, x, y, angle) {
        visual.x = x;
      };
      FB.Demo.setupSlingAnchor(slingPoint);
      FB.Demo.setupPirate(slingPoint, barrelChassis, barrelVisual);
    },


    setupWaitingPirates: function() {
      var w = uh * 12;
      var h = w * 1.8; // The image size is 60 px x 85px
      for (var i=0; i < FB.Demo.remainingPirates; i++) {
        display.addVisual( {
          x: i * w + w/2,
          y: display.lH - h / 2,
          width: w,
          height: h,
          imgSrc: 'images/bouncing_pirate.png'
        });
      }
    },


    setupPirate: function(point, cannon_chassis, cannon_barrel) {
      var pirateShapeInfo = {
        type: 'circle',
        radius: uh * 5,
      };

      var info =  {
        dynamic: true,
        density: 1,
        friction: 0.2,
      };

      info.shape = pirateShapeInfo;
      var visual = display.addVisual({
        x: point.x,
        y: point.y,
        angle: 0,
        //imgSrc: 'images/in_sling_pirate.png',
        z_index: -1000
      });
      FB.Demo.pirate = physics.addBody(visual, info);
      FB.Demo.pirate.isPirate = true;

      FB.Demo._elastic = physics.addElastic(FB.Demo.slingAnchor, FB.Demo.pirate, cannon_barrel);
      cannon_chassis.joint = cannon_barrel.joint;
    },

    setupNodes: function() {
      var vertShapeInfo = {
        type: 'box',
        width: uh * 5,
        height: uh * 24,
      };

      var horzShapeInfo = {
        type: 'box',
        width: uh * 25,
        height: uh * 5,
      };

      var shortHorzShapeInfo = {
        type: 'box',
        width: uh * 20,
        height: uh * 5,
      };

      var ninjaShapeInfo = {
        type: 'circle',
        radius: 5 * uh,
      };

      var info =  {
        dynamic: true,
        density: 1.0,
        friction: 0.6,
        restitution: 0.1
      };

      var vertInfo = FB.copy({shape: vertShapeInfo}, info);
      var horzInfo = FB.copy({shape: horzShapeInfo}, info);
      var shortHorzInfo = FB.copy({shape: shortHorzShapeInfo}, info);
      var ninjaInfo = FB.copy({shape: ninjaShapeInfo}, info);


      vertPic = 'images/board_vert.png';
      horzPic = 'images/board_horiz.png';

      var dx = display.lW - uh * 80;
      var lh = display.lH;
      physics.addBody(display.addVisual({
        x:  dx,
        y:  lh - vertShapeInfo.height / 2,
        angle: 0,
        imgSrc: vertPic
      }), vertInfo);


      physics.addBody(display.addVisual({
        x:  dx + horzShapeInfo.width,
        y:  lh - vertShapeInfo.height / 2,
        angle: 0,
        imgSrc: vertPic
      }), vertInfo);


      var hz1 = {
        x:  dx + horzShapeInfo.width / 2,
        y:  lh - (vertShapeInfo.height + horzShapeInfo.height / 2),
        angle: 0,
        imgSrc: horzPic
      };
      physics.addBody(display.addVisual(hz1), horzInfo);

      dx += uh * 5;
      var dy = vertShapeInfo.height + horzShapeInfo.height;
      physics.addBody(display.addVisual({
        x:  dx - 0.3,
        y:  lh - (vertShapeInfo.height / 2 + dy),
        angle: 0,
        imgSrc: vertPic
      }), vertInfo);


      physics.addBody(display.addVisual({
        x:  dx + shortHorzShapeInfo.width - 0.3,
        y:  lh - (vertShapeInfo.height / 2 + dy),
        angle: 0,
        imgSrc: vertPic
      }), vertInfo);

      ninjaPic = 'images/ninja1.png';
      function scoreNinjaMotion(visual) {
        if (visual.last_x) {
          var dist = Math.abs(visual.x - visual.last_x) + Math.abs(visual.y - visual.last_y);
          dist = (dist * 10)|0;
          if (dist) {
            Publish.setScore(dist);
          }
        }
        visual.last_x = visual.x;
        visual.last_y = visual.y;
      }

      physics.addBody(display.addVisual({
        x:  dx + shortHorzShapeInfo.width / 2,
        y:  lh - (ninjaShapeInfo.radius + dy),
        angle: 0,
        imgSrc: ninjaPic,
        scoreCb: scoreNinjaMotion
      }), ninjaInfo);

      physics.addBody(display.addVisual({
        x:  dx + shortHorzShapeInfo.width / 2 -0.2,
        y:  lh - (shortHorzShapeInfo.height / 2 + dy + vertShapeInfo.height),
        angle: 0,
        imgSrc: horzPic
      }), shortHorzInfo);

      physics.addBody(display.addVisual({
        x:  dx + shortHorzShapeInfo.width / 2,
        y:  lh - (ninjaShapeInfo.radius + dy + vertShapeInfo.height + shortHorzShapeInfo.height),
        angle: 0,
        imgSrc: ninjaPic,
        scoreCb: scoreNinjaMotion
      }), ninjaInfo);

    },

    setupWalls: function() {
      // Add four walls
      info = {
        dynamic: false,
        shape: {
          type: 'box',
          width: display.lW,
          height: 0.0001
        },
        density: 1.0,
        friction: 0.8,
        restitution: 0.7
      };

      physics.addBody(display.addVisual({
        x: display.lW / 2,
        y: display.lH
        //cssClass: 'wall'
      }), info);

      info.shape.width = 0.0001;
      info.shape.height = display.lH;
      physics.addBody(display.addVisual({
        x: 0,
        y: display.lH / 2,
        imgSrc: 'images/wall.png'
      }), info);

      physics.addBody(display.addVisual({
        x: display.lW - 0.2,
        y: display.lH / 2,
        imgSrc: 'images/wall.png'
      }), info);

    }

  });


})();

