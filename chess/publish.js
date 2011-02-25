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
  var fb_logged_in;
  var player = {savedRequests: {}, opponent_id: 0};
  
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
            if (response.session) {
              client_user.fb_logged_in = true;
              console.log('logged in');
              getInfo();
            } else {
              client_user.fb_logged_in = false;
              console.log('not logged in');
            }
          });
      }
    }
  }
  
  function fbLogin() {
    if (client_user.fb_logged_in) {
      return getInfo();
    } else {
      FB.login(function(response) {
        if (response.session) {
          fb_logged_in = true;
          getInfo();
        } else {
          fb_logged_in = false;
        }
      }, {perms:''} ); // read_stream,publish_stream
    }
  }

  function onReqClick(req) {
    UI.del('req'+req.id);
    if (player.savedRequests[req.id]) {
      // Skip for processed ones
      return;
    }
    var data = req.data && FB.JSON.parse(req.data);
    player.savedRequests[req.id] = true;
    Gob.delAll();
    Board.init();
    Pieces.setNewPositions(data.board);
    player.opponent_id = req.from.id;
    console.log('playing against: ' + req.from.id);
  //  return; //FIXMEBRUCE 
    FB.api(req.id, 'delete', function(response) {
      if (!response || response.error) {
        alert('Error occured');
      }
    });
  }

  function getInfo() {
    FB.api('me', {
      fields: 'name, picture'
    }, function (result) {
      player.name = result.name;
      player.picture = result.picture;
    });
    
    FB.api('me/apprequests', function(result) {
      var reqs = result.data;
      if (!reqs) {
        return;
      }
      ClientCmd.install('onReqClick',onReqClick);
      player.savedRequests = player.savedRequests || {};
      for(var i=0;i<reqs.length;i++) {
        var req = reqs[i];
        console.log('req: ' + i);
        if (player.savedRequests[req.id]) {
          continue;
       }
       markup = FB.String.format(
        '<img src="http://graph.facebook.com/{0}/picture" />{1}: {2}</p>', 
        req.from.id,
        FB.String.escapeHTML(req.from.name),
        FB.String.escapeHTML(req.message));
        UI.addButton('gameOpts', 'req'+req.id,
          {pos: [60, 70 + 65*i], width: 400, height: 60, fontsize: '200%',
          text: markup, command: {cmd: 'onReqClick', args: [req] }, req: req});
      }
    });
  }

  function sendRequest(msg,payload) {
    var cmd = {
      method: 'apprequests',
      message: msg,
      data: payload
    };
    if (player.opponent_id) {
      cmd.to = player.opponent_id;
    }
    console.log('send: ' + JSON.stringify(cmd));
    FB.ui(cmd);
  }
  
  function publishStory() {
    var loc = window.location;
    var url = loc.protocol + '//' + loc.host + '/chess/show/' + 
      encodeURIComponent(FB.JSON.stringify({
        player: {
          id: 0,
          name: 'name',
        }
      }));
    FB.ui({
      method: 'stream.publish',
      attachment: {
        name: 'Watch Replay',
        caption: 'Score!',
        description: (
          'Check out my awesome game of pirate chess i played with a friend'
        ),
        href: url
      }
    });
  }


  return {
    publishStory: publishStory,
    sendRequest: sendRequest,
    fbInit: fbInit,
    fbLogin: fbLogin,
  };
})();
