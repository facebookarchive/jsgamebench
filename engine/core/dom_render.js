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

      switch (Browser.browser) {
        case Browser.CHROME:
          transform = '-webkit-transform';
          transformprop = 'webkitTransform';
          transformoriginstring = '-webkit-transform-origin';
          transformorigin = 'webkitTransformOrigin';
          transition = 'webkitTransition';
          break;
        case Browser.FIREFOX:
          transform = '-moz-transform';
          transformprop = 'MozTransform';
          transformoriginstring = '-moz-transform-origin';
          transformorigin = 'MozTransformOrigin';
          break;
        case Browser.WEBKIT:
          transform = '-webkit-transform';
          transformprop = 'webkitTransform';
          transformoriginstring = '-webkit-transform-origin';
          transformorigin = 'webkitTransformOrigin';
          transition = 'webkitTransition';
          break;
        case Browser.IE:
          transform = 'filter';
          transformprop = 'filter';
          transformoriginstring = null;
          transformorigin = null;
          break;
        case Browser.IE9:
          transform = '-ms-transform';
          transformprop = 'msTransform';
          transformoriginstring = '-ms-transform-origin';
          transformorigin = 'msTransformOrigin';
          break;
        case Browser.OPERA:
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

    function axisAlignedProp(domel, pos, theta, scale, discon) {
      var dstyle = domel.style;
      if (GameFrame.settings.css_transitions) {
        if (!discon) {
          var vel = [Math.cos(theta), Math.sin(theta)];
          var time = GameFrame.settings.transition_time;
          dstyle[transition] = transform+' ' + parseInt(time * 0.001) + 's linear';
          dstyle[transformprop] = 'translate(' + (pos[0] + vel[0] * time * 0.01) + 'px, ' + (pos[1] + vel[1] * time * 0.01) + 'px)' + ' scale('+scale+')';
        } else {
          dstyle[transition] = '';
          dstyle[transformprop] = 'translate(' + pos[0] + 'px, ' + pos[1] + 'px)' + ' scale('+scale+')';
        }
      } else {
        switch (Browser.browser) {
          case Browser.IE:
            dstyle.left = pos[0]+'px';
            dstyle.top = pos[1]+'px';
            break;
          default:
            dstyle[transformprop] = 'translate(' + pos[0] + 'px, ' + pos[1] + 'px)' + ' scale('+scale+')';
            break;
        }
      }
    }

    function axisAlignedProp3d(domel, pos, theta, scale, discon) {
      var dstyle = domel.style;
      if (GameFrame.settings.css_transitions) {
        if (!discon) {
          var vel = [Math.cos(theta), Math.sin(theta)];
          var time = GameFrame.settings.transition_time;
          dstyle[transition] = transform+' ' + parseInt(time * 0.001) + 's linear';
          dstyle[transformprop] = 'translate3d(' + (pos[0] + vel[0] * time * 0.01) + 'px, ' + (pos[1] + vel[1] * time * 0.01) + 'px,0)' + ' scale('+scale+')';
        } else {
          dstyle[transition] = '';
          dstyle[transformprop] = 'translate3d(' + pos[0] + 'px, ' + pos[1] + 'px,0)' + ' scale('+scale+')';
        }
      } else {
        dstyle[transformprop] = 'translate3d(' + pos[0] + 'px, ' + pos[1] + 'px,0)' + ' scale('+scale+')';
      }
    }

    function transformed(pos, size, theta, scale) {
      if (theta == 0 && (scale == 1.0 || Browser.browser != Browser.IE)) {
        return transform + ":" + axisAlignedTranslate(pos)+ + ' scale('+scale+');';
      }

      var ct = Math.cos(theta);
      var st = Math.sin(theta);
      var nst = -st;

      switch (Browser.browser) {
        case Browser.IE:
          return 'width:' + size[0] + 'px;height:' + size[1] + 'px;left:' +
            pos[0] + 'px;top:' + pos[1] +
            'px;filter:progid:DXImageTransform.Microsoft.Matrix(M11=\'' +
            ct*scale + '\',M12=\'' + nst*scale + '\',M21=\'' + st*scale + '\',M22=\'' + ct*scale +
            '\',sizingMethod=\'auto expand\');';
        default:
          return transform + ':rotate(' + theta + 'rad) ' + axisAlignedTranslate(pos) + ' scale('+scale+');';
      }
    }

    function transformed3d(pos, size, theta, scale) {
      if (theta == 0 && (scale == 1.0 || Browser.browser != Browser.IE)) {
        return transform + ":" + axisAlignedTranslate3d(pos)+' scale('+scale+');';
      }

      var ct = Math.cos(theta);
      var st = Math.sin(theta);
      var nst = -st;

      switch (Browser.browser) {
        case Browser.IE:
          return 'width:' + size[0] + 'px;height:' + size[1] + 'px;left:' +
            pos[0] + 'px;top:' + pos[1] +
            'px;filter:progid:DXImageTransform.Microsoft.Matrix(M11=\'' +
            ct*scale + '\',M12=\'' + nst*scale + '\',M21=\'' + st*scale + '\',M22=\'' + ct*scale +
            '\',sizingMethod=\'auto expand\');';
        default:
          return transform + ':' + axisAlignedTranslate3d(pos) + ' rotate3d(0,0,1,' + theta + 'rad)' + ' scale('+scale+');';
      }
    }

    function transformedProp(domel, pos, theta, scale, discon) {
      var dstyle = domel.style;
      if (theta == 0 && (scale == 1.0 || Browser.browser != Browser.IE)) {
        axisAlignedProp(domel, pos, theta, scale, discon);
        return;
      }
      var ct = Math.cos(theta);
      var st = Math.sin(theta);
      var nst = -st;

      switch (Browser.browser) {
        case Browser.IE:
          dstyle.left = pos[0] + 'px';
          dstyle.top = pos[1] + 'px';
          dstyle.filter = 'progid:DXImageTransform.Microsoft.Matrix(M11=\'' +
            ct*scale + '\',M12=\'' + nst*scale + '\',M21=\'' + st*scale + '\',M22=\'' + ct*scale +
            '\',sizingMethod=\'auto expand\')';
          break;
        default:
          if (GameFrame.settings.css_transitions) {
            if (!discon) {
              var vel = [Math.cos(theta), Math.sin(theta)];
              var time = GameFrame.settings.transition_time;
              dstyle[transition] = transform + ' ' + parseInt(time * 0.001) + 's linear';
              dstyle[transformprop] = axisAlignedTranslate([(pos[0] + vel[0] * time * 0.01),  (pos[1] + vel[1] * time * 0.01)]) + 'rotate(' + theta + 'rad)' + ' scale('+scale+')';
            } else {
              dstyle[transition] = '';
              dstyle[transformprop] = axisAlignedTranslate(pos) + ' rotate(' + theta + 'rad)' + ' scale('+scale+')';
            }
          } else {
            dstyle[transition] = '';
            dstyle[transformprop] = axisAlignedTranslate(pos) + ' rotate(' + theta + 'rad)' + ' scale('+scale+')';
          }
          break;
      }
    }

    function transformedProp3d(domel, pos, theta, scale, discon) {
      var dstyle = domel.style;
      if (theta == 0 && (scale == 1.0 || Browser.browser != Browser.IE)) {
        axisAlignedProp3d(domel, pos, theta, scale, discon);
        return;
      }
      var ct = Math.cos(theta);
      var st = Math.sin(theta);
      var nst = -st;

      switch (Browser.browser) {
        case Browser.IE:
          dstyle.left = pos[0] + 'px';
          dstyle.top = pos[1] + 'px';
          dstyle.filter = 'progid:DXImageTransform.Microsoft.Matrix(M11=\'' +
            ct*scale + '\',M12=\'' + nst*scale + '\',M21=\'' + st*scale + '\',M22=\'' + ct*scale +
            '\',sizingMethod=\'auto expand\')';
          break;
        default:
          if (GameFrame.settings.css_transitions) {
            if (!discon) {
              dstyle[transformprop] = axisAlignedTranslate3d(pos) + ' rotate3d(0,0,1,' + theta + 'rad)' + ' scale('+scale+')';
            } else {
              dstyle[transition] = '';
              dstyle[transformprop] = axisAlignedTranslate3d(pos) + ' rotate3d(0,0,1,' + theta + 'rad)' + ' scale('+scale+')';
            }
          } else {
            dstyle[transition] = '';
            dstyle[transformprop] = axisAlignedTranslate3d(pos) + ' rotate3d(0,0,1,' + theta + 'rad)' + ' scale('+scale+')';
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
