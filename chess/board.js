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

var Board = (function() {
    var dirty = true;

    var board = [];
    var x_border = 20;
    var y_border = 160;
    var delta = 0;
    var width = 0;
    var height = 0;

    var state = [];
    var tomove = 0;
    var move = false;
    var check = false;

    function init(erase) {
      dirty = true;
      width = Browser.winsize[0] - x_border;
      height = Browser.winsize[1] - y_border;

      delta = width < height ? parseInt(width/8) : parseInt(height/8);
      var black = false;
      for (var i=0;i<8;i++) {
        for (var j=0;j<8;j++) {
          var left = parseInt(width*0.5 - 4*delta + i*delta);
          var top = parseInt(height*0.5 - 4*delta + j*delta);
          if (tomove) {
            left = width - left - delta;
            top = height - top - delta;
          }
          left += x_border*0.5;
          top += y_border*0.5;
          var color = black ? "#000" : "#aaa";
          var highlight = black ? "#006" : "#88f";
          var piece = board[i+j*8] && !erase ? board[i+j*8].piece : null;
          black = !black;
          board[i+j*8] = {top:top,left:left,color:color,highlight:highlight,bright:false, piece:piece,delta:delta, i:i, j:j};
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
      var bx = parseInt((x - width*0.5 + 4*delta - x_border*0.5)/delta);
      if (bx < 0) {
        bx = 0;
        offboard = true;
      } else if (bx > 7) {
        bx = 7;
        offboard = true;
      }
      var by = parseInt((y - height*0.5 + 4*delta - y_border*0.5)/delta);
      if (by < 0) {
        by = 0;
        offboard = true;
      } else if (by > 7) {
        by = 7;
        offboard = true;
      }
      if (tomove) {
        bx = 7 - bx;
        by = 7 - by;
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

    function toMove() {
      return tomove;
    }

    function inCheck() {
      return check;
    }

    function setCheck(c) {
      check = c;
    }

    function dumpBoard() {
      var pieces = [];
      for (var i=0;i<8;i++) {
        for (var j=0;j<8;j++) {
          var square = board[i+8*j];
          if (square.piece) {
            pieces.push(i+8*j);
            pieces.push(square.piece.type*6+square.piece.color);
          }
        }
      }
      return pieces;
    }

    function dumpBoard() {
      var pieces = [];
      for (var i=0;i<8;i++) {
        for (var j=0;j<8;j++) {
          var square = board[i+8*j];
          if (square.piece) {
            pieces.push(i+8*j);
            pieces.push(square.piece.type*6+square.piece.color);
          }
        }
      }
      return pieces;
    }

    function makeMove(os,ns,piece) {
      piece.move = ++move;
      state.push({board: dumpBoard(), piece:piece.type, from: [os.i,os.j], to: [ns.i,ns.j], capture: ns.piece ? true : false});
      tomove = !tomove;
    }

    function getStateHTML() {
      var markup = tomove ? "Black's Move<br />" : "White's Move<br />";
      var gamemove = 1;
      for (var i=0;i<state.length;i += 2) {
        var s = state[i];
        markup += gamemove + ": " + PieceNames[s.piece] + " (" + FileNames[s.from[0]] + RankNames[s.from[1]] + (s.capture ? "x" : "-") + FileNames[s.to[0]] + RankNames[s.to[1]] + ") ";
        if (i + 1 < state.length) {
          s = state[i+1];
          markup += PieceNames[s.piece] + " (" + FileNames[s.from[0]] + RankNames[s.from[1]] + (s.capture ? "x" : "-") + FileNames[s.to[0]] + RankNames[s.to[1]] + ")<br />";
        } else {
          markup += "...<br />";
        }
        gamemove++;
      }
      return markup;
    }

    function getState() {
      var last = state[state.length - 1];
      var from = last.from[0]+8*last.from[1];
      var to = last.to[0]+8*last.to[1];
      var packed = [last.board,[from,to],tomove];
      return packed;
    }

    function initState(board, settomove) {
      move = 0;
      tomove = settomove || false;
      state = [];
      Board.init(true);
      Pieces.init(board);
    }

    function loadState(reqstate) {
      var board = [];
      var x,y;
      for (var i=0;i<reqstate[0].length;i += 2) {
        var pos = reqstate[0][i];
        x = pos % 8;
        y = (pos / 8) | 0;
        var ct = reqstate[0][i+1];
        var type = (ct / 6) | 0;
        var color = ct % 6;
        board.push([type,color,x,y]);
      }
      initState(board, reqstate[2]);
      x = reqstate[1][0] % 8;
      y = (reqstate[1][0] / 8) | 0;
      var os = getSquare(x,y);
      x = reqstate[1][1] % 8;
      y = (reqstate[1][1] / 8) | 0;
      var ns = getSquare(x,y);
      ++move;
      state.push({board: dumpBoard(), piece:os.piece.type, from: [os.i,os.j], to: [ns.i,ns.j], capture: ns.piece ? true : false});
      Pieces.resetBoardGobs();
    }

    function setState(m) {
      if (m <= move) {
        for (var i=0;i<m;i++) {
          var s = state[i];
          var os = getSquare(s.from[0],s.from[1]);
          var ns = getSquare(s.to[0],s.to[1]);
          Pieces.setMoveTarget(os,ns,1000);
        }
      }
    }

    function getMove() {
      return move;
    }

    function undoMove() {
      var board = [];
      var last = state[state.length - 1].board;
      var x,y;
      for (var i=0;i<last.length;i += 2) {
        var pos = last[i];
        x = pos % 8;
        y = (pos / 8) | 0;
        var ct = last[i+1];
        var type = (ct / 6) | 0;
        var color = ct % 6;
        board.push([type,color,x,y]);
      }
      state.pop();
      move--;
      tomove = !tomove;
      initState(board, tomove);
      Chess.newGameState('playing');
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
    Board.toMove = toMove;
    Board.getMove = getMove;
    Board.makeMove = makeMove;
    Board.getStateHTML = getStateHTML;
    Board.getState = getState;
    Board.setState = setState;
    Board.loadState = loadState;
    Board.initState = initState;
    Board.inCheck = inCheck;
    Board.setCheck = setCheck;
    Board.undoMove = undoMove;
    return Board;
  })();
