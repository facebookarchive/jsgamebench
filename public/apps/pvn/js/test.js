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

function test() {
  localStorage.clear();
  var a = 30;
  for (var i=0; i < 4; i++) {
    var rad = (a + 90 * i) * Math.PI / 180;
    var image = FB.$('test_image' + i);
    image.src = FB.ImageCache.getCache('http://localhost:8081/images/wooden_block_horizontal.png', 205, 22, rad);

  }
}