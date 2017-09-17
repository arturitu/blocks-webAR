// https://github.com/archilogic-com/aframe-gblock/blob/master/src/gblock.js

// const fsBase64 = require('./GBlockShaders/fragment-shader.glsl');
// const vsBase64 = require('./GBlockShaders/vector-shader.glsl');
// const glslify = require('glslify');
// const vsBase64 = glslify('./GBlockShaders/vector-shader.glsl');
// const fsBase64 = glslify('./GBlockShaders/fragment-shader.glsl');

function GBlockLoader () {

  THREE.GLTFLoader.call(this);
  THREE.GLTFLoader.prototype.crossOrigin = 'anonymous';
  var self = this

  this._parse = this.parse
  this.parse = function (data, path, onLoad, onError) {
    // convert uint8 to json
    var json = JSON.parse(convertUint8ArrayToString(data))
    // use base64 shaders
    Object.keys(json.shaders).forEach(function (key, i) {
      // if (key.indexOf('fragment') > -1) json.shaders[key].uri = 'https://eb8878c6.ngrok.io/js/GBlockShaders/fragment-shader.glsl'
      // else if (key.indexOf('vertex') > -1) json.shaders[key].uri = 'https://eb8878c6.ngrok.io/js/GBlockShaders/vector-shader.glsl'
      if (key.indexOf('fragment') > -1) json.shaders[key].uri = 'https://unboring.net/lab/blocks-webAR/js/GBlockShaders/fragment-shader.glsl'
      else if (key.indexOf('vertex') > -1) json.shaders[key].uri = 'https://unboring.net/lab/blocks-webAR/js/GBlockShaders/vector-shader.glsl'
    })
    // convert json to uint;
    var uint8array = new TextEncoder('utf-8').encode(JSON.stringify(json))
    // parse data
    self._parse.call(self, uint8array, path, onLoad, onError)
  }

}
GBlockLoader.prototype = THREE.GLTFLoader.prototype;

// from https://github.com/mrdoob/three.js/blob/master/examples/js/loaders/GLTFLoader.js
function convertUint8ArrayToString (array) {
  if (window.TextDecoder !== undefined) {
    return new TextDecoder().decode(array);
  }
  // Avoid the String.fromCharCode.apply(null, array) shortcut, which
  // throws a "maximum call stack size exceeded" error for large arrays.
  var s = '';
  for (var i = 0, il = array.length; i < il; i++) {
    s += String.fromCharCode(array[i]);
  }
  return s;
}

module.exports = GBlockLoader;