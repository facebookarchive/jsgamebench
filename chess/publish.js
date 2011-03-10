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
  var BoardVersion = 2;
  var fb_logged_in;
  var player = {savedRequests: {}, active_req: 0 };

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
        FB.init({
            appId  : fb_app_id,
              status : true, // check login status
              cookie : true, // enable cookies to allow the server to access the session
              xfbml  : false  // parse XFBML
              });
        FB.getLoginStatus(function(response) {
          fb_logged_in = response.session;
          if (response.session) {
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
        fb_logged_in = response.session;
        if (fb_logged_in) {
          getInfo();
        }
      }, {perms:''} ); // read_stream,publish_stream
    }
  }

  function removeTree(name) {
    var cell = document.getElementById(name);
    if (cell) {
      while (cell.childNodes.length >= 1) {
        cell.removeChild(cell.firstChild );       
      } 
      cell.parentNode.removeChild(cell);
    }
  }

  function makeBox(parent,name,pos,size) {
    var style='left:'+pos[0]+'px;top:'+pos[1]+'px;width:'+size[0]+'px;height:'+size[1]+'px;position:absolute;z-index:10000;align:top;'
    var el = FB.$(name);
    if (!el) {
      parent.innerHTML += '<div id="'+name+'" class="chess"></div>';
      el = FB.$(name);
    }
    el.style.cssText = style;
    return FB.$(name);
  }

  function onReqClick(req_id) {
    var req = player.requests[req_id];
    if (!req) {
      return;
    }
    removeTree('requests');
    player.active_req = req;
    var data = req.data;
    req.concede = data.concede;
    Gob.delAll();
    Board.init();
    Chess.newGameState('playing');
    Board.loadState(data.board);
    Chess.startPlayback();
   }

  function getInfo() {
    FB.api('me', {
      fields: 'name, picture'
    }, function (result) {
      player.name = result.name;
      player.picture = result.picture;
    });
    getRequests();
  }

  function addName(name,uid,pos,size) {
    var button = makeBox(FB.$('ui'),'name_'+uid,pos,size);
    button.innerHTML = '<img src="http://graph.facebook.com/'+uid+'/picture" /> '+FB.String.escapeHTML(name);
  }

  function addMyName(pos,size) {
    addName(player.name,fb_logged_in.uid,pos,size);
  }

  function addReqName(req,pos,size) {
    addName(req.from.name,req.from.id,pos,size);
  }

  function addReplayName(p,pos,size) {
    addName(p.name,p.id,pos,size);
  }

  function addRequestButton(req,x,y) {
    var name = 'req_'+req.id;
    var button = makeBox(FB.$('requests'),name,[x,y],[450,60]);
    button.innerHTML = '<img src="http://graph.facebook.com/'+req.from.id+'/picture"/>';
    var text = makeBox(button,'text_'+req.id,[60,0],[390,60]);
    text.innerHTML = '<div onclick="Publish.onReqClick('+req.id+');">' + req.from.name + '<br>' + req.message + '</div>';
  }
  
  function getRequests() {
    FB.api('me/apprequests', function(result) {
      var reqs = result.data;
      if (!reqs) {
        return;
      }
      ClientCmd.install('onReqClick',onReqClick);
      player.savedRequests = player.savedRequests || {};
      for(var i=reqs.length-1;i>=0;i--) {
        var req = reqs[i];
        req.data = req.data && FB.JSON.parse(req.data);
        if (!req.data.v || req.data.v != BoardVersion || player.savedRequests[req.id]) {
          removeRequest(req);
          reqs.splice(i,1);
        }
      }
      player.requests = {};
      makeBox(FB.$('gameframe'),'requests',[0,0],[0,0]).innerHTML = '';
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
        id: fb_logged_in.uid,
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
    removeTree: removeTree,
    makeBox: makeBox
  };
})();
