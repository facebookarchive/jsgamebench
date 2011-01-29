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

var Render = (function() {
    var all_dirty = true;
    var version;

    function setupBrowserSpecific() {
      var user_agent = navigator.userAgent.toLowerCase();

      if (/chrome/.test(user_agent)) {
        JSGlobal.browser = JSGlobal.CHROME;
      }
      else if (/webkit/.test(user_agent)) {
        JSGlobal.browser = JSGlobal.WEBKIT;
      }
      else if (/gecko/.test(user_agent)) {
        JSGlobal.browser = JSGlobal.FIREFOX;
      }
      else if (/msie 9/.test(user_agent)) {
        JSGlobal.browser = JSGlobal.IE9;
      }
      else if (/msie/.test(user_agent)) {
        JSGlobal.browser = JSGlobal.IE;
      }
      else if (/opera/.test(user_agent)) {
        JSGlobal.browser = JSGlobal.OPERA;
      }
      else {
        JSGlobal.browser = JSGlobal.OTHER;
      }

      if (/iphone/.test(user_agent)) {
        JSGlobal.os = 'iPhone';
      }
      else if (/ipod/.test(user_agent)) {
        JSGlobal.os = 'iPod';
      }
      else if (/ipad/.test(user_agent)) {
        JSGlobal.os = 'iPad';
      }
      else if (/os x/.test(user_agent)) {
        JSGlobal.os = 'OS X';
      }
      else if (/linux/.test(user_agent)) {
        JSGlobal.os = 'Linux';
      }
      else if (/android/.test(user_agent)) {
        JSGlobal.os = 'Android';
      }
      else if (/windows phone/.test(user_agent)) {
        JSGlobal.os = 'Win Mobile';
      }
      else if (/windows/.test(user_agent)) {
        JSGlobal.os = 'Windows';
      }
      else {
        JSGlobal.os = '?';
      }

      switch (JSGlobal.browser) {
        case JSGlobal.CHROME:
          version = user_agent.toLowerCase().match(/chrome\/([\d\w\.]+)\s/);
          if (version) {
            JSGlobal.browser_version = 'Chrome ' + version[1].match(/(\d+)\..*/)[1];
          } else {
            JSGlobal.browser_version = 'Chrome';
          }
          break;
        case JSGlobal.FIREFOX:
          version = user_agent.toLowerCase().match(/firefox\/([\d\w\.]+)/);
          if (version) {
            JSGlobal.browser_version = 'Firefox ' + version[1].match(/(\d+)\..*/)[1];
          } else {
            JSGlobal.browser_version = 'Firefox';
          }
          break;
        case JSGlobal.WEBKIT:
          version = user_agent.toLowerCase().match(/safari\/([\d\w\.]+)/);
          if (version) {
            JSGlobal.browser_version = 'Safari ' + version[1].match(/(\d+)\..*/)[1];
          } else {
            JSGlobal.browser_version = 'Safari';
          }
          break;
        case JSGlobal.IE:
        case JSGlobal.IE9:
          version = user_agent.toLowerCase().match(/msie ([\d\w\.]+);/);
          if (version) {
            JSGlobal.browser_version = 'IE ' + version[1].match(/(\d+)\..*/)[1];
          } else {
            JSGlobal.browser_version = 'IE';
          }
        break;
        case JSGlobal.OPERA:
          version = user_agent.toLowerCase().match(/version\/([\d\w\.]+)/);
          if (version) {
            JSGlobal.browser_version = 'Opera ' + version[1].match(/(\d+)\..*/)[1];
          } else {
            JSGlobal.browser_version = 'Opera';
          }
          break;
      }

      JSGlobal.browser_version = JSGlobal.os + ' ' + JSGlobal.browser_version;

      DomRender.setupBrowserSpecific();
    }

    function tick() {
      var drawar = [];
      var framedata = {};
      var id, gobel, backgroundel;

      if (World.getScrolling()) {
        World.scroll();
      }

      switch (GameFrame.settings.render_mode) {
        case GameFrame.WEBGL:
          break;
        case GameFrame.CANVAS_ONLY:
          CanvasRender.clear();
          if (GameFrame.settings.canvas_background) {
            if (all_dirty || World.dirty) {
              for (var id in World.elements) {
                framedata = World.framedata(id);
                CanvasRender.bgdraw(framedata);
              }
            }
          } else if (GameFrame.settings.canvas_bake_background) {
            if (all_dirty || World.dirty) {
              for (var id in World.elements) {
                framedata = World.framedata(id);
                CanvasRender.draw(framedata);
              }
              backgroundel = document.getElementById('gamebackground');
              var gobel = document.getElementById('cbgcomp');
              if (!gobel) {
                gobel = document.createElement('img');
                gobel.id = 'cbgcomp';
                gobel.style.cssText =
                  'position:absolute;';
              }
              var gamecan = document.getElementById('gamecanvas');
              if (gamecan) {
                gobel.src = gamecan.toDataURL('image/jpeg');
                backgroundel.appendChild(gobel);
              }
            }
          } else {
            if (all_dirty || World.dirty) {
              backgroundel = document.getElementById('gamebackground');
              for (var id in World.elements) {
                framedata = World.framedata(id);
                if (all_dirty || framedata.dirty) {
                  var gobel = document.getElementById(id);
                  if (!gobel) {
                    gobel = document.createElement('img');
                    gobel.id = id;
                    gobel.style.cssText =
                      'position:absolute;z-index:' + framedata.zindex;
                    gobel.src = framedata.url;
                    backgroundel.appendChild(gobel);
                  } else {
                    gobel.src = framedata.url;
                  }
                  DomRender.transformedProp(gobel,
                                            framedata.pos,
                                            framedata.size,
                                            [0, 0], 0);
                }
              }
            }
          }
          World.dirty = false;
          for (var id in Gob.gobs) {
            framedata = Gob.framedata(id);
            CanvasRender.draw(framedata);
          }
          break;
        case GameFrame.CANVAS_HTML_HYBRID:
          break;
        case GameFrame.HTML_ONLY:
          var domel = document.getElementById(GameFrame.getViewport().id);
          if (all_dirty || World.dirty) {
            backgroundel = document.getElementById('gamebackground');
            for (var id in World.elements) {
              framedata = World.framedata(id);
              if (all_dirty || framedata.dirty) {
                var gobel = document.getElementById(id);
                if (!gobel) {
                  gobel = document.createElement('img');
                  gobel.id = id;
                  gobel.style.cssText =
                    'position:absolute;z-index:' + framedata.zindex;
                  backgroundel.appendChild(gobel);
                }
                gobel.src = framedata.url;
                if (GameFrame.settings.transform3d) {
                  DomRender.transformedProp(gobel,
                                          framedata.pos,
                                          [0, 0]);
                } else {
                  DomRender.transformedProp3d(gobel,
                                              framedata.pos,
                                              [0, 0]);
                }
              }
            }
          }

          World.dirty = false;

          for (var id in Gob.gobs) {
            framedata = Gob.framedata(id);
            if (framedata.dirty || framedata.animating || all_dirty) {
              if (GameFrame.settings.update_existing) {
                gobel = document.getElementById(id);
                if (!gobel) {
                  if (framedata.animating) {
                    gobel = document.createElement('div');
                    gobel.id = id;
                    gobel.style.cssText = 'position:absolute;overflow:hidden;left:0px;top:0px;width:'+framedata.size[0]*framedata.scale+'px;height:'+framedata.size[1]*framedata.scale+'px;';

                    if (GameFrame.settings.use_div_background) {
                      gobel.style.backgroundImage = 'url(' + framedata.url + ')';
                      gobel.style.backgroundPosition = '-' + framedata.x +
                        'px -' + framedata.y + 'px';
                    } else {
                      gobel.innerHTML = '<img class="sprite" src="' + framedata.url +'"></img>';
                        '" style="left:-' + framedata.x +
                        'px;top:-' + framedata.y + 'px;"></img>';
                    }
                  } else {
                    gobel = document.createElement('img');
                    gobel.id = id;
                    gobel.style.cssText = 'position:absolute;overflow:hidden;left:0px;top:0px;';
                    gobel.src = framedata.url;
                  }
                  domel.appendChild(gobel);
                }
                if (framedata.dirty) {
                  if (GameFrame.settings.transform3d) {
                    DomRender.transformedProp(gobel,
                                              [framedata.pos[0]|0,framedata.pos[1]|0],
                                              framedata.vel, framedata.discon);
                  } else {
                    DomRender.transformedProp3d(gobel,
                                              [framedata.pos[0]|0,framedata.pos[1]|0],
                                              framedata.vel, framedata.discon);
                  }
                }
                if (framedata.animating) {
                  if (GameFrame.settings.use_div_background) {
                    gobel.style.backgroundImage = 'url(' + framedata.url + ')';
                    gobel.style.backgroundPosition = '-' + framedata.x +
                      'px -' + framedata.y + 'px';
                  } else {
                    gobel.childNodes[0].style.cssText = 'left:-' + framedata.x +
                      'px;top:-' + framedata.y + 'px;';
                  }
                } else {

                }
              } else {
                if (GameFrame.settings.use_div_background) {
                  if (GameFrame.settings.transform3d) {
                    drawar.push('<div id="' + id + '" class="spriteholder" ' +
                                'style="position:absolute;overflow:hidden;' +
                                DomRender.transformed3d(framedata.pos,
                                                      [framedata.size[0]*framedata.scale,framedata.size[1]*framedata.scale],
                                                      framedata.vel) +
                                'background:url(\'' + framedata.url +
                                '\');background-position: -' + framedata.x +
                                'px -' + framedata.y + 'px;"></div>');
                  } else {
                    drawar.push('<div id="' + id + '" class="spriteholder" ' +
                                'style="position:absolute;overflow:hidden;' +
                                DomRender.transformed(framedata.pos,
                                                      [framedata.size[0]*framedata.scale,framedata.size[1]*framedata.scale],
                                                      framedata.vel) +
                                'background:url(\'' + framedata.url +
                                '\');background-position: -' + framedata.x +
                                'px -' + framedata.y + 'px;"></div>');
                  }
                } else {
                  if (GameFrame.settings.transform3d) {
                    drawar.push('<div id="' + id + '" class="spriteholder" ' +
                                'style="position:absolute;overflow:hidden;' +
                                DomRender.transformed3d(framedata.pos,
                                                      [framedata.size[0]*framedata.scale,framedata.size[1]*framedata.scale],
                                                      framedata.vel) +
                                '"><img class="sprite" src="' + framedata.url +
                                '" style="left:-' + framedata.x +
                                'px;top:-' + framedata.y + 'px;"></img></div>');
                  } else {
                    drawar.push('<div id="' + id + '" class="spriteholder" ' +
                                'style="position:absolute;overflow:hidden;' +
                                DomRender.transformed(framedata.pos,
                                                      [framedata.size[0]*framedata.scale,framedata.size[1]*framedata.scale],
                                                      framedata.vel) +
                                '"><img class="sprite" src="' + framedata.url +
                                '" style="left:-' + framedata.x +
                                'px;top:-' + framedata.y + 'px;"></img></div>');
                  }
                }
              }
            }
          }
          if (!GameFrame.settings.update_existing) {
            domel.innerHTML = drawar.join('');
          }
          break;
      }
      all_dirty = false;
    }

    function setAllDirty() {
      all_dirty = true;
    }

    var Render = {};
    Render.setAllDirty = setAllDirty;
    Render.setupBrowserSpecific = setupBrowserSpecific;
    Render.tick = tick;
    return Render;
  })();
