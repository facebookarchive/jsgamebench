FB.provide('ImageCache', {
  version: '0.7',
  _cache: {},

  init: function() {
    if (localStorage['version'] != this.version) {
      localStorage.clear();
      localStorage['version'] = this.version;
    }
  },

  getCache: function(src, width, height, angle) {
    var twoPi = Math.PI + Math.PI;
    // Normalize angle in radian first
    angle = angle === undefined ? 0 : ((angle % twoPi) + twoPi) % twoPi;
    var degree = Math.round(angle * 180 / Math.PI);
    var k = width + ',' + height + ',' + degree + src;
    var boxKey = 'box' + k;
    data = this._cache[k];

    if (!data) {
      data = {
        url: localStorage[k]
      };
      if (data.url) {
        data.box = JSON.parse(localStorage[boxKey]);
      } else {
        data = this._getRotatedImage(src, width, height, angle, degree);
        if (data) {
          localStorage[k] = data.url;
          localStorage[boxKey] = JSON.stringify(data.box);
        }
      } 
      this._cache[k] = data;
    }

    return data;
  },

  _getRotatedImage: function(src, width, height, angle, degree) {
    var cos = Math.cos(angle),
    sin = Math.sin(angle);
    
    var box ={w: Math.abs(width * cos) + Math.abs(height * sin),
              h: Math.abs(width * sin) + Math.abs(height * cos)};
    var ctx = this._getCtx(box.w, box.h);
    var image = new Image();
    image.src = src;
    if (!image.complete) {
      return null;
    }
    var dx=0, dy=0;
    if (degree >= 0 && degree < 90) {
      dx = height * sin;
    } else if (degree < 180) {
      dx = box.w;
      dy = - height * cos;
    } else if (degree < 270) {
      dx = - width * cos;
      dy = box.h;
    } else {
      dy = - width * sin;
    }

    ctx.translate(dx, dy);
    ctx.rotate(angle);
    ctx.drawImage(image, 0, 0, width, height);
    
    return {
      box: box,
      url: this._canvas.toDataURL()
    };
  },

  _getCtx: function(width, height) {
    if (!this._canvas) {
      this._canvas = document.createElement("canvas");
      this._ctx = this._canvas.getContext('2d');
    }

    this._canvas.setAttribute('width', width);
    this._canvas.setAttribute('height', height);

    return this._ctx;
  }

  
});

FB.ImageCache.init();