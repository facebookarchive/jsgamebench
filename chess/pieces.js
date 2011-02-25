var Pieces = (function() {

    var nameToIdx = {};
    var idxToName = {};
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

    function setNewPositions(positions) {
      for(var i in positions) {
        var x = i % 8;
        var y = (i / 8)|0;
        var name = idxToName[positions[i]];
        square = Board.getSquare(x,y);
        square.piece = Gob.add(Utils.uuidv4(), name, 0, [square.left+square.delta*0.5,square.top+square.delta*0.5], [0,0], 10, default_scale);
      }
    }

    function addPieceGob(square, type, color) {
      var sprite;
      switch(type) {
        case Pawn:
          sprite = color == White ? "Pirate_Pawn" : "Pirate_Pawn_Gray";
          break;
        case Rook:
          sprite = color == White ? "Pirate_Rook" : "Pirate_Rook_Gray";
          break;
        case Knight:
          sprite = color == White ? "Pirate_Knight" : "Pirate_Knight_Gray";
          break;
        case Bishop:
          sprite = color == White ? "Pirate_Bishop" : "Pirate_Bishop_Gray";
          break;
        case Queen:
          sprite = color == White ? "Pirate_Queen" : "Pirate_Queen_Gray";
          break;
        case King:
          sprite = color == White ? "Pirate_King" : "Pirate_King_Gray";
          break;
      }
      square.piece = Gob.add(Utils.uuidv4(), sprite, 0, [square.left+square.delta*0.5,square.top+square.delta*0.5], [0,0], 10, default_scale);
      sqaure.piece.type = type;
      sqaure.piece.color = color;
    }

    function init() {
      Gob.delAll();
      var square, sprite;
      for (var i=0,len=setup.length;i<len;i++) {
        var piece = setup[i];
        square = Board.getSquare(piece[2],piece[3]);
        addPieceGob(square, piece[0], piece[1]);
      }
    }

    function resetBoardGobs() {
      Gob.delAll();
      for (var i=0;i<8;i++) {
        for (var j=0;j<8;j++) {
          var square = Board.getSquare(i,j);
          if (square && square.piece) {
            addPieceGob(square, square.piece.type, square.piece.color);
          }
        }
      }
    }

    function setNameToIdx(name,idx) {
      nameToIdx[name] = idx;
      idxToName[idx] = name;
    }

    function dumpBoard() {
      var square, pieces = [];
      for (var i=0;i<8;i++) {
        for (var j=0;j<8;j++) {
          square = Board.getSquare(i,j);
          if (square.piece) {
            pieces.push([square.piece.type,square.piece.color,i,j]);
          }
        }
      }
    }

    function tick() {
    }

    var possible_move = false;

    function tryMove(x,y,color,move,capture) {
      if (x >= 0 && x < 8) {
        if (y >= 0 && y < 8) {
          var square = Board.getSquare(x,y);
          if ((move && !square.piece) || (capture && square.piece && square.piece.color != color)) {
            possible_move = true;
            square.bright = true;
            return true;
          }
        }
      }
      return false;
    }

    function possibleMoves(x,y,piece) {
      var color = piece.color;
      var dir = -1;
      if (color == Black) {
        dir = 1;
      }
      possible_move = false;
      switch(piece.type) {
        case Pawn:
          if (tryMove(x,y+dir,color,true,false)) {
            if ((color == White && y == 6) || (y == 1))
              tryMove(x,y+2*dir,color,true,false);
          }
          tryMove(x-1,y+dir,color,false,true);
          tryMove(x+1,y+dir,color,false,true);
          break;
        case Rook:
          var open = true;
          var step = 1;
          while(open) {
            tryMove(x+step*dir,y,color,true,true);
            open = tryMove(x+step*dir,y,color,true,false);
            step++;
          }
          open = true;
          step = 1;
          while(open) {
            tryMove(x-step*dir,y,color,true,true);
            open = tryMove(x-step*dir,y,color,true,false);
            step++;
          }
          open = true;
          step = 1;
          while(open) {
            tryMove(x,y+step*dir,color,true,true);
            open = tryMove(x,y+step*dir,color,true,false);
            step++;
          }
          open = true;
          step = 1;
          while(open) {
            tryMove(x,y-step*dir,color,true,true);
            open = tryMove(x,y-step*dir,color,true,false);
            step++;
          }
          break;
        case Bishop:
          var open = true;
          var step = 1;
          while(open) {
            tryMove(x+step*dir,y+step*dir,color,true,true);
            open = tryMove(x+step*dir,y+step*dir,color,true,false);
            step++;
          }
          open = true;
          step = 1;
          while(open) {
            tryMove(x-step*dir,y-step*dir,color,true,true);
            open = tryMove(x-step*dir,y-step*dir,color,true,false);
            step++;
          }
          open = true;
          step = 1;
          while(open) {
            tryMove(x+step*dir,y-step*dir,color,true,true);
            open = tryMove(x+step*dir,y-step*dir,color,true,false);
            step++;
          }
          open = true;
          step = 1;
          while(open) {
            tryMove(x-step*dir,y+step*dir,color,true,true);
            open = tryMove(x-step*dir,y+step*dir,color,true,false);
            step++;
          }
          break;
        case Queen:
          var open = true;
          var step = 1;
          while(open) {
            tryMove(x+step*dir,y+step*dir,color,true,true);
            open = tryMove(x+step*dir,y+step*dir,color,true,false);
            step++;
          }
          open = true;
          step = 1;
          while(open) {
            tryMove(x-step*dir,y-step*dir,color,true,true);
            open = tryMove(x-step*dir,y-step*dir,color,true,false);
            step++;
          }
          open = true;
          step = 1;
          while(open) {
            tryMove(x+step*dir,y-step*dir,color,true,true);
            open = tryMove(x+step*dir,y-step*dir,color,true,false);
            step++;
          }
          open = true;
          step = 1;
          while(open) {
            tryMove(x-step*dir,y+step*dir,color,true,true);
            open = tryMove(x-step*dir,y+step*dir,color,true,false);
            step++;
          }
          open = true;
          step = 1;
          while(open) {
            tryMove(x+step*dir,y,color,true,true);
            open = tryMove(x+step*dir,y,color,true,false);
            step++;
          }
          open = true;
          step = 1;
          while(open) {
            tryMove(x-step*dir,y,color,true,true);
            open = tryMove(x-step*dir,y,color,true,false);
            step++;
          }
          open = true;
          step = 1;
          while(open) {
            tryMove(x,y+step*dir,color,true,true);
            open = tryMove(x,y+step*dir,color,true,false);
            step++;
          }
          open = true;
          step = 1;
          while(open) {
            tryMove(x,y-step*dir,color,true,true);
            open = tryMove(x,y-step*dir,color,true,false);
            step++;
          }
          break;
        case King:
          tryMove(x,y+1,color,true,true);
          tryMove(x+1,y+1,color,true,true);
          tryMove(x+1,y,color,true,true);
          tryMove(x+1,y-1,color,true,true);
          tryMove(x,y-1,color,true,true);
          tryMove(x-1,y-1,color,true,true);
          tryMove(x-1,y,color,true,true);
          tryMove(x-1,y+1,color,true,true);
          break;
        case Knight:
          tryMove(x+1,y+2,color,true,true);
          tryMove(x+2,y+1,color,true,true);
          tryMove(x+2,y-1,color,true,true);
          tryMove(x+1,y-2,color,true,true);
          tryMove(x-1,y+2,color,true,true);
          tryMove(x-2,y+1,color,true,true);
          tryMove(x-2,y-1,color,true,true);
          tryMove(x-1,y-2,color,true,true);
          break;
      }
      return possible_move;
    }

    function select(x,y) {
      var pos = Board.nearestSquare(x,y);
      var square = Board.getSquare(pos[0],pos[1]);
      if (!selected) {
        if (square.piece) {
          if (possibleMoves(square.i,square.j,square.piece)) {
            selected = square.piece;
            square.piece.scale = sel_scale;
            square.piece.dirty = true;
            Board.setDirty();
            selsquare = square;
          }
        }
      } else {
        if (square == selsquare) {
          selected.scale = default_scale;
          selected.dirty = true;
          selsquare.piece = false;
          Board.allDark();
          square.piece = selected;
          selected = false;
        }
        else if (square.bright) {
          if (square.piece) {
            Gob.del(square.piece.id);
          }
          selected.scale = default_scale;
          selected.dirty = true;
          selsquare.piece = false;
          Board.allDark();
          selected.pos = [square.left+square.delta*0.5,square.top+square.delta*0.5];
          square.piece = selected;
          selected = false;
        }
      }
    }

    var Pieces = {};
    Pieces.setNewPositions = setNewPositions,
    Pieces.setNameToIdx = setNameToIdx;
    Pieces.init = init;
    Pieces.tick = tick;
    Pieces.select = select;
    Pieces.resetBoardGobs = resetBoardGobs;
    return Pieces;
  })();
