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
  var player  = {id: 0, score: 0, totalScore: 0, badgeCount: 0, savedRequests: {}, name: 'guest'};
  function isLoggedIn() {
    return fb_logged_in;
  }
  
  function fbLogin(func) {
    if (fb_logged_in) {
      func && func();
    } else {
      FB.login(function(response) {
        if (response.session) {
          fb_logged_in = true;
          func && func();
        } else {
          fb_logged_in = false;
        }
      }, {perms:''} ); // read_stream,publish_stream
    }
  }

  function fbLogout() {
    FB.logout(function(response) {
      fb_logged_in = false;
    });
  }

  function publishStory() {
    replayData = FB.Demo.replayData;
    if (!replayData) {
      return alert('have to play first!');
    }
    var loc = window.location;
    var url = loc.protocol + '//' + 'apps.facebook.com/pvn_ext' + '/pvn?show=' + 
      encodeURIComponent(FB.JSON.stringify({
        replay_data: replayData,
        player: {
          id: player.id,
          name: player.name,
        }
      }));
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
    UI.removeTree('req'+req.id);
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

    if (fb_app_id) {
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
    }
      
    function loadPlayer(id) {
      var text = localStorage['player_' + id];
      if (text) {
        try {
          player = JSON.parse(text)
        } catch (e) {}
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

          var button = UI.makeBox(0,'req'+req.id,[60, 70 + 65*i],[400,60],'ui_button');
          button.innerHTML = markup;
          button[Browser.mobile ? 'ontouchstart' : 'onmousedown'] = function() { onReqClick(req) };
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
    var str = 'Tot '+player.totalScore + ' Curr '+player.score + ' Badges ' + player.badgeCount;
    UI.addHTML('gameOpts', 'score', {pos: [70, 40], width:390, height: 32, uiclass: 'playerScore', markup: str});
    var name = player.name;
    var id = player.id;
    if (FB.Demo.replayData && FB.Demo.replayData.player) {
       var name = FB.Demo.replayData.player.name
       var id = FB.Demo.replayData.player.id;
    }
    if (FB.Demo.playing) {
      if (FB.Demo.in_replay) {
        name += ' (Replay)';
      } else {
        name += ' (Playing)';
      }
    }
    UI.addHTML('gameOpts', 'name', {pos: [70, 0], width:390, height: 32,  uiclass: 'playerScore', markup: name});
    var markup = id ? '<img src="https://graph.facebook.com/'+id+'/picture"/>' : '';
    UI.addHTML('gameOpts', 'headshot', {pos: [5, 0], width:50, height:50, uiclass: '', markup: markup });
  }
  
  function clearScore() {
    player.score = 0;
    setScore(0);
  }

  function checkReplayUrl() {
    var pathname = window.location.search,
    prefix = '?show=';
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
    fbLogout: fbLogout,
    publishStory: publishStory,
    sendRequest: sendRequest,
    setScore: setScore,
    clearScore: clearScore,
    checkReplayUrl: checkReplayUrl,
    isLoggedIn: isLoggedIn,
  };
})();


