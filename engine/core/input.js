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

var Input = (function() {
    var gesture = {};
    var last_click_time = 0;
    var DOUBLE_CLICK_TIME = 250;


    function getMouseXY(event,down) {
   //  document.getElementById('gamebody').focus();
    event.currentTarget.focus();
      var prev = JSGlobal.mouse.buttons.slice(0);
      var button = 0;
      if (!event)
        event = window.event;
      if (event.which) {
        button = event.which - 1;
      } else if (event.button==2) {
        button = 1;
      }

      var pos = GameFrame.page2view([event.pageX, event.pageY]);
      var px = pos[0];
      var py = pos[1];

      if (event.touches && event.touches.length) {
        button = 0;
        px = event.touches[0].pageX;
        py = event.touches[0].pageY;
      }

      if (down > 0) {
        var now = (new Date).getTime();
        if (now - last_click_time < DOUBLE_CLICK_TIME) {
          JSGlobal.mouse.double_click = true;
        } else {
          last_click_time = now;
          JSGlobal.mouse.double_click = false;
        }
        if (!JSGlobal.mouse.buttons[button]) {
          JSGlobal.mouse.buttons[button] = 1;
        }
      }

      if (down < 0) {
        JSGlobal.mouse.buttons[button] = 0;
      }

      JSGlobal.mouse.x = px;
      JSGlobal.mouse.y = py;
      return false;
    }

    function getMouseWheel(event, delta) {
      return false;
    }

    function clearFocusAndState() {
      for (var i = 0, len = JSGlobal.key_state.length; i < len; i++) {
        JSGlobal.key_state[i] = 0;
      }
      document.activeElement.blur();
      document.body.focus();
    }

    function keyPress(event, down) {
      var code = event.which;
      var return_value = true;
      JSGlobal.key_state[code] = down;
      if (code == 27) {
        Input.clearFocusAndState();
        return false;
      }
      if (document.activeElement.tagName == 'INPUT' || document.activeElement.tagName == 'TEXTAREA') {
        return true;
      }
      return false;
    }

    function handleTyping(event) {
      if (document.activeElement.tagName == 'INPUT' || document.activeElement.tagName == 'TEXTAREA')
        return true;
      else if (JSGlobal.key_state[16]) // shift
        return true;
      else if (JSGlobal.key_state[17]) // control
        return true;
      else if (JSGlobal.key_state[18]) // alt
        return true;
      else if (JSGlobal.key_state[91]) // command
        return true;
      else if (JSGlobal.key_state[224]) // command
        return true;
      else if (JSGlobal.key_state[27]) // escape
        return true;
      else if (JSGlobal.key_state[8]) // del
        return true;
      else if (JSGlobal.key_state[26]) // delete
        return true;
      else {
        var text = String.fromCharCode(event.charCode);
        if (text == '/') {
          if (!UX.globals.chatbar) {
            UX.globals.chatbar = true;
            ClientCmd.exec({cmd: 'chatbar', args: []});
            UX.draw();
          }
          var c = document.getElementById('chat');
          if (c) {
            c.value += text;
            c.focus();
          }
        }
      }
      return false;
    }

    function gestureStart(event) {
      event.preventDefault();
      gesture.active = true;
      return false;
    }

    function gestureChange(event) {
      event.preventDefault();
      if (gesture.active) {
        gesture.rotation = event.rotation;
        gesture.scale = event.scale;
      }
      return false;
    }

    function gestureEnd(event) {
      event.preventDefault();
      gesture.active = false;
      return false;
    }

    function getGesture() {
      return gesture;
    }

    var Input = {};
    Input.getMouseXY = getMouseXY;
    Input.getMouseWheel = getMouseWheel;
    Input.handleTyping = handleTyping;
    Input.keyPress = keyPress;
    Input.clearFocusAndState = clearFocusAndState;
    Input.gestureStart = gestureStart;
    Input.gestureChange = gestureChange;
    Input.gestureEnd = gestureEnd;
    Input.getGesture = getGesture;
    return Input;
  })();
