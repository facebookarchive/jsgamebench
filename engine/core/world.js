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

var World = (function() {
    var elements = {};

    function add(id, spriteid, pos, zindex) {
      if (GameFrame.settings.disable_world_elements) {
        return;
      }
      if (!elements[id] || elements[id].pos[0] != pos[0] || elements[id].pos[1] != pos[1] || elements[id].spriteid != spriteid) {
        World.dirty = true;
        elements[id] = {id: id, spriteid: spriteid, pos: pos,
                        zindex: (zindex ? zindex : 0), dirty: true, discon: true};
      }
    }

    function del(id) {
      if (elements[id]) {
        var el = document.getElementById(id);
        if (el)
          el.parentNode.removeChild(el);
        delete elements[id];
      }
    }
    function delAll() {
      for (var id in elements)
        del(id);

      elements = {};
      World.elements = elements;
    }

    var scrolling = false;
    var lastx = 0;
    var sdata = null;
    var z = 0;
    var scroll_pos = 0;

    var World = {};
    World.dirty = true;

    function reset() {
      scrolling = false;
      scroll_pos = 0;
      lastx = 0;
      elements = {};
      World.elements = elements;
    }

    function initScrollable(data) {
      scrolling = data.scrollx;
      var eachx = data.eachx - 2;
      var eachy = data.eachy - 2;

      var startx = 0;
      var edgex = parseInt(GameFrame.getViewport().dstyle.width / eachx)+2;
      var edgey = parseInt(GameFrame.getViewport().dstyle.height / eachy)+2;

      var tilelist = data.tilelist;
      var len = tilelist.length;

      for (var i = 0; i < edgex; i++) {
        for (var j = 0; j < edgey; j++) {
          add((j + 1) * 1000000 + i, tilelist[parseInt(Math.random() * len)],
              [(i+0.5) * eachx, j * eachy], z++);
        }
      }
      sdata = data;
    }

    function scroll() {
      if (!scrolling)
        return;
      World.dirty = true;
      var offsetx = 0;
      var offsety = 0;

      var eachx = sdata.eachx - 2;
      var eachy = sdata.eachy - 2;

      var startx = parseInt(scroll_pos / eachx);

      var edgex = parseInt(GameFrame.getViewport().dstyle.width / eachx) + startx + 2;
      var edgey = parseInt(GameFrame.getViewport().dstyle.height / eachy) + 2;

      if (startx != lastx) {
        for (var i = lastx; i < startx; i++) {
          for (var j = 0; j < edgey; j++) {
            del((j + 1) * 1000000 + i);
          }
        }
        lastx = startx;
        var tilelist = sdata.tilelist;
        var len = tilelist.length;
        for (var j = 0; j < edgey; j++) {
          add((edgex - 1) + (j + 1) * 1000000, tilelist[parseInt(Math.random() * len)],
              [(edgex - startx - 0.5) * eachx, j * eachy], z++);
        }
      }
      for (var i = startx; i < edgex; i++) {
        for (var j = 0; j < edgey; j++) {
          elements[(j + 1) * 1000000 + i].pos[0] += scrolling;
          elements[(j + 1) * 1000000 + i].dirty = true;
        }
      }
      scroll_pos -= scrolling;
    }

    function randomTile(data) {
      reset();
      var offsetx = 0;
      var offsety = 0;

      var eachx = data.eachx - 2;
      var eachy = data.eachy - 2;

      var tilelist = data.tilelist;
      var len = tilelist.length;

      var edgex = GameFrame.getViewport().dstyle.width;
      var edgey = GameFrame.getViewport().dstyle.height;
      var id;

      var z = 0;

      while (offsety - 0.5 * eachy < edgey) {
        offsetx = 0;
        while (offsetx - 0.5 * eachx < edgex) {
          id = Utils.uuidv4();
          add(id, tilelist[parseInt(Math.random() * len)],
              [offsetx, offsety], z++);
          offsetx += eachx;
        }
        offsety += eachy;
      }
    }

    function framedata(id) {
      var element = elements[id];
      var sprite = Sprites.spritedictionary[element.spriteid];
      var pos = [element.pos[0] - sprite.width * 0.5, element.pos[1] - sprite.height * 0.5];
      if (GameFrame.settings.int_snap) {
        pos = [pos[0]|0,pos[1]|0];
      }

      var retval = {dirty: element.dirty,
                    pos: pos,
                    size: [sprite.width, sprite.height],
                    theta: 0, scale: GameFrame.settings.sprite_scale,
                    x: 0,
                    y: 0,
                    zindex: sprite.zindex,
                    url: sprite.url,
                    image: sprite.imageel,
                    sprite: sprite};
      element.dirty = false;
      return retval;
    }

    function getScrolling() {
      return scrolling;
    }

    World.elements = elements;
    World.add = add;
    World.del = del;
    World.framedata = framedata;
    World.reset = reset;
    World.delAll = delAll;
    World.randomTile = randomTile;
    World.initScrollable = initScrollable;
    World.scroll = scroll;
    World.getScrolling = getScrolling;
    return World;
  })();
