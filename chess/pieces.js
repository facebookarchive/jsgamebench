var Pieces = (function() {

    var pieces = [];
    var selected = false;
    var selsquare = null;

    var default_scale = 0.7;
    var sel_scale = 1;
    var Pawn = 1;
    var Rook = 2;
    var Bishop = 3;
    var Knight = 4;
    var Queen = 5;
    var King = 6;

    var White = 1;
    var Black = 2;

    var setup = [
      [Pawn,White,0,6],
      [Pawn,White,1,6],
      [Pawn,White,2,6],
      [Pawn,White,3,6],
      [Pawn,White,4,6],
      [Pawn,White,5,6],
      [Pawn,White,6,6],
      [Pawn,White,7,6],
      [Rook,White,0,7],
      [Rook,White,7,7],
      [Knight,White,1,7],
      [Knight,White,6,7],
      [Bishop,White,2,7],
      [Bishop,White,5,7],
      [Queen,White,3,7],
      [King,White,4,7],
      [Pawn,Black,0,1],
      [Pawn,Black,1,1],
      [Pawn,Black,2,1],
      [Pawn,Black,3,1],
      [Pawn,Black,4,1],
      [Pawn,Black,5,1],
      [Pawn,Black,6,1],
      [Pawn,Black,7,1],
      [Rook,Black,0,0],
      [Rook,Black,7,0],
      [Knight,Black,1,0],
      [Knight,Black,6,0],
      [Bishop,Black,2,0],
      [Bishop,Black,5,0],
      [Queen,Black,3,0],
      [King,Black,4,0],
    ];

    function init() {
      var square, sprite;
      for (var i=0,len=setup.length;i<len;i++) {
        var piece = setup[i];

        switch(piece[0]) {
          case Pawn:
            sprite = piece[1] == White ? "Pirate_Pawn" : "Pirate_Pawn_Gray";
            break;
          case Rook:
            sprite = piece[1] == White ? "Pirate_Rook" : "Pirate_Rook_Gray";
            break;
          case Knight:
            sprite = piece[1] == White ? "Pirate_Knight" : "Pirate_Knight_Gray";
            break;
          case Bishop:
            sprite = piece[1] == White ? "Pirate_Bishop" : "Pirate_Bishop_Gray";
            break;
          case Queen:
            sprite = piece[1] == White ? "Pirate_Queen" : "Pirate_Queen_Gray";
            break;
          case King:
            sprite = piece[1] == White ? "Pirate_King" : "Pirate_King_Gray";
            break;
        }
        square = Board.getSquare(piece[2],piece[3]);
        square.piece = Gob.add(Utils.uuidv4(), sprite, 0, [square.left+square.delta*0.5,square.top+square.delta*0.5], [0,0], 10, default_scale);
      }
    }

    function dumpBoard() {
      var square, pieces = [];
      for (var i=0;i<8;i++) {
        for (var j=0;j<8;j++) {
          square = Board.getSquare(i,j);
          if (square.piece) {
            switch(square.piece.spriteid) {
              case "Pirate_Pawn":
                pieces.push([Pawn,White,i,j]);
                break;
              case "Pirate_Pawn_Gray":
                pieces.push([Pawn,Black,i,j]);
                break;
              case "Pirate_Rook":
                pieces.push([Rook,White,i,j]);
                break;
              case "Pirate_Rook_Gray":
                pieces.push([Rook,Black,i,j]);
                break;
              case "Pirate_Knight":
                pieces.push([Knight,White,i,j]);
                break;
              case "Pirate_Knight_Gray":
                pieces.push([Knight,Black,i,j]);
                break;
              case "Pirate_Bishop":
                pieces.push([Bishop,White,i,j]);
                break;
              case "Pirate_Bishop_Gray":
                pieces.push([Bishop,Black,i,j]);
                break;
              case "Pirate_Queen":
                pieces.push([Queen,White,i,j]);
                break;
              case "Pirate_Queen_Gray":
                pieces.push([Queen,Black,i,j]);
                break;
              case "Pirate_King":
                pieces.push([King,White,i,j]);
                break;
              case "Pirate_King_Gray":
                pieces.push([King,Black,i,j]);
                break;
            }
          }
        }
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
          square.piece.scale = sel_scale;
          square.piece.dirty = true;
          selsquare = square;
        }
      } else {
        if (!square.piece) {
          selected.scale = default_scale;
          selected.dirty = true;
          selsquare.piece = false;
          selected.pos = [square.left+square.delta*0.5,square.top+square.delta*0.5];
          square.piece = selected;
          selected = false;
          dumpBoard();
        }
      }
    }

    var Pieces = {};
    Pieces.init = init;
    Pieces.tick = tick;
    Pieces.select = select;
    return Pieces;
  })();
