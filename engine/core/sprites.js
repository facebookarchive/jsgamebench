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

var Sprites = (function() {
    var spritedictionary = {};
    var spriteid = 1;
    var loading_hash = {};
    var spriteel = null;

    function loaded(event, id) {
      if (loading_hash[id] && loading_hash[id].height && loading_hash[id].width) {
        spriteel.appendChild(spritedictionary[id].imageel);
        if (!spritedictionary[id].width)
          spritedictionary[id].width = spritedictionary[id].imageel.width;
        if (!spritedictionary[id].height)
          spritedictionary[id].height = spritedictionary[id].imageel.height;
        loading_hash[id] = null;
        delete loading_hash[id];
      }
    }

    function add(id, data) {
      if (!spriteel)
        spriteel = document.getElementById('spritecache');

      if (data.half_res) {
        data.halfres = 0;
        var idx = data.url.lastIndexOf('.');
        var base = data.url.substr(0,idx);
        var ext = data.url.substr(idx);
        data.url = base+'_half'+ext;
        data.width /= 2;
        data.height /= 2;
      }
      if (spritedictionary[id] === undefined) {
        if (data.left === undefined) {
          data.left = 0;
        }
        if (data.top === undefined) {
          data.top = 0;
        }
        spritedictionary[id] = data;
        spritedictionary[id].id = spriteid++;
        spritedictionary[id].no_anim = data.no_anim;
        spritedictionary[id].imageel = new Image();
        spritedictionary[id].imageel.id = id;
        spritedictionary[id].imageel.onload = function(event) {
          Sprites.loaded(event, id);
        };
        spritedictionary[id].imageel.onabort = function(event) {
          console.log('abort');
          spritedictionary[id] = undefined;
          Sprites.add(id, data);
        };
        spritedictionary[id].imageel.onerror = function(event) {
          console.log('error');
          spritedictionary[id] = undefined;
          Sprites.add(id, data);
        };
        spritedictionary[id].imageel.src = spritedictionary[id].url;
        loading_hash[id] = spritedictionary[id].imageel;
      }
    }

    function del(id) {
      delete spritedictionary[id];
      var spriteel = document.getElementById(id);
      if (spriteel) {
        spriteel.parentNode.removeChild(id);
      }
    }

    function fullyLoaded() {
      for (var id in loading_hash) {
        return false;
      }
      return true;
    }

    function forEach(callback_func) {
      for (var id in spritedictionary) {
        callback_func(spritedictionary[id]);
      }
    }

    function deleteAll() {
      spritedictionary = {};
      spriteid = 1;
      loading_hash = {};
      spriteel = null;
      Sprites.spritedictionary = spritedictionary;
    }

    var Sprites = {};
    Sprites.add = add;
    Sprites.del = del;
    Sprites.loaded = loaded;
    Sprites.fullyLoaded = fullyLoaded;
    Sprites.forEach = forEach;
    Sprites.spritedictionary = spritedictionary;
    Sprites.deleteAll = deleteAll;
    return Sprites;
  })();
