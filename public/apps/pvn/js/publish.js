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

  var fb_logged_in = false;
  var player;
  
  function fbLogin(func) {
    if (fb_logged_in) {
      func && func();
    } else {
      function fbLoginUiCb(func) {
        UI.del('fblogin');
        if (!func) {
          return;
        }
        FB.login(function(response) {
          if (response.session) {
            fb_logged_in = true;
            func && func();
          } else {
            fb_logged_in = false;
          }
        }, {perms:'read_stream,publish_stream,user_about_me'} );
      }
      ClientCmd.install('fbLoginUiCb',fbLoginUiCb);
      UI.addCollection('', 'fblogin', {pos: [0, 0]});
      UI.addHTML('fblogin', 'bkgrnd', {pos: [5, 24], uiclass: 'fblogin', markup: "Login to FB?"});
      UI.addButton('fblogin', 'loginOk', {pos: [15, 55], width: 75, height: 20, text: 'Login', command: {cmd: 'fbLoginUiCb', args: [func]}});
      UI.addButton('fblogin', 'loginCancel', {pos: [105, 55], width: 75, height: 20, text: 'Cancel', command: {cmd: 'fbLoginUiCb', args: [0]}});
    }
  }

  function publishStory() {
    replayData = FB.Demo.replayData;
    if (!replayData) {
      return alert('have to play first!');
    }
    var loc = window.location;
    var url = loc.protocol + '//' + loc.host + '/pvn/show/' + 
      encodeURIComponent(FB.JSON.stringify({
        replay_data: replayData,
        player: {
          id: player.id,
          name: player.name,
        }
      }));
    fbLogin(function () {
      FB.ui({
        method: 'stream.publish',
        attachment: {
          name: 'Watch Replay',
          caption: 'Score!',
          description: (
            'I got ' + player.score + 
              'points! Watch my replay on Ninja vs. Pirate'
          ),
          href: url
        }
      });
    });
  }

  function sendRequest() {
    FB.ui({
      method: 'apprequests',
      message: 'Just scored ' + player.score + ' points ' +
        'on this game and would like to send a gift of 5 points and a bonus pirate.',
      data: {
        gift: {
          points: 5, 
          badge: 1,
        }
      }
    });
  }

  function onReqClick(req) {
    UI.del('req'+req.id);
    if (player.savedRequests[req.id]) {
      // Skip for processed ones
      return;
    }
    var data = req.data && FB.JSON.parse(req.data);
    if (data && data.gift) {
      if (data.gift.points) {
        player.totalScore += data.gift.points;
      }
      if (data.gift.badge) {
        player.badgeCount += data.gift.badge;
      }
    }
    player.savedRequests[req.id] = true;
    setScore(0);
  }

  function fbInit(fb_app_id) {
    FB.init({
      appId  : fb_app_id,
      status : true, // check login status
      cookie : true, // enable cookies to allow the server to access the session
    });
    
    FB.getLoginStatus(function(response) {
        if (response.session) {
          fb_logged_in = true;
          console.log('logged in');
          loadPlayer(response.session.uid);
        } else {
          fb_logged_in = false;
          console.log('not logged in');
          loadPlayer(0);
        }
      });
      
    function loadPlayer(id) {
      var text = localStorage['player_' + id];
      if (text) {
        try {
          player = JSON.parse(text)
        } catch (e) {}
      }
      if (!player) {
        player = {score: 0, totalScore: 0, badgeCount: 0, savedRequests: {}, name: 'guest'};
      }
      player.id = id;
      if (!id) {
        clearScore();
        return;
      }
      FB.api('me', {
        fields: 'name, picture'
      }, function (result) {
        player.name = result.name;
        player.picture = result.picture;
       clearScore();
     });
      FB.api('me/apprequests', function(result) {
        var reqs = result.data;
        if (!reqs) {
          return;
        }
        player.savedRequests = player.savedRequests || {};
        ClientCmd.install('onReqClick',onReqClick);
        for(var i=0;i<reqs.length;i++) {
          var req = reqs[i];
         if (player.savedRequests[req.id]) {
           continue;
         }
         markup = FB.String.format(
          '<img src="http://graph.facebook.com/{0}/picture" />{1}: {2}</p>', 
           req.from.id,
          FB.String.escapeHTML(req.from.name),
          FB.String.escapeHTML(req.message));
          UI.addButton('gameOpts', 'req'+req.id,
            {pos: [60, 70 + 65*i], width: 400, height: 60,
            text: markup, command: {cmd: 'onReqClick', args: [req] }});
        }
      });
    }
  }

  function setScore(score) {
    player.score += score;
    if (!FB.Demo.in_replay) {
      player.totalScore += score;
      if (player.id) {
        localStorage['player_' + player.id] = FB.JSON.stringify(player);
      }
    }
    var str = 'Total: '+player.totalScore + ' Current: '+player.score + ' Badges: ' + player.badgeCount;
    UI.addHTML('gameOpts', 'score', {pos: [5, 28], width:335, height: 20, uiclass: 'playerScore', markup: str});
    var name = player.name;
    var id = player.id;
    if (FB.Demo.replayData && FB.Demo.replayData.player) {
       var name = FB.Demo.replayData.player.name
       var id = FB.Demo.replayData.player.id;
    }
    if (FB.Demo.in_replay) {
      name += ' (Replay)';
    } else {
      name += ' (Playing)';
    }
    UI.addHTML('gameOpts', 'name', {pos: [55, 48], width:284, height: 16,  uiclass: '', markup: name});
    var markup = id ? '<img src="https://graph.facebook.com/'+id+'/picture"/>' : '';
    UI.addHTML('gameOpts', 'headshot', {pos: [5, 48], width:50, height:50, uiclass: '', markup: markup });
  }
  
  function clearScore() {
    player.score = 0;
    setScore(0);
  }

  function checkReplayUrl() {
    var pathname = window.location.pathname,
    prefix = 'show/',
    i = pathname.indexOf(prefix);
    if (i < 0) {
      return;
    }
    var reasonStr = pathname.substr(i+prefix.length);
    reason = FB.JSON.parse(decodeURIComponent(reasonStr));
    FB.Demo.replayData = reason.replay_data;
    FB.Demo.replayData.player = reason.player;
    FB.Demo.replay();
  }
  
  return {
    fbInit: fbInit,
    fbLogin: fbLogin,
    publishStory: publishStory,
    sendRequest: sendRequest,
    setScore: setScore,
    clearScore: clearScore,
    checkReplayUrl: checkReplayUrl,
  };
})();


