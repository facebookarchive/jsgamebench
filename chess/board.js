var Board = (function() {
    var dirty = true;

    var board = [];
    var border = 64;
    var delta = 0;
    var width = 0;
    var height = 0;

    function init() {
      width = JSGlobal.winsize[0] - border;
      height = JSGlobal.winsize[1] - border;

      delta = width < height ? parseInt(width/8) : parseInt(height/8);
      var black = false;
      for (var i=0;i<8;i++) {
        for (var j=0;j<8;j++) {
          var left = parseInt(width*0.5 - 4*delta + i*delta)+border*0.5;
          var top = parseInt(height*0.5 - 4*delta + j*delta)+border*0.5;
          var color = black ? "#000" : "#aaa";
          var highlight = black ? "#884" : "#cc8";
          black = !black;
          board[i+j*8] = {top:top,left:left,color:color,highlight:highlight,bright:false, piece:false,delta:delta, i:i, j:j};
        }
        black = !black;
      }
    }

    function tick() {
      if (!dirty)
        return;

      var worldel = document.getElementById('gamebackground');
      worldel.innerHTML = "";
      for (var i=0;i<8;i++) {
        for (var j=0;j<8;j++) {
          var square = board[i+j*8];
          var color = square.bright ? square.highlight : square.color;
          worldel.innerHTML += '<div style="position:absolute;left:'+square.left+'px;top:'+square.top+'px;width:'+delta+'px;height:'+delta+'px;background:'+color+';"></div>'
        }
      }
      dirty = false;
    }

    function nearestSquare(x,y) {
      var offboard = false;
      var bx = parseInt((x - width*0.5 + 4*delta - border*0.5)/delta);
      if (bx < 0) {
        bx = 0;
        offboard = true;
      } else if (bx > 7) {
        bx = 7;
        offboard = true;
      }
      var by = parseInt((y - height*0.5 + 4*delta - border*0.5)/delta);
      if (by < 0) {
        by = 0;
        offboard = true;
      } else if (by > 7) {
        by = 7;
        offboard = true;
      }
      return [bx, by];
    }

    function getSquare(x,y) {
      return board[x+8*y];
    }

    function setPiece(x,y,piece) {
      board[x+8*y].piece = piece;
    }

    function allDark() {
      for (var i=0;i<8;i++) {
        for (var j=0;j<8;j++) {
          board[i+8*j].bright = false;
        }
      }
      setDirty();
    }

    function setDirty() {
      dirty = true;
    }

    var Board = {};
    Board.init = init;
    Board.tick = tick;
    Board.board = board;
    Board.nearestSquare = nearestSquare;
    Board.setPiece = setPiece;
    Board.getSquare = getSquare;
    Board.setDirty = setDirty;
    Board.allDark = allDark;
    return Board;
  })();
