var Chess = (function() {
    var game_state = 'login';
    var old_game_state = "";
    var move = 0;
    var playback = false;
    var pbframe = 0;
    var menu_time,request_time;
    var explo;
    var replay = {};
    var Start = 'Start', Middle = 'Middle', End = 'End';

    function gameState() {
      return game_state;
    }
    
    function startPlayback() {
      playback = true;
      move = 0;
      pbframe = 0;
      Board.setState(0);
    }

    function loadImageList(path,list) {
      for(var i=0;i<list.length;i++) {
        var label = list[i].split('.')[0];
        var url = path + list[i];
        Sprites.add(label, {url: url, frames: 1, framepos: [[0, 0]], width: 0, height: 0 });
      }
    }

    function loadAnimList(path,list) {
      for(var i=0;i<list.length;i++) {
        var anim = list[i]
        var label = anim[0].split('.')[0];
        var url = path + anim[0];
        var frames = anim[1]|0;
        var framepos = [];
        for(var j=0;j<frames;j++) {
          framepos[j] = [j, 0];
        }
        Sprites.add(label, {url: url, frames: frames, framepos: framepos, width: 0, height: 0, auto_anim: 1, no_anim: 1 });
      }
    }

    function newGameState(state) {
      if (state == game_state) {
        return;
      }
      UI.removeTree('ui');
      UI.makeBox(FB.$('gamebody'),'ui',[0,0],[0,0]);
      game_state = state;
      if (state == 'menu') {
        Publish.getRequests(game_state);
        request_time = 0;
        menu_time = (new Date).getTime();
      }
    }

    function makeExplosion(pos,scale) {
      explo = explo || Gob.add(Utils.uuidv4(), 'small_explo', 0, pos, [0,0], 10, scale / 7);
    }

    function tick() {
      if (!FB.$('ui')) {
        UI.makeBox(FB.$('gamebody'),'ui',[0,0],[0,0]);
      }
      if (Pieces.isAnimating()) {
        Pieces.updateMove();
      } else if (!playback) {
        if (game_state == 'playing') {
          if (Input.mouse.buttons[0]) {
            Input.mouse.buttons[0] = 0;
            var dx = Input.mouse.x;
            var dy = Input.mouse.y;
            Pieces.select(dx,dy);
            move = Board.getMove();
          }
        }
      } else {
        move++;
        Board.setState(move);
        if (move == Board.getMove()) {
          playback = false;
        }
      }
      if (game_state == 'login' && Publish.isLoggedIn()) {
        newGameState('menu');
      }
      if (game_state == 'menu') {
        var dt = parseInt(((new Date).getTime() - menu_time) / 1000);
        if (dt > request_time) {
          Publish.getRequests(game_state);
          request_time += Math.sqrt(dt);
        }
      }
      
      if (old_game_state != game_state) {
        var size = [300,55];
        old_game_state = game_state;
        switch (game_state) {
          case 'login':
            UI.button('Login',[Start,Start], Publish.fbLogin);
            break;
          case 'menu':
            UI.button('New Game',[Start,Start], newGame);
            break;
          case 'moving':
            break;
          case 'moved':
            UI.button('Send Move', [End,End], Publish.sendMove);
          case 'playing':
            UI.button('Menu',[Start,Start], function() { newGameState('menu'); });
            var req = Publish.hasOpponent();
            if (req && game_state != 'moved') {
              if (req.concede) {
                UI.button('Remove', [End,End], function() { Publish.removeRequest(req) });
                UI.button('Publish',[Start,End], Publish.publishStory);
              } else {
                UI.button('Concede', [End,End], concede);
              }
              Publish.addReqName(req,UI.uiPos([Middle,Start],size),size);
            }
            Publish.addMyName(UI.uiPos([Middle,End],size),size);
            break;
          case 'replay':
            UI.button('Menu',[Start,Start], function() { newGameState('menu'); });
            Publish.addReplayName(replay.p1,UI.uiPos([Middle,Start],size),size);
            Publish.addReplayName(replay.p2,UI.uiPos([Middle,End],size),size);
            break;
        }
      }
    }

    function postImageLoad() {
      Board.init();
      Pieces.init();
      var hash = window.location.hash;
      hash = hash.length && hash.substr(1);
      if (hash) {
        try {
         replay = FB.JSON.parse(decodeURIComponent(hash));
         Gob.delAll();
         Board.init();
         Chess.newGameState('replay');
         Board.loadState(replay.board);
         Chess.startPlayback();
        } catch(e) {
        }
      }
    }

    function newGame() {
      Gob.delAll();
      Board.initState();
      Publish.clearOpponent();
      move = 0;
      Board.setState(0);
      newGameState('playing');
    }

    function init() {
      GameFrame.updateSettings({
        render_mode: GameFrame.HTML_ONLY,
        update_existing: true,
        use_div_background: true,
        css_transitions: false,
        css_keyframe: false,
        sprite_sheets: true,
        int_snap: true,
        hidefps: true,
        transform3d:true});

      GameFrame.setXbyY();
      Input.hookEvents('gamebody');
      newGameState('login');
      Publish.fbInit(fb_app_id);
      loadImageList('/chess/images/',['Pirate_King.png', 'Ninja_King.png', 'Pirate_Queen.png', 'Ninja_Queen.png', 'Pirate_Bishop.png', 'Ninja_Bishop.png', 'Pirate_Knight.png', 'Ninja_Knight.png', 'Pirate_Rook.png', 'Ninja_Rook.png', 'Pirate_Pawn.png', 'Ninja_Pawn.png']);
      loadAnimList('/chess/images/',[['small_explo.png', 6]]);
    }

     function concede() {
      var state = Board.getState();
      Publish.sendRequest('I concede defeat!',{board: state,concede:1});
     }

    function resize() {
      Board.init();
      Pieces.resetBoardGobs();
      old_game_state = '';  // force recalc
    }

    function draw() {
      Pieces.tick();
      Board.tick();
      Render.tick();
    }

    Init.setFunctions({app: tick, init: init, draw: draw, resize: resize, postLoad: postImageLoad, fps:60 });

    return {
      newGameState: newGameState,
      startPlayback: startPlayback,
      makeExplosion: makeExplosion,
      gameState : gameState
    }
})();


