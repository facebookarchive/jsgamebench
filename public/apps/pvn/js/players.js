'use strict';
FB.provide('UI', {
  // Simple Data Binding
  bind: function(target, targetPropName, src, srcPropName, settings) {
    settings = settings || {};
    var fn = function() {
      var value =  src[srcPropName] !== undefined ? src[srcPropName] :
        (settings['default'] !== undefined ? settings['default'] : '');
      target[targetPropName] =  value.toString();
    }

    if (FB.Type.isType(src, FB.Obj)) {
      src.monitor(srcPropName, fn);
    } else if (settings['event']) {
      FB.Event.monitor(settings['event'], fn);
    } else {
      fn();
    }
  }
});

(function() {
  FB.provide('Game.Players', {
    curPlayer: null,
    init: function() {
      self.checkUser();
      FB.Event.subscribe('auth.statusChange', self.checkUser);
    },

    checkUser: function() {
      var session = FB.getSession();
      if (session) {
        var uid = session.uid;
        if (!uid) {
          // Hack to parse session from access token
          uid = /-(.*)\|/.exec(session.access_token)[1];
        }

        self.curPlayer = new FB.Game.Player(uid);
      } else {
        self.curPlayer = null;
      }
      FB.Event.fire('game.playerChanged');
    }

  });

  // Create an shorthand
  self = FB.Game.Players;
})();

FB.subclass('Game.Player', 'Obj',
  /**
   * Constructor
   */
  function(id) {
    this.id = id;
    var info = localStorage['player_' + id];
    if (info) {
      info = FB.JSON.parse(info)
      FB.copy(this, info);
    } else {
      this.score = 0;
      this.totalScore = 0;
      this.badgeCount = 0;
      this.savedRequests = {};
    }

    if (!this.name || !this.picture) {
      FB.api('me', {
        fields: 'name, picture'
      }, FB.bind(function (result) {
        this.setProperty('name', result.name);
        this.setProperty('picture', result.picture);
      }, this));
    }

    this.subscribe('score', FB.bind(function(score) {
      this.totalScore += score;
      this.fire('totalScore');
      this.save();
    }, this));

    FB.api('me/apprequests', FB.bind(function(result) {
      this.setProperty('apprequests', result.data);
    }, this));
  }, {
    save: function() {
      data = {
        name: this.name,
        picture: this.picture,
        totalScore: this.totalScore,
        badgeCount: this.badgeCount,
        savedRequests: this.savedRequests
      };

      localStorage['player_' + this.id] = FB.JSON.stringify(data);
    },
  }
);

FB.provide('Game.Menu', {
  

  init: function() {
    FB.Event.monitor('game.playerChanged', function() {
      var player = FB.Game.Players.curPlayer;
      if (player) {
        FB.UI.bind(FB.$('player_name'), 'innerText',
                   player, 'name', {
                   default: 'Guest'
                   });

        FB.UI.bind(FB.$('player_picture'), 'src',
                   player, 'picture');

        FB.UI.bind(FB.$('score'), 'innerText',
                   player, 'score', {
                   default: 0
                   });

        FB.UI.bind(FB.$('total_score'), 'innerText',
                   player, 'totalScore', {
                   default: 0
                   });
        FB.UI.bind(FB.$('badge_count'), 'innerText',
                   player, 'badgeCount', {
                   default: 0
                   });
        player.subscribe('apprequests', function (requests) {
          var markup = '<div>Requests:</div>';
          for (var i=0; i < requests.length; i++) {
            var req = requests[i];
            if (player.savedRequests[req.id]) {
              // Skiped requests that's processed already
              continue;
            }
            markup += FB.String.format(
              '<p id="request_{0}" onclick="FB.Game.Menu.onReqClick({1});"><img src="http://graph.facebook.com/{2}/picture" />{3}: {4}</p>', 
              req.id,
              i,
              req.from.id,
              FB.String.escapeHTML(req.from.name),
              FB.String.escapeHTML(req.message));
          }
          FB.$('requests').innerHTML = markup;
        });
      }
    });

    FB.Event.subscribe('game.state', function(state) {
      var className = state != 'play' ? 'menu_mode' : 'play_mode';
      FB.$('viewport').className = className;

      var hasReplay = !!FB.Game.Players.curPlayer.replayData;
      FB.$('rewind').style.display = FB.$('send_request').style.display =
        hasReplay ? 'inline' : 'none';
    });

    FB.$('rewind').onclick = function() {
      if (FB.Game.Players.curPlayer.replayData) {
        FB.Demo.replay(FB.Game.Players.curPlayer.replayData);
      }
    }

    FB.$('send_request').onclick = function() {
      FB.Game.Menu.sendRequest('pirate');
    }
    
    FB.$('publish').onclick = FB.Game.Menu.publishStory;

    FB.$('play').onclick = FB.Demo.reload;

    FB.Game.Menu.checkUrl();

  },

  // Check url's query paramter for initial state
  checkUrl: function() {
    // Note: I cannot encode parameter as query paramter
    // because auth.py today force login in order to check
    // whitelist for now. As a result, it make redirect to oauth
    // all query parameter would get lost.
    // So I have to encode that as part of url path in form
    // of http:<...>/show/<reason>
    var pathname = window.location.pathname,
    prefix = 'show/',
    i = pathname.indexOf(prefix);
    if (i < 0) {
      return;
    }

    var reasonStr = pathname.substr(i+1),
    reason = FB.JSON.parse(decodeURIComponent(reasonStr));
    
    if (reason) {
      if (reason.player) {
        FB.$('replay_other_name').innerText = reason.player.name;
        FB.$('replay_other_picture').src = 'http://graph.facebook.com/' +
          reason.player.id + '/picture';
      }
      FB.$('show_other').onclick = function() {
        FB.Demo.replay(reason.replay_data);
      }
      
      FB.$('viewport').className = 'replay_other_menu';
    }
  },

  onReqClick: function(index) {
    var player =  FB.Game.Players.curPlayer;
    var req = player.apprequests[index];

    FB.$('request_' + req.id).style.display = 'none';

    if (player.savedRequests[req.id]) {
      // Skip for processed ones
      return;
    }

    data = FB.JSON.parse(req.data);
    if (data.gift) {
      if (data.gift.points) {
        player.totalScore += data.gift.points;
        player.fire('totalScore');
      }

      if (data.gift.badge) {
        player.badgeCount += data.gift.badge;
        player.fire('badgeCount');
      }
    }
    player.savedRequests[req.id] = req;
    player.save();
  },

  publishStory: function() {
    var loc = window.location;
    var player = FB.Game.Players.curPlayer;
    var url = loc.protocol + '//' + loc.host + '/show/' + 
      encodeURIComponent(FB.JSON.stringify({
        replay_data: player.replayData,
        player: {
          id: player.id,
          name: player.name,
        }
      }));
    console.log('published url is ' + url);
    FB.ui({
      method: 'stream.publish',
      attachment: {
        name: 'Watch Replay',
        caption: 'Score!',
        description: (
          'I got ' + FB.Game.Players.curPlayer.score + 
            'points! Watch my play on Ninja vs. Pirate'
        ),
        href: url
      }
    });
  },

  sendRequest: function(type) {
    FB.ui({
      method: 'apprequests',
      message: 'Just scored ' + FB.Game.Players.curPlayer.score + ' points ' +
        'on this game and would like to send a gift of 5 points and a badge.',
      data: {
        gift: {
          points: 5, 
          badge: 1,
        }
      }
    });
  }
});