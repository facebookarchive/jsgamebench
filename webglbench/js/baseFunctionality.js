
function init() {
    var canvas = document.getElementById("frontBuf");
    try {
      gl = canvas.getContext("experimental-webgl");
    } catch (e) {}
}
