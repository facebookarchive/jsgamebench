var g_scale;

(function() {

  FB.Class('Game.Display', function(dom, dW, dH) {
    this.dom = dom;
    // Compute and lock canvas dimension so that it
    // does not change as screen rotate
    this.dW = dW;
    this.dH = dH;

    this.dom.style.width = this.dW + 'px';
    this.dom.style.height = this.dH + 'px';

    this.lW = 50.0; // Use fixed logic width that is suited for physics engine
    g_scale = this.scale = this.dW / this.lW; //FIXMEBRUCE
    this.lH = this.dH / this.scale;
    this.visuals = [];
    this.useImageCache = false; // Not using image cache code because it does not seem to improve perf yet
    this.originalOrientation = window.orientation;
    this._orientationchangeCb =  FB.bind(this.onOrientationChange,
                                         this);
    if (FB.Game.Display.has3dsupport === undefined) {
      FB.Game.Display.has3dsupport = this.detect3Dsupport();
    }

    window.addEventListener('orientationchange', this._orientationchangeCb, false);
  }, {

    destroy: function() {
      window.removeEventListener('orientationchange', this._orientationchangeCb);
      this.dom.innerHTML = '';
    },

    onOrientationChange: function(e) {
      // TODO: With all the codes below, I still
      // cannot get handle rotaton propertly. Sigh ...
      window.scrollTo(0, 1);
      var orientation = window.orientation;
      var delta = this.originalOrientation - orientation;

      var x=0 ,y=0;
      switch(delta) {
      case 0:
        x = y =0;
        break;
      case -90:
        x = (this.lH - this.lW);
        y = - (this.lH - this.lW);
        break;
      case 90:
        x = (this.lH - this.lW);
        y = - (this.lH - this.lW);
        
      }
      this.dom.style.top = this.toPx(y);
      this.dom.style.left = this.toPx(x);
      this.dom.style.webkitTransform = 'rotate(' + delta + "deg)";
    },
    
    debugPos: function(dom, name) {
      console.log("Dom=" + name + " offset=" + dom.offsetLeft + "," + dom.offsetTop + 
                  ',' + dom.offsetWidth + "," +  dom.offsetHeight +
                  " client " + dom.clientLeft + "," + dom.clientTop + 
                  ',' + dom.clientWidth + "," +  dom.clientHeight +
                  ' scroll=' + dom.scrollLeft + ',' + dom.scrollTop +
                  ')'
                 );

    },

    detect3Dsupport: function() {
      var div = document.createElement('div');
      var transform = 'rotate3d(0, 0, 1, 0deg)';
      div.style.webkitTransform = transform;
      return div.style['-webkit-transform'] == transform;
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
        gob.pos[0] = visual.x * this.scale - cam_pos[0] - el.width/2;
        gob.pos[1] = visual.y * this.scale - cam_pos[1] - el.height/2;
        gob.theta = visual.angle || 0;
        gob.dirty = true;
      }
    },

    setVisualImage: function(visual, name) {
      if (!name) {
        return visual;
      }
      var split = name.split('/');
      name = split[split.length-1];
      name = name.split('.')[0];
      visual.name = name;
      // this.scale
      var pos = [visual.x * this.scale, visual.y * this.scale];
      var g = Gob.addSimple(visual.id,name,pos,visual.z_index || visual.id,0);
      g.visual = visual;
      g.angle = visual.angle;
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
      if (1) {
        if (visual.motionCb) {
          visual.motionCb(visual,x,y,angle);
        } else {
          visual.x = x;
          visual.y = y;
          visual.angle = angle;
        }
        this.visualToGob(visual);
      } else {
        if (visual.imgSrc && this.useImageCache) {
          var data = FB.ImageCache.getCache(visual.imgSrc, dw, dh, angle);
          if (data) {
            visual.dom.style.width =  data.box.w + 'px';
            visual.dom.style.height =  data.box.h + 'px';
            visual.dom.style.top = Math.round(y * this.scale - data.box.h / 2) + 'px';
            visual.dom.style.left = Math.round(x * this.scale - data.box.w / 2) + 'px';
            visual.dom.style.backgroundImage = 'url(' + data.url + ')';
          }
        } else {
          visual.dom.style.width =  dw + 'px';
          visual.dom.style.height =  dh + 'px';
          visual.dom.style.top = this.toPx(y - visual.height / 2);
          visual.dom.style.left = this.toPx(x - visual.width / 2);
          angle = Math.round(angle * 180 / Math.PI);
        
          // Use 3d transform to get hardware acceleration if possible
          if (FB.Game.Display.has3dsupport) {
            visual.dom.style.webkitTransform = 'rotate3d(0,0,1,' +  angle + "deg)";
          } else {
            visual.dom.style.webkitTransform = 'rotate(' +  angle + "deg)";
          }
        }
      }
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

    getLogicEventPos: function(e) {
      var pos = this.getEventPos(e);
      var viewport =  FB.$('gameviewport');
      pos.x -= viewport.offsetLeft;
      pos.y -= viewport.offsetTop;
      return new b2Vec2(this.device2logic(pos.x),
                        this.device2logic(pos.y));
    },

    toPx: function(x) {
      return Math.round(x * this.scale) + 'px';
    },

    device2logic: function(x) {
      return x / this.scale;
    },

    logic2device: function(x) {
      return x * this.scale;
    }

  });


  FB.Class('Game.Physics', function(display) {
    this.world = new b2World(
      new b2Vec2(0, 10), true
    ); 
    this.contactListener = new b2ContactListener();
    this.world.SetContactListener(this.contactListener);
    this.display = display;
    this.frameRate = 50;
    this.velocityIterations = 6;
    this.positionIterations = 2;
    this.timer = 0;
  }, {
    run: function() {
      this.timer = setInterval(FB.bind(this.onUpdate, this), 1000 / this.frameRate);
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
      FB.FramerateMonitor.startFrame();
      this.display.draw();
      this.world.ClearForces();
      FB.FramerateMonitor.endFrame();
    },

    addBody: function(visual, info) {
      var bodyDef = new b2BodyDef();
      var fixDef = new b2FixtureDef();
      var shape;
      bodyDef.type = info.dynamic ? b2Body.b2_dynamicBody : b2Body.b2_staticBody;
      bodyDef.position.Set(visual.x, visual.y);
      switch (info.shape.type) {
      case 'box':
        shape = new b2PolygonShape();
        shape.SetAsBox(info.shape.width / 2, info.shape.height / 2);
        visual.width = info.shape.width;
        visual.height = info.shape.height;
        break;
      case 'circle':
        shape = new b2CircleShape(info.shape.radius);
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
      var md = new b2MouseJointDef();
      md.bodyA = this.world.GetGroundBody();
      md.bodyB = body;
      md.target.Set(mouseX, mouseY);
      md.collideConnected = true;
      md.maxForce = maxForce * body.GetMass();
      body.SetAwake(true);
      return this.world.CreateJoint(md);
    },

    addElastic: function(bA, bB, visual, freq, damp) {
	    var jd = new b2DistanceJointDef();
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

  var b2Mat22 = Box2D.Common.Math.b2Mat22;
  var b2Mat33 = Box2D.Common.Math.b2Mat33;
  var b2Math = Box2D.Common.Math.b2Math;
  var b2Sweep = Box2D.Common.Math.b2Sweep;
  var b2Transform = Box2D.Common.Math.b2Transform;
  var b2Vec2 = Box2D.Common.Math.b2Vec2;
  var b2Vec3 = Box2D.Common.Math.b2Vec3;
  var b2Color = Box2D.Common.b2Color;
  var b2internal = Box2D.Common.b2internal;
  var b2Settings = Box2D.Common.b2Settings;
  var b2AABB = Box2D.Collision.b2AABB;
  var b2Bound = Box2D.Collision.b2Bound;
  var b2BoundValues = Box2D.Collision.b2BoundValues;
  var b2BroadPhase = Box2D.Collision.b2BroadPhase;
  var b2Collision = Box2D.Collision.b2Collision;
  var b2ContactID = Box2D.Collision.b2ContactID;
  var b2ContactPoint = Box2D.Collision.b2ContactPoint;
  var b2Distance = Box2D.Collision.b2Distance;
  var b2DistanceInput = Box2D.Collision.b2DistanceInput;
  var b2DistanceOutput = Box2D.Collision.b2DistanceOutput;
  var b2DistanceProxy = Box2D.Collision.b2DistanceProxy;
  var b2DynamicTree = Box2D.Collision.b2DynamicTree;
  var b2DynamicTreeBroadPhase = Box2D.Collision.b2DynamicTreeBroadPhase;
  var b2DynamicTreeNode = Box2D.Collision.b2DynamicTreeNode;
  var b2DynamicTreePair = Box2D.Collision.b2DynamicTreePair;
  var b2Manifold = Box2D.Collision.b2Manifold;
  var b2ManifoldPoint = Box2D.Collision.b2ManifoldPoint;
  var b2OBB = Box2D.Collision.b2OBB;
  var b2Pair = Box2D.Collision.b2Pair;
  var b2PairManager = Box2D.Collision.b2PairManager;
  var b2Point = Box2D.Collision.b2Point;
  var b2Proxy = Box2D.Collision.b2Proxy;
  var b2RayCastInput = Box2D.Collision.b2RayCastInput;
  var b2RayCastOutput = Box2D.Collision.b2RayCastOutput;
  var b2Segment = Box2D.Collision.b2Segment;
  var b2SeparationFunction = Box2D.Collision.b2SeparationFunction;
  var b2Simplex = Box2D.Collision.b2Simplex;
  var b2SimplexCache = Box2D.Collision.b2SimplexCache;
  var b2SimplexVertex = Box2D.Collision.b2SimplexVertex;
  var b2TimeOfImpact = Box2D.Collision.b2TimeOfImpact;
  var b2TOIInput = Box2D.Collision.b2TOIInput;
  var b2WorldManifold = Box2D.Collision.b2WorldManifold;
  var ClipVertex = Box2D.Collision.ClipVertex;
  var Features = Box2D.Collision.Features;
  var IBroadPhase = Box2D.Collision.IBroadPhase;
  var b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
  var b2EdgeChainDef = Box2D.Collision.Shapes.b2EdgeChainDef;
  var b2EdgeShape = Box2D.Collision.Shapes.b2EdgeShape;
  var b2MassData = Box2D.Collision.Shapes.b2MassData;
  var b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
  var b2Shape = Box2D.Collision.Shapes.b2Shape;
  var b2Body = Box2D.Dynamics.b2Body;
  var b2BodyDef = Box2D.Dynamics.b2BodyDef;
  var b2ContactFilter = Box2D.Dynamics.b2ContactFilter;
  var b2ContactImpulse = Box2D.Dynamics.b2ContactImpulse;
  var b2ContactListener = Box2D.Dynamics.b2ContactListener;
  var b2ContactManager = Box2D.Dynamics.b2ContactManager;
  var b2DebugDraw = Box2D.Dynamics.b2DebugDraw;
  var b2DestructionListener = Box2D.Dynamics.b2DestructionListener;
  var b2FilterData = Box2D.Dynamics.b2FilterData;
  var b2Fixture = Box2D.Dynamics.b2Fixture;
  var b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
  var b2Island = Box2D.Dynamics.b2Island;
  var b2TimeStep = Box2D.Dynamics.b2TimeStep;
  var b2World = Box2D.Dynamics.b2World;
  var b2CircleContact = Box2D.Dynamics.Contacts.b2CircleContact;
  var b2Contact = Box2D.Dynamics.Contacts.b2Contact;
  var b2ContactConstraint = Box2D.Dynamics.Contacts.b2ContactConstraint;
  var b2ContactConstraintPoint = Box2D.Dynamics.Contacts.b2ContactConstraintPoint;
  var b2ContactEdge = Box2D.Dynamics.Contacts.b2ContactEdge;
  var b2ContactFactory = Box2D.Dynamics.Contacts.b2ContactFactory;
  var b2ContactRegister = Box2D.Dynamics.Contacts.b2ContactRegister;
  var b2ContactResult = Box2D.Dynamics.Contacts.b2ContactResult;
  var b2ContactSolver = Box2D.Dynamics.Contacts.b2ContactSolver;
  var b2EdgeAndCircleContact = Box2D.Dynamics.Contacts.b2EdgeAndCircleContact;
  var b2NullContact = Box2D.Dynamics.Contacts.b2NullContact;
  var b2PolyAndCircleContact = Box2D.Dynamics.Contacts.b2PolyAndCircleContact;
  var b2PolyAndEdgeContact = Box2D.Dynamics.Contacts.b2PolyAndEdgeContact;
  var b2PolygonContact = Box2D.Dynamics.Contacts.b2PolygonContact;
  var b2PositionSolverManifold = Box2D.Dynamics.Contacts.b2PositionSolverManifold;
  var b2Controller = Box2D.Dynamics.Controllers.b2Controller;
  var b2ControllerEdge = Box2D.Dynamics.Controllers.b2ControllerEdge;
  var b2DistanceJoint = Box2D.Dynamics.Joints.b2DistanceJoint;
  var b2DistanceJointDef = Box2D.Dynamics.Joints.b2DistanceJointDef;
  var b2FrictionJoint = Box2D.Dynamics.Joints.b2FrictionJoint;
  var b2FrictionJointDef = Box2D.Dynamics.Joints.b2FrictionJointDef;
  var b2GearJoint = Box2D.Dynamics.Joints.b2GearJoint;
  var b2GearJointDef = Box2D.Dynamics.Joints.b2GearJointDef;
  var b2Jacobian = Box2D.Dynamics.Joints.b2Jacobian;
  var b2Joint = Box2D.Dynamics.Joints.b2Joint;
  var b2JointDef = Box2D.Dynamics.Joints.b2JointDef;
  var b2JointEdge = Box2D.Dynamics.Joints.b2JointEdge;
  var b2LineJoint = Box2D.Dynamics.Joints.b2LineJoint;
  var b2LineJointDef = Box2D.Dynamics.Joints.b2LineJointDef;
  var b2MouseJoint = Box2D.Dynamics.Joints.b2MouseJoint;
  var b2MouseJointDef = Box2D.Dynamics.Joints.b2MouseJointDef;
  var b2PrismaticJoint = Box2D.Dynamics.Joints.b2PrismaticJoint;
  var b2PrismaticJointDef = Box2D.Dynamics.Joints.b2PrismaticJointDef;
  var b2PulleyJoint = Box2D.Dynamics.Joints.b2PulleyJoint;
  var b2PulleyJointDef = Box2D.Dynamics.Joints.b2PulleyJointDef;
  var b2RevoluteJoint = Box2D.Dynamics.Joints.b2RevoluteJoint;
  var b2RevoluteJointDef = Box2D.Dynamics.Joints.b2RevoluteJointDef;
  var b2WeldJoint = Box2D.Dynamics.Joints.b2WeldJoint;
  var b2WeldJointDef = Box2D.Dynamics.Joints.b2WeldJointDef;
  var b2internal = Box2D.Common.b2internal;
  var b2Body = Box2D.Dynamics.b2Body;
  var b2BodyDef = Box2D.Dynamics.b2BodyDef;
  var b2ContactFilter = Box2D.Dynamics.b2ContactFilter;
  var b2ContactImpulse = Box2D.Dynamics.b2ContactImpulse;
  var b2ContactListener = Box2D.Dynamics.b2ContactListener;
  var b2ContactManager = Box2D.Dynamics.b2ContactManager;
  var b2DebugDraw = Box2D.Dynamics.b2DebugDraw;
  var b2DestructionListener = Box2D.Dynamics.b2DestructionListener;
  var b2FilterData = Box2D.Dynamics.b2FilterData;
  var b2Fixture = Box2D.Dynamics.b2Fixture;
  var b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
  var b2Island = Box2D.Dynamics.b2Island;
  var b2TimeStep = Box2D.Dynamics.b2TimeStep;
  var b2World = Box2D.Dynamics.b2World;

})();
