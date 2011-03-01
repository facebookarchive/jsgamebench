var Chess = (function() {
    var game_state = 'login';
    var old_game_state = "";
    var move = 0;

    var playback = false;
    var pbframe = 0;

    var explo;
    
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
      UI.del('buttons');
      UI.addCollection('', 'buttons', {pos: [0, 0]});
      game_state = state;
      if (state == 'menu') {
        Publish.getRequests();
      }
    }

    function makeExplosion(pos,scale) {
      console.log('make explo: ' + pos + ': ' + scale);
      explo = explo || Gob.add(Utils.uuidv4(), 'small_explo', 0, pos, [0,0], 10, scale / 7);
    }
    
    function tick() {
      if (explo) {
        explo.frame += 1;
        explo.dirty = 1;
        if (explo.frame >= Gob.numFrames(explo.id)) {
          Gob.del(explo.id);
          explo = 0;
        }
       }
      if (!playback) {
        if (game_state == 'playing') {
          if (JSGlobal.mouse.buttons[0]) {
            JSGlobal.mouse.buttons[0] = 0;
            var dx = JSGlobal.mouse.x;
            var dy = JSGlobal.mouse.y;
            if (move == Board.getMove()) {
              Pieces.select(dx,dy);
              move = Board.getMove();
            }
          } else if (JSGlobal.key_state[32]) {
            JSGlobal.key_state[32] = 0;
            startPlayback();
          } else if (JSGlobal.key_state[Key.LEFT]) {
            JSGlobal.key_state[Key.LEFT] = 0;
            move > 0 ? --move : 0;
            Board.setState(move);
          } else if (JSGlobal.key_state[Key.RIGHT]) {
            JSGlobal.key_state[Key.RIGHT] = 0;
            move < Board.getMove() ? move++ : move;
            Board.setState(move);
          }
        }
      } else {
        pbframe++;
        if (pbframe == 20) {
          pbframe = 0;
          move++;
          Board.setState(move);
          if (move == Board.getMove()) {
            playback = false;
          }
        }
      }
      if (game_state == 'login' && Publish.isLoggedIn()) {
        newGameState('menu');
      }
      if (old_game_state != game_state) {
        console.log('game state: ' + game_state);
        old_game_state = game_state;
        switch (game_state) {
          case 'login':
            UI.addButton('buttons', 'login', {pos: [60, 0], width: 150, height: 60, fontsize: '300%', text: 'Login', command: {cmd: 'login' }});
            break;
          case 'menu':
            UI.addButton('buttons', 'newgame', {pos: [60, 0], width: 150, height: 60, fontsize: '250%', text: 'New Game', command: {cmd: 'newGame' }});
            break;
          case 'moved':
            UI.addButton('buttons', 'request', {pos: [JSGlobal.w/2+200, JSGlobal.h-80], width: 150, height: 60, fontsize: '250%', text: 'Send Move', command: {cmd: 'sendRequest' }});
          case 'playing':
            UI.addButton('buttons', 'games', {pos: [60, 0], width: 150, height: 60, fontsize: '250%', text: 'Menu', command: {cmd: 'newGameState', args:['menu'] }});
            if (Publish.hasOpponent() && game_state != 'moved') {
              UI.addButton('buttons', 'concede', {pos: [JSGlobal.w/2+200,JSGlobal.h-80], width: 150, height: 60, fontsize: '250%', text: 'Concede', command: {cmd: 'concede' }});
            }
            var req = Publish.hasOpponent();
            req && Publish.addReqName(req,JSGlobal.w/2-150,0);
            Publish.addMyName(JSGlobal.w/2-150,JSGlobal.h-80);
            break;
        }
      }
    }

    function postImageLoad() {
      Board.init();
      Pieces.init();
    }

    function clickButton() {

    }

    function newGame() {
      Gob.delAll();
      Board.init();
      Pieces.init();
      Publish.clearOpponent();
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
        transform3d:true});

      GameFrame.setXbyY();
      UI.hookUIEvents('gamebody');
      ClientCmd.install('sendRequest',sendMove);
      ClientCmd.install('publishStory',Publish.publishStory);
      ClientCmd.install('login',Publish.fbLogin);
      ClientCmd.install('newGame',newGame);
      ClientCmd.install('newGameState',newGameState);
      ClientCmd.install('concede',concede);
      ClientCmd.install('removeRequest',Publish.removeRequest);

      newGameState('login');
      Publish.fbInit(fb_app_id);
      loadImageList('/chess/images/',['Pirate_King.png', 'Pirate_King_Gray.png', 'Pirate_Queen.png', 'Pirate_Queen_Gray.png', 'Pirate_Bishop.png', 'Pirate_Bishop_Gray.png', 'Pirate_Knight.png', 'Pirate_Knight_Gray.png', 'Pirate_Rook.png', 'Pirate_Rook_Gray.png', 'Pirate_Pawn.png', 'Pirate_Pawn_Gray.png']);
      loadAnimList('/chess/images/',[['small_explo.png', 6]]);
    }

    function sendMove() {
      var state = Board.getState();
      Publish.sendRequest('I made my move!',{board: state});
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

    Init.setFunctions({app: tick, init: init, draw: draw, ui: UI.tick, resize: resize, postLoad: postImageLoad, fps:60 });

    return {
      newGameState: newGameState,
      startPlayback: startPlayback,
      makeExplosion: makeExplosion
    }
})();


