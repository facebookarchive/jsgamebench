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

var DomRender = (function() {
    var transform, transformprop, transformoriginstring, transformorigin, transition = null;

    function setupBrowserSpecific() {
      touch = ('createTouch' in document);

      transition = null;

      switch (JSGlobal.browser) {
        case JSGlobal.CHROME:
          transform = '-webkit-transform';
          transformprop = 'webkitTransform';
          transformoriginstring = '-webkit-transform-origin';
          transformorigin = 'webkitTransformOrigin';
          transition = 'webkitTransition';
          break;
        case JSGlobal.FIREFOX:
          transform = '-moz-transform';
          transformprop = 'MozTransform';
          transformoriginstring = '-moz-transform-origin';
          transformorigin = 'MozTransformOrigin';
          break;
        case JSGlobal.WEBKIT:
          transform = '-webkit-transform';
          transformprop = 'webkitTransform';
          transformoriginstring = '-webkit-transform-origin';
          transformorigin = 'webkitTransformOrigin';
          transition = 'webkitTransition';
          break;
        case JSGlobal.IE:
          transform = 'filter';
          transformprop = 'filter';
          transformoriginstring = null;
          transformorigin = null;
          break;
        case JSGlobal.IE9:
          transform = '-ms-transform';
          transformprop = 'msTransform';
          transformoriginstring = '-ms-transform-origin';
          transformorigin = 'msTransformOrigin';
          break;
        case JSGlobal.OPERA:
          transform = '-o-transform';
          transformprop = 'OTransform';
          transformoriginstring = '-o-transform-origin';
          transformorigin = 'OTransformOrigin';
          transition = 'OTransition';
          break;
        default:
          transform = 'transform';
          transformprop = 'transform';
          transformoriginstring = 'transform-origin';
          transformorigin = 'transform-origin';
          transition = 'transition';
      }
    }

    function axisAligned(pos, size) {
      return 'left:' + pos[0] + 'px;top:' + pos[1] + 'px;width:' +
        size[0] + 'px;height:' + size[1] + 'px';
    }

    function axisAlignedTranslate(pos) {
      return 'translate(' + pos[0] + 'px, ' + pos[1] + 'px)';
    }

    function axisAlignedTranslate3d(pos) {
      return 'translate3d(' + pos[0] + 'px, ' + pos[1] + 'px,0px)';
    }

    function axisAlignedTranslateFull(pos) {
      return transform + ': translate(' + pos[0] + 'px, ' + pos[1] + 'px)';
    }

    function axisAlignedTranslate3dFull(pos) {
      return transform + ': translate3d(' + pos[0] + 'px, ' + pos[1] + 'px, 0px)';
    }

    function axisAlignedProp(domel, pos, theta, discon) {
      var dstyle = domel.style;
      if (GameFrame.settings.css_transitions) {
        if (!discon) {
          var vel = [Math.cos(theta), Math.sin(theta)];
          var time = GameFrame.settings.transition_time;
          dstyle[transition] = transform+' ' + parseInt(time * 0.001) + 's linear';
          dstyle[transformprop] = 'translate(' + (pos[0] + vel[0] * time * 0.01) + 'px, ' + (pos[1] + vel[1] * time * 0.01) + 'px)';
        } else {
          dstyle[transition] = '';
          dstyle[transformprop] = 'translate(' + pos[0] + 'px, ' + pos[1] + 'px)';
        }
      } else {
        switch (JSGlobal.browser) {
          case JSGlobal.IE:
            dstyle.left = pos[0]+'px';
            dstyle.top = pos[1]+'px';
            break;
          default:
            dstyle[transformprop] = 'translate(' + pos[0] + 'px, ' + pos[1] + 'px)';
            break;
        }
      }
    }

    function axisAlignedProp3d(domel, pos, theta, discon) {
      var dstyle = domel.style;
      if (GameFrame.settings.css_transitions) {
        if (!discon) {
          var vel = [Math.cos(theta), Math.sin(theta)];
          var time = GameFrame.settings.transition_time;
          dstyle[transition] = transform+' ' + parseInt(time * 0.001) + 's linear';
          dstyle[transformprop] = 'translate3d(' + (pos[0] + vel[0] * time * 0.01) + 'px, ' + (pos[1] + vel[1] * time * 0.01) + 'px,0)';
        } else {
          dstyle[transition] = '';
          dstyle[transformprop] = 'translate3d(' + pos[0] + 'px, ' + pos[1] + 'px,0)';
        }
      } else {
        dstyle[transformprop] = 'translate3d(' + pos[0] + 'px, ' + pos[1] + 'px,0)';
      }
    }

    function transformed(pos, size, theta) {
      if (theta == 0) {
        switch (JSGlobal.browser) {
          case JSGlobal.IE:
            return axisAligned(pos, size) + ";";
          default:
            return "width:"+size[0]+"px;height:"+size[1]+"px;"+transform + ":" + axisAlignedTranslate(pos)+";";
        }
      }

      var ct = Math.cos(theta);
      var st = Math.sin(theta);
      var nst = -st;

      switch (JSGlobal.browser) {
        case JSGlobal.IE:
          return 'width:' + size[0] + 'px;height:' + size[1] + 'px;left:' +
            pos[0] + 'px;top:' + pos[1] +
            'px;filter:progid:DXImageTransform.Microsoft.Matrix(M11=\'' +
            ct + '\',M12=\'' + nst + '\',M21=\'' + st + '\',M22=\'' + ct +
            '\',sizingMethod=\'auto expand\');';
        default:
          return "width:"+size[0]+"px;height:"+size[1]+"px;"+transformoriginstring + ':0 0;' + transform + ':rotate(' + theta + 'rad) ' + axisAlignedTranslate(pos, size) + ";";
      }
    }

    function transformed3d(pos, size, theta) {
      if (theta == 0) {
        switch (JSGlobal.browser) {
          case JSGlobal.IE:
            return axisAligned3d(pos, size) + ";";
          default:
            return "width:"+size[0]+"px;height:"+size[1]+"px;"+transform + ":" + axisAlignedTranslate3d(pos)+";";
        }
      }

      var ct = Math.cos(theta);
      var st = Math.sin(theta);
      var nst = -st;

      switch (JSGlobal.browser) {
        case JSGlobal.IE:
          return 'width:' + size[0] + 'px;height:' + size[1] + 'px;left:' +
            pos[0] + 'px;top:' + pos[1] +
            'px;filter:progid:DXImageTransform.Microsoft.Matrix(M11=\'' +
            ct + '\',M12=\'' + nst + '\',M21=\'' + st + '\',M22=\'' + ct +
            '\',sizingMethod=\'auto expand\');';
        default:
          return 'width:' + size[0] + 'px;height:' + size[1] + 'px;' + transformoriginstring + ':0 0;' + transform + ':' + axisAlignedTranslate3d(pos) + ' rotate3d(0,0,1,' + theta + 'rad);';
      }
    }

    function transformedProp(domel, pos, theta, discon) {
      var dstyle = domel.style;
      if (theta == 0) {
        axisAlignedProp(domel, pos, theta, discon);
        return;
      }
      var ct = Math.cos(theta);
      var st = Math.sin(theta);
      var nst = -st;

      switch (JSGlobal.browser) {
        case JSGlobal.IE:
          dstyle.left = pos[0] + 'px';
          dstyle.top = pos[1] + 'px';
          dstyle.filter = 'progid:DXImageTransform.Microsoft.Matrix(M11=\'' +
            ct + '\',M12=\'' + nst + '\',M21=\'' + st + '\',M22=\'' + ct +
            '\',sizingMethod=\'auto expand\')';
          break;
        default:
          if (GameFrame.settings.css_transitions) {
            if (!discon) {
              var vel = [Math.cos(theta), Math.sin(theta)];
              var time = GameFrame.settings.transition_time;
              dstyle[transition] = 'left ' + parseInt(time * 0.001) + 's linear, top ' + parseInt(time * 0.001) + 's linear';
              dstyle.left = (pos[0] + vel[0] * time * 0.01) + 'px';
              dstyle.top = (pos[1] + vel[1] * time * 0.01) + 'px';
              dstyle[transformprop] = 'rotate(' + theta + 'rad)';
            } else {
              dstyle[transition] = '';
              dstyle.left = pos[0] + 'px';
              dstyle.top = pos[1] + 'px';
              dstyle[transformprop] = 'rotate(' + theta + 'rad)';
            }
          } else {
            dstyle[transition] = '';
            dstyle.left = pos[0] + 'px';
            dstyle.top = pos[1] + 'px';
            dstyle[transformprop] = 'rotate(' + theta + 'rad)';
          }
          break;
      }
    }

    function transformedProp3d(domel, pos, theta, discon) {
      var dstyle = domel.style;
      if (theta == 0) {
        axisAlignedProp3d(domel, pos, theta, discon);
        return;
      }
      var ct = Math.cos(theta);
      var st = Math.sin(theta);
      var nst = -st;

      switch (JSGlobal.browser) {
        case JSGlobal.IE:
          dstyle.left = pos[0] + 'px';
          dstyle.top = pos[1] + 'px';
          dstyle.filter = 'progid:DXImageTransform.Microsoft.Matrix(M11=\'' +
            ct + '\',M12=\'' + nst + '\',M21=\'' + st + '\',M22=\'' + ct +
            '\',sizingMethod=\'auto expand\')';
          break;
        default:
          if (GameFrame.settings.css_transitions) {
            if (!discon) {
              dstyle[transformorigin] = '0 0';
              dstyle[transformprop] = axisAlignedTranslate3d(pos) + ' rotate3d(0,0,1,' + theta + 'rad)';
            } else {
              dstyle[transformorigin] = '0 0';
              dstyle[transition] = '';
              dstyle[transformprop] = axisAlignedTranslate3d(pos) + ' rotate3d(0,0,1,' + theta + 'rad)';
            }
          } else {
            dstyle[transformorigin] = '0 0';
            dstyle[transition] = '';
            dstyle[transformprop] = axisAlignedTranslate3d(pos) + ' rotate3d(0,0,1,' + theta + 'rad)';
          }
          break;
      }
    }

    var DomRender = {};
    DomRender.setupBrowserSpecific = setupBrowserSpecific;
    DomRender.transformed = transformed;
    DomRender.transformedProp = transformedProp;
    DomRender.transformed3d = transformed3d;
    DomRender.transformedProp3d = transformedProp3d;
    DomRender.axisAlignedTranslateFull = axisAlignedTranslateFull;
    DomRender.axisAlignedTranslate3dFull = axisAlignedTranslate3dFull;
    return DomRender;
  })();
