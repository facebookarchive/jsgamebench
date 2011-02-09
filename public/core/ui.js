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

var UI = (function() {
    var COLLECTION = 1;
    var BUTTON = 2;
    var HTML = 4;
    var SCROLL = 5;

    var uis = {};
    var globals = {};
    var histories = {};
    var all_dirty = true;
    var touch = false;

    var last_settings = {};

    var default_css = [
      '',
      'ui_collection',
      'ui_button',
      '',
      'ui_html',
      'ui_scroll'
    ];

    function dirtyAll() {
      all_dirty = true;
    }

    function setChanged(id) {
      if (uis[id]) {
        uis[id].changed = true;
        var parent = uis[id].parent;
        while (parent) {
          parent.kidchanged = true;
          parent = parent.parent;
        }
      }
    }

    function setChildrenChanged(id) {
      if (uis[id]) {
        for (var kid in uis[id].children) {
          uis[kid].changed = true;
          if (uis[kid].children) {
            setChildrenChanged(kid);
          }
        }
      }
    }

    function setCollectionID(collectionid, id) {
      if (collectionid) {
        var collection = uis[collectionid];
        if (collection) {
          uis[id].parent = collection;
          collection.children[id] = uis[id];
          setChanged(id);
        }
      }
    }

    function check(id) {
      return uis[id] !== undefined;
    }

    function del(id) {
      var kid;
      var upel = document.getElementById('parent' + id);
      if (upel) {
        var el = upel.parentNode;
        el.removeChild(upel);
      }
      var ui = uis[id];
      if (ui) {
        if (ui.children) {
          for (kid in ui.children) {
            del(kid);
          }
        }
        if (ui.parent) {
          delete ui.parent.children[id];
          setChanged(ui.parent.id);
          setChildrenChanged(ui.parent.id);
        }
      }
      delete uis[id];
    }

    function call(event, id) {
      event.cancelBubble = true;
      if (event.button == 2) {
        return false; // don't trigger on right clicks
      }
      var ui = uis[id];
      if (ui) {
        if (ui.type == BUTTON) {
          if (ui.target) {
            ui.target[ui.tkey] = (ui.target[ui.tkey] + 1) % ui.textarray.length;
          }
          if (ui.command) {
            ClientCmd.exec(ui.command);
          }
          setChanged(id);
        } else if (ui.type == COLLECTION) {
          if (ui.command) {
            ClientCmd.exec(ui.command);
          }
        }
      }
      return false;
    }

    function setPropWithLast(ui, properties, prop) {
      if (properties[prop] !== undefined || last_settings[prop] !== undefined) {
        ui[prop] =
          properties[prop] !== undefined ?
          properties[prop] : last_settings[prop];
        last_settings[prop] = ui[prop];
      }
    }

    function getNextPosBelow(id, offset) {
      var ui = uis[id];
      if (ui)
        return [ui.pos[0], ui.pos[1] + ui.height + offset];
    }

    function getNextPosRight(id, offset) {
      var ui = uis[id];
      if (ui)
        return [ui.pos[0] + ui.width + offset, ui.pos[1]];
    }

    function standardProps(ui, props) {
      if (props.pos !== undefined)
        ui.pos = props.pos;

      if (props.command !== undefined)
        ui.command = props.command;

      if (props.uiclass !== undefined)
        ui.uiclass = props.uiclass;

      if (props.invisible !== undefined)
        ui.uiclass = props.invisible;

      if (props.resetlast === undefined) {
        setPropWithLast(ui, props, 'zindex');
        setPropWithLast(ui, props, 'fontsize');
        setPropWithLast(ui, props, 'width');
        setPropWithLast(ui, props, 'height');
      }
    }

    function addCollection(collectionid, id, properties) {
      if (!uis[id]) {
        uis[id] = {id: id,
                   type: COLLECTION,
                   children: {},
                   changed: true,
                   kidchanged: false,
                   parent: null};
      }
      last_settings = {};
      properties.fontsize = properties.fontsize || '120%';
      properties.zindex = properties.zindex !== undefined ?
        properties.zindex : 'auto';
      standardProps(uis[id], properties);
      setCollectionID(collectionid, id);
    }

    function addButton(collectionid, id, properties) {
      uis[id] = {id: id,
                 type: BUTTON,
                 changed: true,
                 parent: null};

      standardProps(uis[id], properties);
      var target = properties.target || UI.globals;
      var tkey = target ? properties.tkey || id : null;
      if (target && tkey) {
        if (target[tkey] === undefined) {
          target[tkey] = 0;
        }
        uis[id].target = target;
        uis[id].tkey = tkey;
      }
      for (var p in properties) {
        switch (p) {
          case 'text':
          case 'textarray':
          case 'color':
            uis[id][p] = properties[p];
          break;
        }
      }
      setPropWithLast(uis[id], properties, 'fontsize');
      setCollectionID(collectionid, id);
    }

    function addHTML(collectionid, id, properties) {
      uis[id] = {id: id,
                 type: HTML,
                 changed: true,
                 parent: null};

      standardProps(uis[id], properties);
      uis[id].markup = properties.markup;
      setCollectionID(collectionid, id);
    }

    function drawScroll(el, ui) {
      var width = ui.width;
      var height = ui.height;
      var str = "";
      var drow = false;
      if (ui.scrollpos < 0) {
        drow = true;
        while (ui.scrollpos < 0) {
          ui.scrollrow++;
          if (ui.scrollrow >= ui.sy)
            ui.scrollrow -= ui.sy;
          ui.scrollpos += ui.scroll[ui.scrollrow].height;
        }
      } else if (ui.scrollpos > ui.scroll[ui.scrollrow].height) {
        drow = true;
        while (ui.scrollpos > ui.scroll[ui.scrollrow].height) {
          ui.scrollpos -= ui.scroll[ui.scrollrow].height;
          ui.scrollrow--;
          if (ui.scrollrow < 0)
            ui.scrollrow += ui.sy;
        }
      }
      var y = ui.scrollpos - ui.scroll[ui.scrollrow].height;

      var j = ui.scrollrow;

      if (el) {
        ui.el = el;
      } else {
        el = ui.el;
      }

      if (el.childNodes[0] == null) {
        drow = true;
        var src = '<ul style="position:absolute;width:100%;height:100%;">';
        for (var i=0;i<20;i++) {
          src += '<li class="scroll" style="left:0px;top:0px;width:'+width+'px;height:1px;"><div class="title"></div><div class="text"></div></li>';
        }
        src += "</ul>";
        el.innerHTML = src;
      }

      el.childNodes[0].style.webkitTransform = "translate3d(0px, "+y+"px, 0px)";

      if (drow) {
        y = 0;
        var child = 0;
        while (y < ui.height + ui.scroll[j].height) {
          var cel = el.childNodes[0].childNodes[child++];
          cel.style.webkitTransform = "translate3d(0px, "+y+"px,0px)";
          cel.style.height = ui.scroll[j].height+"px";
          if (cel.style.backgroundImage != ui.scroll[j].img)
            cel.style.backgroundImage = "url("+ui.scroll[j].img+")";
          if (cel.childNodes[0].innerHTML != ui.scroll[j].title) {
            cel.childNodes[0].innerHTML = ui.scroll[j].title;
            cel.childNodes[1].innerHTML = ui.scroll[j].text;
          }
          y += ui.scroll[j].height;
          j = (++j % ui.sy);
        }
      }
    }

    function handleScroll(event, id) {
      var ui = uis[id];

      if (ui.dragging) {
        var pos = GameFrame.page2view([event.pageX, event.pageY]);
        var py = pos[1];

        if (event.touches && event.touches.length) {
          py = event.touches[0].pageY;
        }
        ui.vel = (py - ui.oldy);
        ui.scrollpos += (py - ui.oldy);

        ui.oldy = py;
        drawScroll(null, ui);
      } else if (Math.abs(ui.vel) > 1.1) {
        ui.scrollpos += (ui.vel*5);
        drawScroll(null, ui);
        ui.vel *= 0.92;
      } else {
        ui.vel = 0;
        ui.velc = 0;
        clearInterval(ui.tid);
        ui.tid = 0;
      }
      return false;
    }

    function scrollStart(event, id) {
      var ui = uis[id];
      ui.el.childNodes[0].style.webkitTransition = "";
      var pos = GameFrame.page2view([event.pageX, event.pageY]);
      ui.oldy = pos[1];

      if (event.touches && event.touches.length) {
        ui.oldy = event.touches[0].pageY;
      }

      ui.vel = 0;
      ui.velc = 0;
      ui.scrollstart = JSGlobal.mouse.y;
      if (ui.tid) {
        clearInterval(ui.tid);
      }
      ui.dragging = true;
      return false;
    }

    function scrollStop(event, id) {
      var ui = uis[id];
      ui.dragging = false;
      ui.tid = setInterval('UI.handleScroll(null, \''+id+'\');', 1);
      return false;
    }

    function addScroll(collectionid, id, properties) {
      uis[id] = {id: id,
                 type: SCROLL,
                 changed: true,
                 parent: null};

      standardProps(uis[id], properties);
      uis[id].scroll = [];
      for (var j=0;j<properties.y;j++) {
        var frame = j %60;
          var img = '/images/asteroid/Test_Asteroid_128_000'+(frame<10?'0'+frame:frame)+'.png';
        switch(parseInt(Math.random()*3)) {
          case 0:
            uis[id].scroll[j] = {height:140, img:img,title:'Rock Frame '+frame,text:'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut tempor volutpat imperdiet. Aenean vel nisl non nisi venenatis convallis. Nulla facilisis pulvinar bibendum. Vivamus tristique orci id metus pellentesque imperdiet.'};
            break;
          case 1:
            uis[id].scroll[j] = {height:175, img:img,title:'Rock Frame '+frame,text:'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut tempor volutpat imperdiet. Aenean vel nisl non nisi venenatis convallis. Nulla facilisis pulvinar bibendum. Vivamus tristique orci id metus pellentesque imperdiet. Maecenas massa massa, ultricies ac malesuada ut, dictum quis dolor.'};
            break;
          case 2:
            uis[id].scroll[j] = {height:200, img:img,title:'Rock Frame '+frame,text:'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut tempor volutpat imperdiet. Aenean vel nisl non nisi venenatis convallis. Nulla facilisis pulvinar bibendum. Vivamus tristique orci id metus pellentesque imperdiet. Maecenas massa massa, ultricies ac malesuada ut, dictum quis dolor. Aenean sapien nulla, euismod eu malesuada non, pellentesque ac augue. Morbi nunc felis, scelerisque id consequat vitae, volutpat sed nunc. Vivamus at magna vel velit venenatis ornare et malesuada erat.'};
            break;
        }
      }
      uis[id].sy = properties.y;
      uis[id].zoom = 1;
      uis[id].cx = 0;
      uis[id].cy = 0;
      uis[id].scrollpos = 0;
      uis[id].scrollrow = 0;
      uis[id].inner = properties.inner;
      setCollectionID(collectionid, id);
    }

    var alpha = 0, beta = 0, gamma = 0;
    var lalpha = 0, lbeta = 0, lgamma = 0;

    function getGyro() {
      return [alpha - lalpha, beta - lbeta, gamma - lgamma];
      lalpha = alpha;
      lbeta = beta;
      lgamma = gamma;
    }

    var ax, ay, az;

    function getAccel() {
      return [ax, ay, az];
    }

    function hookUIEvents(eid) {
      touch = ('ontouchstart' in window);
      var el = document.getElementById(eid);
      if (el) {
        el[touch ? 'ontouchstart' : 'onmousedown'] = function(event) {
          return Input.getMouseXY(event, 1);
        };
        el[touch ? 'ontouchmove' : 'onmousemove'] = function(event) {
          return Input.getMouseXY(event, 0);
        };
        el[touch ? 'ontouchend' : 'onmouseup'] = function(event) {
          return Input.getMouseXY(event, -1);
        };

        if (touch) {
          el['ongesturestart'] = Input.gestureStart;
          el['ongesturechange'] = Input.gestureChange;
          el['ongestureend'] = Input.gestureEnd;

          window.ondeviceorientation = function(event) {
            alpha = event.alpha;
            beta = event.beta;
            gamma = event.gamma;
          };
          window.ondevicemotion = function(event) {
            ax = event.accelerationIncludingGravity.x;
            ay = event.accelerationIncludingGravity.y;
            az = event.accelerationIncludingGravity.z;
          };
        }
        el['onmousewheel'] = function(event) {
          Input.getMouseWheel(event, event.wheelDelta / 120);
        };
        if (JSGlobal.BROWSER != JSGlobal.IE &&
            JSGlobal.BROWSER != JSGlobal.IE9) {
          el['DOMMouseScroll'] = function(event) {
            Input.getMouseWheel(event, event.detail / -3);
          }
        }

        el['onkeypress'] = function(event) {return Input.handleTyping(event)};
        el['onkeyup'] = function(event) {return Input.keyPress(event, 0)};
        el['onkeydown'] = function(event) {return Input.keyPress(event, 1)};
        if (JSGlobal.FIREFOX) {
          document.onkeyup = function(event) {return Input.keyPress(event, 0)};
          document.onkeydown = function(event) {return Input.keyPress(event, 1)};
        }
      }
    }

    function drawElement(parent, ui) {
      var click = touch ? 'ontouchstart' : 'onmousedown';
      var move = touch ? 'ontouchmove' : 'onmousemove';
      var unclick = touch ? 'ontouchend' : 'onmouseup';
      var hover = touch ? 'ontouchstart' : 'onmousedown';
      var str = '';
      var text, uiclass, posstring, mouseinstr,
        mouseoutstr, i, len, size, zindex, zindexpopout, kid;

      if (ui.changed || ui.kidchanged || all_dirty) {
        var upel = document.getElementById('parent' + ui.id);
        ui.changed = false;
        if (!upel) {
          upel = document.createElement('div');
          upel.id = 'parent' + ui.id;
          parent.appendChild(upel);
          setChildrenChanged(ui.id);
          ui.changed = true;
        }
        posstring = ui.pos ? 'position:absolute; left:' + ui.pos[0] + 'px;top:' + ui.pos[1] + 'px;' : 'position:relative;';
        posstring += (ui.width !== undefined ? 'width:' + ui.width + 'px;' : '') + (ui.height !== undefined ? 'height:' + ui.height + 'px;' : '');
        uiclass = ui.uiclass || default_css[ui.type];
        zindex = ui.zindex !== undefined ? 'z-index:' + ui.zindex + ';' : '';
        zindexpopout = ui.zindex ? 'z-index:1000;' : '';
        if (!ui.invisible && !ui.uiclass)
          uiclass += ' ux_base';

        if (ui.type == COLLECTION) {
            if (ui.changed || all_dirty) {
              str = '<div  class="' + uiclass + '" id="' + ui.id + '" style="' + posstring + zindex + '" '+ click + '="event.cancelBubble=true;event.stopPropagation();return false;" ' + unclick + '="return UI.call(event,\'' + ui.id + '\',true);" >';
              str += '</div>';
              upel.innerHTML = str;
            }
            for (kid in ui.children) {
              drawElement(upel.childNodes[0], uis[kid]);
            }
        } else if (ui.type == BUTTON) {
          text = ui.textarray ? ui.textarray[ui.target[ui.tkey]] : ui.text;
          size = ui.fontsize ? 'font-size:' + ui.fontsize + ';' : '';
          var color = ui.color ? 'background:' + ui.color + ';' : '';
          str = '<button id="' + ui.id + '" class="' + uiclass + '" style="cursor:hand;' + posstring + size + color + zindex + '" ' + unclick + '="event.cancelBubble=true;return false;" ' + click + '="return UI.call(event,\'' + ui.id + '\');"' + '><div>' + text + '</div></button>';
          upel.innerHTML = str;
        } else if (ui.type == HTML) {
          str = '<div class="' + uiclass + '" id="' + ui.id + '" style="' + posstring + '">';
          str += ui.markup;
          str += '</div>';
          upel.innerHTML = str;
        } else if (ui.type == SCROLL) {
          str = '<div class="" id="' + ui.id + '" style="z-index:1000;' + posstring + '"'+ click + '="return UI.scrollStart(event,\'' + ui.id + '\');" ' + move + '="return UI.handleScroll(event,\'' + ui.id + '\');" ' + unclick + '="return UI.scrollStop(event,\'' + ui.id + '\');"  >';
          str += '</div>';
          str += '<div class="' + uiclass + '" id="' + ui.id + '" style="z-index:0;' + posstring + '" >';
          str += '</div>';
          upel.innerHTML = str;
          drawScroll(upel.childNodes[1], ui);
        }
      }
    }

    function init(pid) {
      var parel = document.getElementById(pid);
      parel.innerHTML += '<div id="gameui" style="position:absolute;z-index:10000;"></div>';
    }

    function tick() {
      var el = document.getElementById('gameui');
      var ui;
      if (el) {
        for (var i in uis) {
          ui = uis[i];
          if (!ui.parent) {
            drawElement(el, ui, false);
          }
        }
      }
      all_dirty = false;
    }

    function setAllDirty() {
      all_dirty = true;
    }

    var UI = {};
    UI.del = del;
    UI.init = init;
    UI.tick = tick;
    UI.call = call;
    UI.scrollStart = scrollStart;
    UI.scrollStop = scrollStop;
    UI.handleScroll = handleScroll;
    UI.addCollection = addCollection;
    UI.addHTML = addHTML;
    UI.addButton = addButton;
    UI.addScroll = addScroll;
    UI.setAllDirty = setAllDirty;
    UI.hookUIEvents = hookUIEvents;
    UI.getGyro = getGyro;
    UI.getAccel = getAccel;
    return UI;
  })();

function ignoreInput(ev) {
  console.log('ignore');
  return false;
}
