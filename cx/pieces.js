var Pieces = (function() {

    var pieces = [];
    var selected = false;
    var selsquare = null;

    function init() {
      for (var i=0;i<32;i++) {
        var ok = false;
        var square;
        var pos;
        while (!ok) {
          pos = Board.nearestSquare(Math.random()*JSGlobal.winsize[0],Math.random()*JSGlobal.winsize[1]);
          square = Board.getSquare(pos[0],pos[1]);
          if (!square.piece)
            ok = true;
        }
        var piece = Gob.add(Utils.uuidv4(), 'bouncing_pirate', 0, [square.left+square.delta*0.5,square.top+square.delta*0.5], [0,0], 10, 1);
        Board.setPiece(pos[0],pos[1],piece);
      }
    }

    function tick() {
    }

    function select(x,y) {
      var pos = Board.nearestSquare(x,y);
      var square = Board.getSquare(pos[0],pos[1]);
      if (!selected) {
        if (square.piece) {
          selected = square.piece;
          square.piece.scale = 2;
          square.piece.dirty = true;
          selsquare = square;
        }
      } else {
        if (!square.piece) {
          selected.scale = 1;
          selected.dirty = true;
          selsquare.piece = false;
          selected.pos = [square.left+square.delta*0.5,square.top+square.delta*0.5];
          square.piece = selected;
          selected = false;
        }
      }
    }

    var Pieces = {};
    Pieces.init = init;
    Pieces.tick = tick;
    Pieces.select = select;
    return Pieces;
  })();
