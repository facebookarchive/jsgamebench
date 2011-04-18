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

var IGob = (function() {
    var igobs = {};
    var rulemax = -1;

    function createPath(id,pos) {
      if (id > rulemax) {
        rulemax = id;
      } else {
        return;
      }
      var sheet = document.styleSheets[document.styleSheets.length - 1];
      var rule = '@-webkit-keyframes \''+id + '\''+
        '{from { -webkit-transform: translate3d('+(pos[0]-100)+'px,'+(pos[1]-100)+'px,0); } ' +
        '25% { -webkit-transform: translate3d('+(pos[0]-100)+'px,'+(100+pos[1])+'px,0); } ' +
        '50% { -webkit-transform: translate3d('+(pos[0]+100)+'px,'+(pos[1]+100)+'px,0); } ' +
        '75% { -webkit-transform: translate3d('+(pos[0]+100)+'px,'+(pos[1]-100)+'px,0); } ' +
        'to { -webkit-transform: translate3d('+(pos[0]-100)+'px,'+(pos[1]-100)+'px,0); } }';
      sheet.insertRule(rule);
    }

    function add(id, spriteid, z, scale, waypoints) {
      var domel = document.getElementById(GameFrame.getViewport().id);
      var basesprite = spriteid;
      var sprite = Sprites.spritedictionary[spriteid];

      igobs[id] = {id: id, spriteid: basesprite, scale: (scale ? scale : 1), z: (z ? z : Math.random() * 2000), dirty: true, time: Tick.current, atime: Tick.current, animate: false, discon: true};

      var gobel;
      gobel = document.createElement('div');
      gobel.id = id;
      gobel.className = "parent";
//      createPath(id, waypoints[0]);
      gobel.style.cssText = 'position:absolute';
      gobel.innerHTML = '<div style="overflow:hidden;left:0px;top:0px;width:'+sprite.width+'px;height:'+sprite.height+'px;" class="animating"><img class="sprite animating" src="' + sprite.url +'"></img></div>';
      domel.appendChild(gobel);
      DomRender.transformedProp3d(gobel, waypoints[0], [0,0], true);
      return igobs[id];
    }

    function del(id) {
      var gobel = document.getElementById(id);
      if (gobel)
        gobel.parentNode.removeChild(gobel);

      delete igobs[id];
    }

    function delAll() {
      for (var id in igobs) {
        del(id);
      }
      igobs = {};
      IGob.igobs = igobs;
    }


    var IGob = {};
    IGob.add = add;
    IGob.del = del;
    IGob.delAll = delAll;
    IGob.igobs = igobs;
    return IGob;
  })();
