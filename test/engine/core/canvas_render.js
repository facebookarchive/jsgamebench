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

var CanvasRender = (function() {
    var ctx, bctx, parel, canvasel, bgel, cwidth, cheight, first, fdtctx;

    function init(pid,width,height,pixelwidth,pixelheight) {
      parel = document.getElementById(pid);
      cwidth = pixelwidth;
      cheight = pixelheight;

      parel.innerHTML += '<canvas id="gcbg" width="' + pixelwidth + '" height="' +
        pixelheight + '" style="position:absolute;left:0px;top:0px;width:' + width + 'px;height:' + height + 'px;"></canvas>';
      parel.innerHTML += '<canvas id="gamecanvas" width="' + pixelwidth + '" height="' +
        pixelheight + '" style="position:absolute;left:0px,top:0px;width:' + width + 'px;height:' + height + 'px;"></canvas>';
      bgel = document.getElementById('gcbg');
      bctx = bgel.getContext('2d');
      canvasel = document.getElementById('gamecanvas');
      ctx = canvasel.getContext('2d');
    }

    function initFDT() {
      var el = document.getElementById('framedraw');
      if (!el) {
        el = document.createElement('canvas');
        el.id = "framedraw";
        el.width = 1;
        el.height = 1;
        document.body.appendChild(el);
      }
      fdtctx = el.getContext('2d');
    }

    function setFDT(number) {
      if (fdtctx) {
        fdtctx.fillStyle = "#" + number;
        fdtctx.fillRect(0,0,1,1);
      }
    }

    function readFDT() {
      if (fdtctx) {
        var data = fdtctx.getImageData(0,0,1,1);
        var value = data.data[0]*256*256+data.data[1]*256+data.data[2];
      }
      return value;
    }

    function clear() {
      ctx.clearRect(0, 0, cwidth, cheight);
      if (GameFrame.settings.canvas_background && World.dirty) {
        bctx.clearRect(0, 0, cwidth, cheight);
      }
      first = true;
    }

    function bgdraw(framedata) {
      bctx.drawImage(framedata.image, framedata.x, framedata.y, framedata.size[0],
                               framedata.size[1], framedata.pos[0], framedata.pos[1],
                               framedata.size[0], framedata.size[1]);
    }

    function bg2fg() {
      ctx.drawImage(bctx.canvas, 0, 0, cwidth, cheight, 0, 0, cwidth, cheight);
    }

    function draw(framedata) {
      if (first || framedata.theta || framedata.scale != 1.0) {
        first = false;
        var ct = Math.cos(framedata.theta);
        var st = Math.sin(framedata.theta);
        var nst = -st;
        ctx.transform(ct + 0.000001, st, nst, ct + 0.000001, (framedata.pos[0]+framedata.size[0]*0.5)|0, (framedata.pos[1]+framedata.size[1]*0.5)|0);
//        ctx.transform(ct, st, nst, ct, framedata.pos[0], framedata.pos[1]);
        ctx.drawImage(framedata.image, framedata.x | 0, framedata.y | 0, framedata.size[0],
                      framedata.size[1], (-framedata.size[0]*0.5*framedata.scale) | 0, (-framedata.size[1]*0.5*framedata.scale) | 0, framedata.size[0]*framedata.scale, framedata.size[1]*framedata.scale);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
      } else {
        ctx.drawImage(framedata.image, framedata.x, framedata.y, framedata.size[0],
                    framedata.size[1], framedata.pos[0], framedata.pos[1],
                      framedata.size[0]*framedata.scale, framedata.size[1]*framedata.scale);
      }

    }

    var CanvasRender = {};
    CanvasRender.init = init;
    CanvasRender.clear = clear;
    CanvasRender.draw = draw;
    CanvasRender.bgdraw = bgdraw;
    CanvasRender.bg2fg = bg2fg;
    CanvasRender.initFDT = initFDT;
    CanvasRender.setFDT = setFDT;
    CanvasRender.readFDT = readFDT;
    return CanvasRender;
  })();
