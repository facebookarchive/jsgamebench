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

var SpriteLoad = (function() {

    function perfShip(spritesheet) {
      if (spritesheet) {
        Sprites.add('ship', {url: '/images/ship_fbmark.png', frames: 2,
              framepos: [[0, 0], [1, 0]],
              width: 128, height: 128});
      } else {
        Sprites.add('ship0', {url: '/images/ship/Test_Ship_Thrust_Frame1_128_00018.png', frames: 2,
              framepos: [[0, 0]],
              width: 128, height: 128});
        Sprites.add('ship1', {url: '/images/ship/Test_Ship_Thrust_Frame2_128_00018.png', frames: 2,
              framepos: [[0, 0]],
              width: 128, height: 128});
      }
    }

    function ship(spritesheet) {
        Sprites.add('ship_idle', {url: '/images/ship/Test_Ship_Idle_64_00018.png', frames: 1,
              framepos: [[0, 0]],
              width: 128, height: 128});
        Sprites.add('ship_f1', {url: '/images/ship/Test_Ship_Thrust_Frame1_64_00018.png', frames: 1,
              framepos: [[0, 0]],
              width: 128, height: 128});
        Sprites.add('ship_f2', {url: '/images/ship/Test_Ship_Thrust_Frame2_64_00018.png', frames: 1,
              framepos: [[0, 0]],
              width: 128, height: 128});
    }

    function perfRock(spritesheet, no_anim) {
      if (spritesheet) {
        Sprites.add('rock', {url: '/images/asteroid.png', frames: 60,
              framepos: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0],
                         [0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1],
                         [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [7, 2],
                         [0, 3], [1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [6, 3], [7, 3],
                         [0, 4], [1, 4], [2, 4], [3, 4], [4, 4], [5, 4], [6, 4], [7, 4],
                         [0, 5], [1, 5], [2, 5], [3, 5], [4, 5], [5, 5], [6, 5], [7, 5],
                         [0, 6], [1, 6], [2, 6], [3, 6], [4, 6], [5, 6], [6, 6], [7, 6],
                         [0, 7], [1, 7], [2, 7], [3, 7]],
              width: 128, height: 128, no_anim: no_anim});

      } else {
        for (var i=0;i<60;i++) {
          Sprites.add('rock'+i, {url: '/images/asteroid/Test_Asteroid_128_000'+(i<10?'0'+i:i)+'.png', frames: 60,
                framepos: [[0, 0]],
                width: 128, height: 128, no_anim: no_anim});
        }

      }
    }

    function rock(spritesheet, no_anim) {
      if (spritesheet) {
        Sprites.add('rock', {url: '/images/asteroid_half.png', frames: 60,
              framepos: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0],
                         [0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1],
                         [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [7, 2],
                         [0, 3], [1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [6, 3], [7, 3],
                         [0, 4], [1, 4], [2, 4], [3, 4], [4, 4], [5, 4], [6, 4], [7, 4],
                         [0, 5], [1, 5], [2, 5], [3, 5], [4, 5], [5, 5], [6, 5], [7, 5],
                         [0, 6], [1, 6], [2, 6], [3, 6], [4, 6], [5, 6], [6, 6], [7, 6],
                         [0, 7], [1, 7], [2, 7], [3, 7]],
              width: 64, height: 64, no_anim: no_anim});

      } else {
        for (var i=0;i<60;i += 2) {
          var s = i/2;
          Sprites.add('rock'+s, {url: '/images/asteroid/Test_Asteroid_64_000'+(i<10?'0'+i:i)+'.png', frames: 30,
                framepos: [[0, 0]],
                width: 64, height: 64, no_anim: no_anim});
        }

      }
    }

    function perfBoom(spritesheet, no_anim) {
      if (spritesheet) {
        Sprites.add('boom', {url: '/images/explosion_half.png', frames: 59,
              framepos: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0],
                         [0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1],
                         [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [7, 2],
                         [0, 3], [1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [6, 3], [7, 3],
                         [0, 4], [1, 4], [2, 4], [3, 4], [4, 4], [5, 4], [6, 4], [7, 4],
                         [0, 5], [1, 5], [2, 5], [3, 5], [4, 5], [5, 5], [6, 5], [7, 5],
                         [0, 6], [1, 6], [2, 6], [3, 6], [4, 6], [5, 6], [6, 6], [7, 6],
                         [0, 7], [1, 7], [2, 7]],
              width: 128, height: 128, no_anim: no_anim});
      } else {
        for (var i=6;i<59;i++) {
          var s = i-6;
          Sprites.add('boom'+s, {url: '/images/explosion/Test_Explosion_0000'+(i<10?'0'+i:i)+'.png', frames: 53,
                framepos: [[0, 0]],
                width: 256, height: 256, no_anim: no_anim});
        }

      }
    }

    function boom(spritesheet, no_anim) {
      if (spritesheet) {
        Sprites.add('boom', {url: '/images/explosion.png', frames: 59,
              framepos: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0],
                         [0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1],
                         [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [7, 2],
                         [0, 3], [1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [6, 3], [7, 3],
                         [0, 4], [1, 4], [2, 4], [3, 4], [4, 4], [5, 4], [6, 4], [7, 4],
                         [0, 5], [1, 5], [2, 5], [3, 5], [4, 5], [5, 5], [6, 5], [7, 5],
                         [0, 6], [1, 6], [2, 6], [3, 6], [4, 6], [5, 6], [6, 6], [7, 6],
                         [0, 7], [1, 7], [2, 7]],
              width: 256, height: 256, no_anim: no_anim});
      } else {
        for (var i=6;i<59;i += 2) {
          var s = (i-6)/2;
          Sprites.add('boom'+s, {url: '/images/explosion/Test_Explosion_64_0000'+(i<10?'0'+i:i)+'.png', frames: 26,
                framepos: [[0, 0]],
                width: 64, height: 64, no_anim: no_anim});
        }

      }
    }

    function perfPowerup(spritesheet, no_anim) {
      if (spritesheet) {
        Sprites.add('powerup', {url: '/images/powerup.png', frames: 40,
              framepos: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0],
                         [0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1],
                         [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [7, 2],
                         [0, 3], [1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [6, 3], [7, 3],
                         [0, 4], [1, 4], [2, 4], [3, 4], [4, 4], [5, 4], [6, 4], [7, 4]],
              width: 64, height: 64, no_anim: no_anim});
      } else {
        for (var i=0;i<40;i++) {
          Sprites.add('powerup'+i, {url: '/images/powerup/Test_Powerup_Star_64_0000'+(i<10?'0'+i:i)+'.png', frames: 40,
                framepos: [[0, 0]],
                width: 64, height: 64, no_anim: no_anim});
        }
      }
    }

    function powerup(spritesheet, no_anim) {
      if (spritesheet) {
        Sprites.add('powerup', {url: '/images/powerup.png', frames: 20,
              framepos: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0],
                         [0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1],
                         [0, 2], [1, 2], [2, 2], [3, 2]],
              width: 64, height: 64, no_anim: no_anim});
      } else {
        for (var i=0;i<20;i++) {
          Sprites.add('powerup'+i, {url: '/images/powerup/Test_Powerup_Star_32_0000'+(i<10?'0'+i:i)+'.png', frames: 20,
                framepos: [[0, 0]],
                width: 32, height: 32, no_anim: no_anim});
        }
      }
    }

    function shot(spritesheet) {
      Sprites.add('shot', {url: '/images/shot.png', frames: 8,
        framepos: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0]],
        width: 64, height: 64});
    }


    var SpriteLoad = {};
    SpriteLoad.perfShip = perfShip;
    SpriteLoad.ship = ship;
    SpriteLoad.rock = rock;
    SpriteLoad.boom = boom;
    SpriteLoad.powerup = powerup;
    SpriteLoad.shot = shot;
    return SpriteLoad;
  })();
