function test() {
  localStorage.clear();
  var a = 30;
  for (var i=0; i < 4; i++) {
    var rad = (a + 90 * i) * Math.PI / 180;
    var image = FB.$('test_image' + i);
    image.src = FB.ImageCache.getCache('http://localhost:8081/images/wooden_block_horizontal.png', 205, 22, rad);

  }
}