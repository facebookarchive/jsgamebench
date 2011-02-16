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

var cam_pos = [0,0];

(function() {
  var display, physics;
  var uw, uh;
  var b2Vec2 = Box2D.Common.Math.b2Vec2;

  FB.provide('Demo', {

    // Default pictures to use
    defaultPic: 'images/facebook-logo.gif',
    friends: null,
    touchEventSubscribed: false,
    remainingPirates: 2,
    reloadButton: null,
    action: null,
    cameraTimer: 0,
    fireTime: 0,
    inReplay: false,
    setup: function() {


      scrollTo(0,1);
    },

    play: function() {
      console.log('start play');
      FB.Event.fire('game.state', 'play');
      display = new FB.Game.Display(FB.$('canvas'), window.innerWidth * 2, window.innerHeight);
      physics = new FB.Game.Physics(display);
      physics.run();
      uw = display.lW / 100;
      uh = display.lH / 100;
      console.log('JSGlobal.h : ' + JSGlobal.h);
      World.add(Utils.uuidv4(), 'background', [0,JSGlobal.h - 768], 0);
      FB.Demo.setupWalls();
      FB.Demo.setupWaitingPirates();
      FB.Demo.setupSling();
      FB.Demo.setupNodes();
      FB.Demo.setupEvents();
    },

    replay: function(data) {
      FB.Demo.inReplay = true;
      FB.Demo.reload();
      window.setTimeout(function() {
        var piratePos = FB.Demo.pirate.GetPosition();
        FB.Demo._mouseJoint = physics.addMouseJoint(FB.Demo.pirate, piratePos.x, piratePos.y, 1000);
        var pos = new b2Vec2(data.mouseTarget.x, data.mouseTarget.y);
        FB.Demo._mouseJoint.SetTarget(pos);
        window.setTimeout(function() {
          FB.Demo.firePirate();
        }, 2000);
      }, 1000);
    },

    /**
     * Reloads the game state from scratch
     * Unfortunately, it does not work right now.
     */
    reload: function(e) {
      display.destroy();
      physics.destroy();
      display = physics =
        FB.Demo._mouseJoint = FB.Demo._elastic =
        FB.Demo.slingAnchor = FB.Demo.pirate = null;
      FB.Demo._firing = false;
      FB.Demo.setCanvasViewPort({
        x: 0,
        duration: 0
      });
      FB.Demo.play();
    },

    setupEvents: function() {
      if (!FB.Demo.touchEventSubscribed) {
        FB.Demo._addEventsListener(document, [
          'touchstart', 'mousedown',
          'touchmove', 'mousemove',
          'touchend', 'mouseup'], FB.bind(FB.Demo._onTouch, this));
        FB.Demo.touchEventSubscribed = true;
      }
     physics.contactListener.PreSolve = FB.Demo._preSolve;
    },

    _mouseJoint: null,
    _elastic: null,
    _firing: false,

    _onTouch: function(e) {
      if (FB.Demo.inReplay) {
        return;
      }
      var canvas = FB.$('canvas');
      switch(e.type) {
      case 'mousedown':
      case 'touchstart':
        FB.Demo.action = null;
         if (e.target == FB.Demo.reloadButton) {
           FB.Demo.reload(e);
         } else {
           FB.Demo._clearJoint();
           var pos = display.getLogicEventPos(e);
           if (FB.Demo._checkApproximateTouch(FB.Demo.pirate, pos, uh * 20)) {
             FB.Demo.action = {type: 'aim'};
             console.log('Aim!');
             var piratePos = FB.Demo.pirate.GetPosition();
             FB.Demo._mouseJoint = physics.addMouseJoint(FB.Demo.pirate, piratePos.x, piratePos.y, 1000);
             FB.Demo._firing = false;
             handled = true;
           } else {
             FB.Demo.action = {type: 'scroll',
                            startMousePos: display.getEventPos(e),
                            lastMousePos: display.getEventPos(e),
                            direction: -3,
                            startCanvasPos: FB.Demo.getCanvasViewPort()
                           };
//             canvas.style.webkitTransitionDuration = '0s';
           }
         }
        break;
      case 'mousemove':
      case 'touchmove':
        if (FB.Demo.action) {
          if (FB.Demo.action.type == 'aim') {
            var pos = display.getLogicEventPos(e);
            FB.Demo._mouseJoint.SetTarget(pos);
            handled = true;
          } else if (FB.Demo.action.type == 'scroll') {
            pos = display.getEventPos(e);
            FB.Demo.setCanvasViewPort({
              x:  FB.Demo.action.startCanvasPos.x - pos.x + FB.Demo.action.startMousePos.x,
            });
            FB.Demo.action.direction = FB.Demo.action.lastMousePos.x - pos.x;
            FB.Demo.action.lastMousePos = pos;
           }
        }
        break;
      case 'mouseup':
      case 'touchend':
        if (FB.Demo.action) {
          if (FB.Demo.action.type == 'aim') {
            FB.Demo.firePirate();
            handled = true;
          } else if (FB.Demo.action.type == 'scroll') {
            FB.Demo.setCanvasViewPort({
              x:  FB.Demo.action.direction <= 0 ? 0 :
                FB.$('canvas').offsetWidth - FB.$('gameviewport').offsetWidth,
              duration: Math.min(2, 6 / Math.abs(FB.Demo.action.direction))
            });
          }
          FB.Demo.action = null;
        }
        break;
      }

      e.preventDefault();
      e.returnValue = false;
      return false;
    },

    firePirate: function() {
      FB.Demo.targetPosition = FB.Demo._mouseJoint.GetTarget();
      FB.Demo._clearJoint();
      FB.Demo._firing = true;
      if (FB.Demo.cameraTimer == 0) {
        FB.Demo.cameraTimer = setInterval(FB.Demo.onCameraTimer, 10);
        FB.Demo.fireTime = (new Date()).getTime();
      }
      var visual = FB.Demo.pirate.GetUserData();
      display.setVisualImage(visual,'images/bouncing_pirate.png'); // in_sling_pirate.png
      console.log('Fire!');
    },

    onCameraTimer: function() {
      var timeElapsed = (new Date()).getTime() - FB.Demo.fireTime;
      if (timeElapsed > 3000) {
        console.log('clear camera timer');
        clearInterval(FB.Demo.cameraTimer);

        if (!FB.Demo.inReplay) {
          // Fake a random score
          FB.Game.Players.curPlayer.setProperty('score', Math.round(Math.random() * 100));
          FB.Game.Players.curPlayer.setProperty('replayData', {
            mouseTarget: {x: FB.Demo.targetPosition.x,
                          y: FB.Demo.targetPosition.y
                         }
          });
        } else {
          FB.Demo.inReplay = false;
        }

        FB.Event.fire('game.state', 'playOver');
        FB.Demo.cameraTimer = 0;
      }

      var v = FB.Demo.getCanvasViewPort();
      var bv = FB.Demo.pirate.GetUserData();
      if (0) {
        var pirateDom = FB.Demo.pirate.GetUserData().dom;
        var piratePos = {x: pirateDom.offsetLeft, y: pirateDom.offsetTop};
      } else {
        piratePos = {x: bv.x * display.getScale(), y: bv.y * display.getScale() };
      }
      var w2 =  v.viewportWidth / 2,
      h2 = v.viewportHeight / 2;
      var cv = {x: v.x + w2,
                y: v.y + h2};

      var d = {x: piratePos.x - cv.x,
               y: piratePos.y - cv.y};

      if (d.x > 0) {
        d.x = Math.max(d.x + display.logic2device(display.lW / 3) - w2, 0);
      } else {
        d.x = Math.min(d.x - display.logic2device(bv.width * 4) + w2, 0);
      }

      if (d.y > 0) {
        d.y = Math.max(d.y - h2, 0);
      } else {
        d.y = Math.min(d.y + h2, 0);
      }


      setting = {
        duration: 0.5
      };
      if (d.x !== 0) {
        setting.x = v.x + d.x;
      }

      if (d.y !== 0) {
        setting.y = v.y + d.y;
      }

      if (setting.x !== undefined ||
         setting.y !== undefined) {
        FB.Demo.setCanvasViewPort(setting);
      }
    },

    getCanvasViewPort: function() {
      var viewport = FB.$('gameviewport');
      var c = FB.$('canvas');
      return {
        x: -c.offsetLeft,
        y: -c.offsetTop,
        viewportWidth: viewport.offsetWidth,
        viewportHeight: viewport.offsetHeight,
        width: c.offsetWidth,
        height: c.offsetHeight,

      };
    },

    setCanvasViewPort: function(setting) {
      var canvas = FB.$('canvas');
      var curViewPort = FB.Demo.getCanvasViewPort();

      var changed = false;
      if (setting.x !== undefined) {
        var x = Math.max(Math.min(curViewPort.width - curViewPort.viewportWidth,
                                  setting.x), 0);
       // x = setting.x;
        if (x != curViewPort.x) {
          canvas.style.left = -x + 'px';
          cam_pos[0] = x;
          changed = true;
        }
      }

      if (setting.y !== undefined) {
        var y = Math.max(Math.min(curViewPort.height - curViewPort.viewportHeight,
                                    setting.y), 0);
      //  y = setting.y;
        if (y != curViewPort.y) {
          canvas.style.top = -y + 'px';
          cam_pos[1] = y;
          changed = true;
        }
      }

      if (changed) {
        var duration = setting.duration || 0;
        // console.log('duration = ' + duration);
        canvas.style.webkitTransitionDuration = duration + 's';
        if (duration > 0) {
          canvas.style.webkitTransitionTimingFunction = 'ease';
        }
      }
      //console.log('cam : ' + cam_pos);
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

    _addEventsListener: function(obj, events, cb) {
      for (var i=0; i < events.length; i++) {
        obj.addEventListener(events[i], cb, true);
      }
    },

    _removeEventsListener: function(obj, events, cb) {
      for (var i=0; i < events.length; i++) {
        obj.removeEventListener(events[i], cb);
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
        height: uh * 30,
      };

      var horzShapeInfo = {
        type: 'box',
        width: uh * 30,
        height: uh * 5,
      };

      var shortHorzShapeInfo = {
        type: 'box',
        width: uh * 20,
        height: uh * 5,
      };

      var pigShapeInfo = {
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
      var pigInfo = FB.copy({shape: pigShapeInfo}, info);


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
        x:  dx,
        y:  lh - (vertShapeInfo.height / 2 + dy),
        angle: 0,
        imgSrc: vertPic
      }), vertInfo);


      physics.addBody(display.addVisual({
        x:  dx + shortHorzShapeInfo.width,
        y:  lh - (vertShapeInfo.height / 2 + dy),
        angle: 0,
        imgSrc: vertPic
      }), vertInfo);

      pigPic = 'images/ninja1.png';

      physics.addBody(display.addVisual({
        x:  dx + shortHorzShapeInfo.width / 2,
        y:  lh - (pigShapeInfo.radius + dy),
        angle: 0,
        imgSrc: pigPic
      }), pigInfo);



      physics.addBody(display.addVisual({
        x:  dx + shortHorzShapeInfo.width / 2,
        y:  lh - (shortHorzShapeInfo.height / 2 + dy + vertShapeInfo.height),
        angle: 0,
        imgSrc: horzPic
      }), shortHorzInfo);

      physics.addBody(display.addVisual({
        x:  dx + shortHorzShapeInfo.width / 2,
        y:  lh - (pigShapeInfo.radius + dy + vertShapeInfo.height + shortHorzShapeInfo.height),
        angle: 0,
        imgSrc: pigPic
      }), pigInfo);

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
        x: display.lW,
        y: display.lH / 2,
        imgSrc: 'images/wall.png'
      }), info);

    }

  });


})();

Init.setFunctions({draw: Render.tick, ui: UI.tick});
