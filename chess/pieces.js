var Pieces = (function() {

    var nameToIdx = {};
    var idxToName = {};
    var pieces = [];
    var selected = false;
    var selsquare = null;
    var default_scale = 0.7;
    var sel_scale = 1;

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

    function addPieceGob(square, type, color, move) {
      var sprite;
      switch(type) {
        case Pawn:
          sprite = color == White ? "Pirate_Pawn" : "Ninja_Pawn";
          break;
        case Rook:
          sprite = color == White ? "Pirate_Rook" : "Ninja_Rook";
          break;
        case Knight:
          sprite = color == White ? "Pirate_Knight" : "Ninja_Knight";
          break;
        case Bishop:
          sprite = color == White ? "Pirate_Bishop" : "Ninja_Bishop";
          break;
        case Queen:
          sprite = color == White ? "Pirate_Queen" : "Ninja_Queen";
          break;
        case King:
          sprite = color == White ? "Pirate_King" : "Ninja_King";
          break;
      }
      square.piece = Gob.add(Utils.uuidv4(), sprite, 0, [square.left+square.delta*0.5,square.top+square.delta*0.5], [0,0], 10, default_scale*square.delta/piecescales[type]);
      square.piece.type = type;
      square.piece.color = color;
      square.piece.move = move;
    }

    function init(positions) {
      selected = false;
      selsquare = null;
      Gob.delAll();
      if (!positions)
        positions = setup;
      var square, sprite;
      for (var i=0,len=positions.length;i<len;i++) {
        var piece = positions[i];
        square = Board.getSquare(piece[2],piece[3]);
        addPieceGob(square, piece[0], piece[1], 0);
      }
    }

    function resetBoardGobs() {
      Gob.delAll();
      for (var i=0;i<8;i++) {
        for (var j=0;j<8;j++) {
          var square = Board.getSquare(i,j);
          if (square && square.piece) {
            addPieceGob(square, square.piece.type, square.piece.color, square.piece.move);
          }
        }
      }
    }

    function tick() {
    }

    var possible_move = false;
    var possible_check = false;

    function checkCheck(color) {
      possible_check = false;
      for (var i=0;i<8;i++) {
        for (var j=0;j<8;j++) {
          var square = Board.getSquare(i,j);
          if (square.piece && square.piece.color != color) {
            if (possibleMoves(i,j,square.piece,true))
              return true;
          }
        }
      }
      return false;
    }

    function tryMove(ox,oy,nx,ny,color,move,capture,testcheck) {
      if (nx >= 0 && nx < 8) {
        if (ny >= 0 && ny < 8) {
          var square = Board.getSquare(nx,ny);
          var osquare = Board.getSquare(ox,oy);
          if (testcheck) {
            if (capture && square.piece && square.piece.color != color && square.piece.type == King) {
              possible_check = true;
              return false;
            } else if (move && !square.piece) {
              return true;
            }
          } else {
            if ((move && !square.piece) || (capture && square.piece && square.piece.color != color)) {
              var tmp = square.piece;
              square.piece = osquare.piece;
              osquare.piece = null;
              var check = checkCheck(color);
              osquare.piece = square.piece;
              square.piece = tmp;
              if (!check) {
                possible_move = true;
                square.bright = true;
                return true;
              }
            }
          }
        }
      }
      return false;
    }

    function possibleMoves(x,y,piece,testcheck) {
      var color = piece.color;
      var dir = -1;
      if (color == Black) {
        dir = 1;
      }
      if (!testcheck) {
        possible_move = false;
      }
      switch(piece.type) {
        case Pawn:
          if (tryMove(x,y,x,y+dir,color,true,false,testcheck)) {
            if ((color == White && y == 6) || (y == 1))
              tryMove(x,y,x,y+2*dir,color,true,false,testcheck);
          }
          tryMove(x,y,x-1,y+dir,color,false,true,testcheck);
          tryMove(x,y,x+1,y+dir,color,false,true,testcheck);
          break;
        case Rook:
          var open = true;
          var step = 1;
          while(open) {
            tryMove(x,y,x+step*dir,y,color,true,true,testcheck);
            open = tryMove(x,y,x+step*dir,y,color,true,false,testcheck);
            step++;
          }
          open = true;
          step = 1;
          while(open) {
            tryMove(x,y,x-step*dir,y,color,true,true,testcheck);
            open = tryMove(x,y,x-step*dir,y,color,true,false,testcheck);
            step++;
          }
          open = true;
          step = 1;
          while(open) {
            tryMove(x,y,x,y+step*dir,color,true,true,testcheck);
            open = tryMove(x,y,x,y+step*dir,color,true,false,testcheck);
            step++;
          }
          open = true;
          step = 1;
          while(open) {
            tryMove(x,y,x,y-step*dir,color,true,true,testcheck);
            open = tryMove(x,y,x,y-step*dir,color,true,false,testcheck);
            step++;
          }
          break;
        case Bishop:
          var open = true;
          var step = 1;
          while(open) {
            tryMove(x,y,x+step*dir,y+step*dir,color,true,true,testcheck);
            open = tryMove(x,y,x+step*dir,y+step*dir,color,true,false,testcheck);
            step++;
          }
          open = true;
          step = 1;
          while(open) {
            tryMove(x,y,x-step*dir,y-step*dir,color,true,true,testcheck);
            open = tryMove(x,y,x-step*dir,y-step*dir,color,true,false,testcheck);
            step++;
          }
          open = true;
          step = 1;
          while(open) {
            tryMove(x,y,x+step*dir,y-step*dir,color,true,true,testcheck);
            open = tryMove(x,y,x+step*dir,y-step*dir,color,true,false,testcheck);
            step++;
          }
          open = true;
          step = 1;
          while(open) {
            tryMove(x,y,x-step*dir,y+step*dir,color,true,true,testcheck);
            open = tryMove(x,y,x-step*dir,y+step*dir,color,true,false,testcheck);
            step++;
          }
          break;
        case Queen:
          var open = true;
          var step = 1;
          while(open) {
            tryMove(x,y,x+step*dir,y+step*dir,color,true,true,testcheck);
            open = tryMove(x,y,x+step*dir,y+step*dir,color,true,false,testcheck);
            step++;
          }
          open = true;
          step = 1;
          while(open) {
            tryMove(x,y,x-step*dir,y-step*dir,color,true,true,testcheck);
            open = tryMove(x,y,x-step*dir,y-step*dir,color,true,false,testcheck);
            step++;
          }
          open = true;
          step = 1;
          while(open) {
            tryMove(x,y,x+step*dir,y-step*dir,color,true,true,testcheck);
            open = tryMove(x,y,x+step*dir,y-step*dir,color,true,false,testcheck);
            step++;
          }
          open = true;
          step = 1;
          while(open) {
            tryMove(x,y,x-step*dir,y+step*dir,color,true,true,testcheck);
            open = tryMove(x,y,x-step*dir,y+step*dir,color,true,false,testcheck);
            step++;
          }
          open = true;
          step = 1;
          while(open) {
            tryMove(x,y,x+step*dir,y,color,true,true,testcheck);
            open = tryMove(x,y,x+step*dir,y,color,true,false,testcheck);
            step++;
          }
          open = true;
          step = 1;
          while(open) {
            tryMove(x,y,x-step*dir,y,color,true,true,testcheck);
            open = tryMove(x,y,x-step*dir,y,color,true,false,testcheck);
            step++;
          }
          open = true;
          step = 1;
          while(open) {
            tryMove(x,y,x,y+step*dir,color,true,true,testcheck);
            open = tryMove(x,y,x,y+step*dir,color,true,false,testcheck);
            step++;
          }
          open = true;
          step = 1;
          while(open) {
            tryMove(x,y,x,y-step*dir,color,true,true,testcheck);
            open = tryMove(x,y,x,y-step*dir,color,true,false,testcheck);
            step++;
          }
          break;
        case King:
          tryMove(x,y,x,y+1,color,true,true,testcheck);
          tryMove(x,y,x+1,y+1,color,true,true,testcheck);
          tryMove(x,y,x+1,y,color,true,true,testcheck);
          tryMove(x,y,x+1,y-1,color,true,true,testcheck);
          tryMove(x,y,x,y-1,color,true,true,testcheck);
          tryMove(x,y,x-1,y-1,color,true,true,testcheck);
          tryMove(x,y,x-1,y,color,true,true,testcheck);
          tryMove(x,y,x-1,y+1,color,true,true,testcheck);
          break;
        case Knight:
          tryMove(x,y,x+1,y+2,color,true,true,testcheck);
          tryMove(x,y,x+2,y+1,color,true,true,testcheck);
          tryMove(x,y,x+2,y-1,color,true,true,testcheck);
          tryMove(x,y,x+1,y-2,color,true,true,testcheck);
          tryMove(x,y,x-1,y+2,color,true,true,testcheck);
          tryMove(x,y,x-2,y+1,color,true,true,testcheck);
          tryMove(x,y,x-2,y-1,color,true,true,testcheck);
          tryMove(x,y,x-1,y-2,color,true,true,testcheck);
          break;
      }
      if (testcheck) {
        return possible_check;
      } else {
        return possible_move;
      }
    }

    var moving = [];
    var animating = false;
    var animatingcb = null;

    function isAnimating() {
      return animating;
    }

    function setAnimatingCB(cb) {
      animatingcb = cb;
    }

    function setMoveTarget(osquare, nsquare, time) {
      var activemove = {};
      activemove.os = osquare;
      activemove.ns = nsquare;
      activemove.sx = osquare.left + osquare.delta*0.5;
      activemove.sy = osquare.top + osquare.delta*0.5;
      activemove.dx = nsquare.left + nsquare.delta*0.5 - activemove.sx;
      activemove.dy = nsquare.top + nsquare.delta*0.5 - activemove.sy;
      activemove.start = (new Date).getTime();
      activemove.time = time;
      moving.push(activemove);
      animating = true;;
    }

    function updateMove() {
      animating = false;
      var now = (new Date).getTime();
      for (var i=0;i<moving.length;i++) {
        var am = moving[i];
        var delta = now - am.start;
        if (delta > am.time) {
          if (am.ns.piece) {
            Gob.del(am.ns.piece.id);
          }
          am.ns.piece = am.os.piece;
          am.os.piece = null;
          am.ns.piece.pos = [am.ns.left + am.ns.delta*0.5,am.ns.top + am.ns.delta*0.5];
          am.ns.piece.dirty = true;
          moving.splice(i,1);
        } else {
          animating = true;;
          am.os.piece.pos = [am.sx + am.dx*delta/am.time,am.sy + am.dy*delta/am.time];
          am.os.piece.dirty = true;
        }
      }
      if (!animating && animatingcb) {
        animatingcb();
        animatingcb = null;
      }
    }

    function select(x,y) {
      var pos = Board.nearestSquare(x,y);
      var square = Board.getSquare(pos[0],pos[1]);
      if (!selected) {
        if (square.piece && square.piece.color == Board.toMove()) {
          if (possibleMoves(square.i,square.j,square.piece)) {
            selected = square.piece;
            square.piece.scale = sel_scale*square.delta/piecescales[square.piece.type];
            square.piece.dirty = true;
            Board.setDirty();
            selsquare = square;
          }
        }
      } else {
        if (square == selsquare) {
          selected.scale = default_scale*selsquare.delta/piecescales[selected.type];
          selected.dirty = true;
          selsquare.piece = false;
          Board.allDark();
          square.piece = selected;
          selected = false;
        }
        else if (square.bright) {
          Board.makeMove(selsquare, square, selsquare.piece);
          selected.scale = default_scale*selsquare.delta/piecescales[selected.type];
          Board.allDark();
          selected = false;
          setMoveTarget(selsquare, square, 1000);
          setAnimatingCB(Publish.sendMove);
          Chess.newGameState('moved');
        }
      }
    }

    var Pieces = {};
    Pieces.init = init;
    Pieces.tick = tick;
    Pieces.select = select;
    Pieces.resetBoardGobs = resetBoardGobs;
    Pieces.setMoveTarget= setMoveTarget;
    Pieces.updateMove = updateMove;
    Pieces.isAnimating = isAnimating;
    Pieces.setAnimatingCB = setAnimatingCB;
    return Pieces;
  })();
