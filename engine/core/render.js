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

      JSGlobal.mobile = false;
      JSGlobal.ios = false;

      if (/chrome/.test(user_agent)) {
        JSGlobal.browser = JSGlobal.CHROME;
        JSGlobal.threeD = true;
      }
      else if (/webkit/.test(user_agent)) {
        JSGlobal.browser = JSGlobal.WEBKIT;
        JSGlobal.threeD = true;
      }
      else if (/gecko/.test(user_agent)) {
        JSGlobal.browser = JSGlobal.FIREFOX;
        JSGlobal.threeD = false;
      }
      else if (/msie 9/.test(user_agent)) {
        JSGlobal.browser = JSGlobal.IE9;
        JSGlobal.threeD = false;
      }
      else if (/msie/.test(user_agent)) {
        JSGlobal.browser = JSGlobal.IE;
        JSGlobal.threeD = false;
      }
      else if (/opera/.test(user_agent)) {
        JSGlobal.browser = JSGlobal.OPERA;
        JSGlobal.threeD = false;
      }
      else {
        JSGlobal.browser = JSGlobal.OTHER;
        JSGlobal.threeD = false;
      }

      if (/iphone/.test(user_agent)) {
        JSGlobal.threeD = true;
        JSGlobal.mobile = true;
        JSGlobal.ios = true;
        JSGlobal.os = 'iPhone';
      }
      else if (/ipod/.test(user_agent)) {
        JSGlobal.threeD = true;
        JSGlobal.mobile = true;
        JSGlobal.os = 'iPod';
      }
      else if (/ipad/.test(user_agent)) {
        JSGlobal.threeD = true;
        JSGlobal.mobile = true;
        JSGlobal.ios = true;
        JSGlobal.os = 'iPad';
      }
      else if (/os x/.test(user_agent)) {
        JSGlobal.os = 'OS X';
      }
      else if (/android/.test(user_agent)) {
        JSGlobal.mobile = true;
        JSGlobal.threeD = false;
        JSGlobal.os = 'Android';
      }
      else if (/linux/.test(user_agent)) {
        JSGlobal.os = 'Linux';
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
          WebGLRender.begin();
          for (var id in World.elements) {
            WebGLRender.drawSprite(World.framedata(id));
          }
          for (var id in Gob.gobs) {
            framedata = Gob.framedata(id);
            WebGLRender.drawSprite(framedata);
          }
          WebGLRender.end();
          break;
        case GameFrame.WEBGL3D:
          WebGLRender.begin();
          // TODO draw models
          //WebGLRender.drawModel(framedata);
          WebGLRender.end();
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
                                            0, framedata.scale);
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
                  DomRender.transformedProp3d(gobel,
                                          framedata.pos,
                                              0, framedata.scale);
                } else {
                  DomRender.transformedProp(gobel,
                                              framedata.pos,
                                            0, framedata.scale);
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
                    gobel.style.cssText = 'position:absolute;overflow:hidden;left:0px;top:0px;width:'+framedata.size[0]+'px;height:'+framedata.size[1]+'px;';

                    if (GameFrame.settings.use_div_background) {
                      if (GameFrame.settings.css_keyframe) {
                        switch(framedata.spriteid) {
                          case 'ship':
                            gobel.className = "ship_animating";
                            break;
                          case 'rock':
                            gobel.className = "rock_animating";
                            break;
                          case 'boom':
                            gobel.className = "boom_animating";
                            break;
                          case 'powerup':
                            gobel.className = "powerup_animating";
                            break;
                        }
                      } else {
                        gobel.style.backgroundPosition = '-' + framedata.x +
                          'px -' + framedata.y + 'px';
                      }
                      gobel.style.backgroundImage = 'url(' + framedata.url + ')';
                    } else {
                      if (GameFrame.settings.css_keyframe) {
                        switch(framedata.spriteid) {
                          case 'ship':
                            gobel.innerHTML = '<img class="sprite ship_animating" src="' + framedata.url +'"></img>';
                            break;
                          case 'rock':
                            gobel.innerHTML = '<img class="sprite rock_animating" src="' + framedata.url +'"></img>';
                            break;
                          case 'boom':
                            gobel.innerHTML = '<img class="sprite boom_animating" src="' + framedata.url +'"></img>';
                            break;
                          case 'powerup':
                            gobel.innerHTML = '<img class="sprite powerup_animating" src="' + framedata.url +'"></img>';
                            break;
                        }
                      } else {
                        if (GameFrame.settings.multi_img) {
                          for (var i=0,len=framedata.sprite.frames;i<len;i++) {
//                            gobel.innerHTML += '<img style="position:absolute;visibility:hidden;" class="sprite" src="' + Sprites.spritedictionary[framedata.spriteid+i].url +'"></img>';
                            gobel.innerHTML += '<div style="position:absolute;height:100%;width:100%;visibility:hidden;background-image:url(' + Sprites.spritedictionary[framedata.spriteid+i].url +');"></div>';
                          }
                        } else {
                          gobel.innerHTML = '<img class="sprite" src="' + framedata.url +'"></img>';
                        }
                      }
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
                    DomRender.transformedProp3d(gobel,
                                              [framedata.pos[0]|0,framedata.pos[1]|0],
                                                framedata.theta, framedata.scale, framedata.discon);
                  } else {
                    DomRender.transformedProp(gobel,
                                              [framedata.pos[0]|0,framedata.pos[1]|0],
                                              framedata.theta, framedata.scale, framedata.discon);
                  }
                }
                if (GameFrame.settings.use_div_background) {
                  if (!GameFrame.settings.sprite_sheets) {
                    gobel.style.backgroundImage = 'url(' + framedata.url + ')';
                  } else if (!GameFrame.settings.css_keyframes) {
                    gobel.style.backgroundPosition = '-' + framedata.x +
                      'px -' + framedata.y + 'px';
                  }
                } else {
                  if (!GameFrame.settings.sprite_sheets) {
                    gobel.childNodes[framedata.oframe].style.visibility = 'hidden';
                    gobel.childNodes[framedata.frame].style.visibility = 'visible';
                  } else if (!GameFrame.settings.css_keyframes) {
                    if (GameFrame.settings.transform3d) {
                      gobel.childNodes[0].style.cssText = DomRender.axisAlignedTranslate3dFull([-framedata.x, -framedata.y]);
                    } else {
                      gobel.childNodes[0].style.cssText = DomRender.axisAlignedTranslateFull([-framedata.x, -framedata.y]);
                    }
                  }
                }
              } else {
                if (GameFrame.settings.use_div_background) {
                  if (GameFrame.settings.transform3d) {
                    drawar.push('<div id="' + id + '" class="spriteholder" ' +
                                'style="position:absolute;overflow:hidden;' +
                                DomRender.transformed3d(framedata.pos,
                                                        [framedata.size[0],framedata.size[1]],
                                                        framedata.theta, framedata.scale) +
                                'background:url(\'' + framedata.url +
                                '\');background-position: -' + framedata.x +
                                'px -' + framedata.y + 'px;"></div>');
                  } else {
                    drawar.push('<div id="' + id + '" class="spriteholder" ' +
                                'style="position:absolute;overflow:hidden;' +
                                DomRender.transformed(framedata.pos,
                                                      [framedata.size[0],framedata.size[1]],
                                                      framedata.theta,framedata.scale) +
                                'background:url(\'' + framedata.url +
                                '\');background-position: -' + framedata.x +
                                'px -' + framedata.y + 'px;"></div>');
                  }
                } else {
                  if (GameFrame.settings.transform3d) {
                    drawar.push('<div id="' + id + '" class="spriteholder" ' +
                                'style="position:absolute;overflow:hidden;' +
                                DomRender.transformed3d(framedata.pos,
                                                      [framedata.size[0],framedata.size[1]],
                                                        framedata.theta, framedata.scale) +
                                '"><img class="sprite" src="' + framedata.url +
                                '" style="left:-' + framedata.x +
                                'px;top:-' + framedata.y + 'px;"></img></div>');
                  } else {
                    drawar.push('<div id="' + id + '" class="spriteholder" ' +
                                'style="position:absolute;overflow:hidden;' +
                                DomRender.transformed(framedata.pos,
                                                      [framedata.size[0],framedata.size[1]],
                                                      framedata.theta, framedata.scale) +
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
