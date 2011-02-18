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

var win_size = [];
(function() {

  FB.Class('Game.Display', function(dW, dH) {
    this.dW = dW;
    this.dH = dH;
    this.lW = 50.0;
    this.scale = dW / 50.0; // Use fixed logic width that is suited for physics engine
    this.lH = this.dH / this.scale;
    console.log('scale: ' + this.scale);
    this.visuals = [];
    win_size[0] = dW;
    win_size[1] = dH;
  }, {

    getScale: function() {
      return this.scale;
    },

    draw: function () {
      for (var i=0; i < this.visuals.length; i++) {
        this.drawVisual(this.visuals[i]);
      }
    },

    visualToGob: function(visual) {
      var gob = visual.gob;
      if (gob) {
        var el = Sprites.spritedictionary[visual.name].imageel;
        gob.pos[0] = visual.x * this.scale - cam_pos[0] - el.width / 2;
        gob.pos[1] = visual.y * this.scale - cam_pos[1] - el.height / 2;
        gob.theta = visual.angle || 0;
        gob.dirty = true;
        gob.scale = this.scale / this.lW;
      }
    },

    setVisualImage: function(visual, name) {
      if (!name) {
        return visual;
      }
      // FIXMEBRUCE - hack to shim from URL to NAME resource
      var split = name.split('/');
      name = split[split.length-1];
      name = name.split('.')[0];
      visual.name = name;
      var pos = [visual.x * this.scale, visual.y * this.scale];
      var g = Gob.addSimple(visual.id,name,pos,visual.z_index || visual.id,0);
      visual.gob = g;
      this.visualToGob(visual);
      return visual;
    },
    
    addVisual: function (visual) {
      this.visuals[this.visuals.length] = visual;
      this.vis_id_count = (this.vis_id_count || 0) + 1;
      visual.id = this.vis_id_count;
      return this.setVisualImage(visual,visual.imgSrc);
    },

    removeVisual: function(visual) {
      Gob.del(visual.id);
      return;
      if (visual.dom) {
        this.dom.removeChild(visual.dom);
        var i = this.visuals.indexOf(visual);
        if (i >= 0) {
          this.visuals.splice(i, 1);
        }
      }
    },

    drawVisual: function(visual) {
      var x,y,angle;
      if (visual.body) {
        var pos = visual.body.GetPosition();
        x = pos.x;
        y = pos.y;
        angle = visual.body.GetAngle();
      } else if (visual.joint) {
        var joint = visual.joint;
        var a1 = joint.GetAnchorA();
        var a2 = joint.GetAnchorB();
        var v = a1.Copy();
        v.Subtract(a2);
        angle = Math.atan2(v.y, v.x);
        var c = a1.Copy();
        c.Add(a2);
        c.Multiply(0.5);
        x = c.x;
        y = c.y;
        visual.width = Math.abs(v.Length());
      } else {
        x = visual.x;
        y = visual.y;
        angle = visual.angle;
      }

      var dw = Math.round(visual.width * this.scale);
      var dh =  Math.round(visual.height * this.scale);

      if (visual.motionCb) {
        visual.motionCb(visual,x,y,angle);
      } else {
        visual.x = x;
        visual.y = y;
        visual.angle = angle;
      }
      visual.scoreCb && visual.scoreCb(visual);
      this.visualToGob(visual);
    },

    getEventPos: function(e) {
      if (e.touches) {
        pos = {
          x: e.touches[0].pageX,
          y: e.touches[0].pageY
        };
      } else {
        pos = {
          x: e.pageX,
          y: e.pageY
        };
      }

      return pos;
    },

    device2logic: function(x) {
      return x / this.scale;
    },

    logic2device: function(x) {
      return x * this.scale;
    }

  });


  FB.Class('Game.Physics', function(display) {
    this.world = new Box2D.Dynamics.b2World(
      new Box2D.Common.Math.b2Vec2(0, 10), true
    ); 
    this.contactListener = new Box2D.Dynamics.b2ContactListener();
    this.world.SetContactListener(this.contactListener);
    this.display = display;
    this.frameRate = 50;
    this.velocityIterations = 6;
    this.positionIterations = 2;
    this.timer = 0;
  }, {
    run: function() {
      this.timer = setInterval(FB.bind(this.onUpdate, this), 1000 / this.frameRate);
      console.log('interval: ' + 1000 / this.frameRate);
    },

    freeze: function() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = -1;
      }
    },

    destroy: function() {
      this.freeze();
      this.world = null;
      this.contactListener = null;
    },

    onUpdate: function() {
      this.world.Step(1.0 / this.frameRate, this.velocityIterations,
                      this.positionIterations);
      //FB.FramerateMonitor.startFrame();
      //this.display.draw();
      this.world.ClearForces();
      //FB.FramerateMonitor.endFrame();
    },

    addBody: function(visual, info) {
      var bodyDef = new Box2D.Dynamics.b2BodyDef();
      var fixDef = new Box2D.Dynamics.b2FixtureDef();
      var shape;

      bodyDef.type = info.dynamic ? Box2D.Dynamics.b2Body.b2_dynamicBody : Box2D.Dynamics.b2Body.b2_staticBody;
      bodyDef.position.Set(visual.x, visual.y);
      switch (info.shape.type) {
      case 'box':
        shape = new Box2D.Collision.Shapes.b2PolygonShape();
        shape.SetAsBox(info.shape.width / 2, info.shape.height / 2);
        visual.width = info.shape.width;
        visual.height = info.shape.height;
        break;
      case 'circle':
        shape = new Box2D.Collision.Shapes.b2CircleShape(info.shape.radius);
        visual.width = visual.height = info.shape.radius * 2;
        break;
      default:
        throw new exception('unsupported shape = ' + info.shape.type);
      }
      fixDef.shape = shape;

      if (info.density) {
        fixDef.density = info.density;
      }

      if (info.friction) {
        fixDef.friction = info.friction;
      }
      
      if (info.restitution) {
        fixDef.restitution = info.restitution;
      }

      body = this.world.CreateBody(bodyDef);
      body.CreateFixture(fixDef);
      body.SetUserData(visual);
      visual.body = body;
      return body;
    },

    addMouseJoint: function(body, mouseX, mouseY, maxForce) {
      maxForce = maxForce || 300;
      var md = new Box2D.Dynamics.Joints.b2MouseJointDef();
      md.bodyA = this.world.GetGroundBody();
      md.bodyB = body;
      md.target.Set(mouseX, mouseY);
      md.collideConnected = true;
      md.maxForce = maxForce * body.GetMass();
      body.SetAwake(true);
      return this.world.CreateJoint(md);
    },

    addElastic: function(bA, bB, visual, freq, damp) {
	    var jd = new Box2D.Dynamics.Joints.b2DistanceJointDef();
	    jd.Initialize(bA, bB, bA.GetWorldCenter(), bB.GetWorldCenter());
	    jd.frequencyHz = freq || 3.0;
	    jd.dampingRatio = damp || 0.1;
	    jd.collideConnected = true;
	    var joint = this.world.CreateJoint(jd);
      if (visual) {
        joint.SetUserData(visual);
        visual.joint = joint;
      }
      return joint;
    },

    breakJoint: function(joint) {
	    this.world.DestroyJoint(joint);
      var visual = joint.GetUserData();
      if (visual) {
        if (visual.cutJointCB) {
          visual.motionCb = visual.cutJointCB;
        } else {
          this.display.removeVisual(visual);
        }
      }
    }
  });


})();
