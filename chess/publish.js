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

var Publish = (function() {
  var BoardVersion = 3;
  var fb_logged_in;
  var player = { savedRequests: {}, active_req: 0 };

  function clearOpponent() {
    player.active_req = 0;
  }

  function hasOpponent() {
    return player.active_req;
  }

  function isLoggedIn() {
    return fb_logged_in;
  }

  function fbInit() {
    if (!fb_app_id) {
      return;
    } else {
      if (document.getElementById('fb-root')) {
        logtime('FB.init');
        FB.init({
            appId  : fb_app_id,
              status : false, // check login status
              cookie : true, // enable cookies to allow the server to access the session
              xfbml  : false  // parse XFBML
              });
        logtime('FB.init-done (sync)');
        logtime('FB.getLoginStatus');
        FB.getLoginStatus(function(response) {
          logtime('FB.getLoginStatus-done');
          fb_logged_in = response.authResponse;
          if (fb_logged_in) {
            console.log('logged in');
            getInfo();
          } else {
            console.log('not logged in');
          }
        });
      }
    }
  }

  function fbLogin() {
    if (fb_logged_in) {
      return getInfo();
    } else {
      FB.login(function(response) {
        fb_logged_in = response.authResponse;
        if (fb_logged_in) {
          getInfo();
        }
      }, {perms:''} ); // read_stream,publish_stream
    }
  }

  function onReqClick(req) {
    if (!req) {
      return;
    }
    UI.removeTree('requests');
    try {
      player.active_req = req;
      var data = req.data;
      req.concede = data.concede;
      Gob.delAll();
      Board.init();
      Chess.newGameState('playing');
      Board.loadState(data.board);
      Chess.startPlayback();
    } catch (e) {
      removeRequest(req);
    }
   }

  function getInfo() {
    logtime('getinfo');
    FB.api('me', {
      fields: 'name, picture'
    }, function (result) {
      player.name = result.name;
      player.picture = result.picture;
      logtime('getinfo-done');
      dumplog(2);
    });
    getRequests();
  }

  function addName(name,uid,pos,size) {
    var button = UI.makeBox(FB.$('ui'),'name_'+uid,pos,size,'chess');
    button.innerHTML = '<img src="https://graph.facebook.com/'+uid+'/picture" /> '+FB.String.escapeHTML(name);
  }

  function addMyName(pos,size) {
    addName(player.name,fb_logged_in.userID,pos,size);
  }

  function addReqName(req,pos,size) {
    addName(req.from.name,req.from.id,pos,size);
  }

  function addReplayName(p,pos,size) {
    addName(p.name,p.id,pos,size);
  }

  function addRequestButton(req,x,y) {
    var name = 'req_'+req.id;
    if (!FB.$(name)) {
      var button = UI.makeBox(FB.$('requests'),name,[x,y],[450,60],'chess');
      button.innerHTML = '<img src="https://graph.facebook.com/'+req.from.id+'/picture"/>';
      var text = UI.makeBox(button,'text_'+req.id,[60,0],[390,60],'chess');
      text.innerHTML = '<div>' + req.from.name + '<br>' + req.message + '</div>';
      text.onclick = function() { onReqClick(req) };
    }
  }
  
  function getRequests(valid_state) {
    logtime('request');
    FB.api('me/apprequests', function(result) {
      var reqs = result.data;
      logtime('request-done');
      dumplog(4);
      if (!reqs || valid_state != Chess.gameState()) {
        return;
      }
      player.savedRequests = player.savedRequests || {};
      for(var i=reqs.length-1;i>=0;i--) {
        var req = reqs[i];
        req.data = req.data && FB.JSON.parse(req.data);
        if (!req.data.v || req.data.v != BoardVersion || player.savedRequests[req.id]) {
          console.log('remove req: ' + req.id + ' ver: ' + req.data.v);
          removeRequest(req);
          reqs.splice(i,1);
        }
      }
      player.requests = {};
      UI.makeBox(FB.$('ui'),'requests',[0,0],[0,0]);
      for(var i=0;i<reqs.length;i++) {
        var req = reqs[i];
        player.requests[req.id] = req;
        addRequestButton(req,60, 70 + 75*i);
      }
    });
  }

  function removeRequest(req) {
    if (req) {
      player.savedRequests[req.id] = true;
      FB.api(req.id, 'delete', function(response) {
      });
      Chess.newGameState('menu');
    }
  }

  function sendRequest(msg,payload) {
    payload.v = BoardVersion;
    var req = player.active_req;
    var cmd = {
      method: 'apprequests',
      message: msg,
      data: payload
    };

    if (req) {
      cmd.to = req.from.id;
    }
    FB.ui(cmd, function(response) {
        if (response && !response.error) {
          player.active_req = 0;
          removeRequest(req);
          Chess.newGameState('menu');
          console.log('menu state');
        } else {
          Board.undoMove();
        }
      });
  }

  function sendMove() {
    var payload = {board: Board.getState()};
    if (player.active_req) {
      Publish.sendRequest(player.active_req.message,payload);
    } else {
      var t = new Date;
      var time_str = (t.getHours() % 12) +':'+ t.getMinutes() + (t.getHours()<=12 ? 'AM' : 'PM') + ' ' + t.toString().split(' ')[0];
      Publish.sendRequest('(game started '+time_str+')',payload);
    }
    //sendMsg('addcheevo win');
    //sendMsg('addaction take rook');
  }

  function publishStory() {
    var req = player.active_req;
    var payload = {
      board: Board.getState(),
      p1: {
        id: req.from.id,
        name: req.from.name
      },
      p2: {
        id: fb_logged_in.userID,
        name: player.name
      }
    };
    var loc = window.location;
    var url = loc.protocol + '//' + loc.host + '/chess#' + encodeURIComponent(FB.JSON.stringify(payload));
    var cmd = {
      method: 'stream.publish',
      attachment: {
        name: 'Watch Replay',
        caption: 'Checkmate!',
        description: (
          'Check out my awesome game of pirate chess i played with '+req.from.name
        ),
        href: url
      }
    };
    FB.ui(cmd, function(response) {
      if (response && !response.error) {
        player.active_req = 0;
        removeRequest(req);
        Chess.newGameState('menu');
      }
    });
  }

  function sendMsg(str) {
    mypostrequest = new XMLHttpRequest();
    mypostrequest.open("POST", "/msg", true);
    mypostrequest.setRequestHeader("Content-type", "text/plain");
    mypostrequest.send('cmd: ' + str);
  }

  return {
    publishStory: publishStory,
    sendRequest: sendRequest,
    fbInit: fbInit,
    fbLogin: fbLogin,
    isLoggedIn: isLoggedIn,
    clearOpponent: clearOpponent,
    getRequests: getRequests,
    hasOpponent: hasOpponent,
    addRequestButton: addRequestButton,
    removeRequest: removeRequest,
    addReqName : addReqName,
    addMyName : addMyName,
    addReplayName : addReplayName,
    onReqClick : onReqClick,
    sendMove : sendMove,
  };
})();
