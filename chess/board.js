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
      var black = true;
      for (var i=0;i<8;i++) {
        for (var j=0;j<8;j++) {
          var left = parseInt(width*0.5 - 4*delta + i*delta)+border*0.5;
          var top = parseInt(height*0.5 - 4*delta + j*delta)+border*0.5;
          var color = black ? "#000" : "#fff";
          black = !black;
          board[i+j*8] = {top:top,left:left,color:color,piece:false,delta:delta};
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
          worldel.innerHTML += '<div style="position:absolute;left:'+square.left+'px;top:'+square.top+'px;width:'+delta+'px;height:'+delta+'px;background:'+square.color+';"></div>'
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

    var Board = {};
    Board.init = init;
    Board.tick = tick;
    Board.board = board;
    Board.nearestSquare = nearestSquare;
    Board.setPiece = setPiece;
    Board.getSquare = getSquare;
    return Board;
  })();
