//  Based on https://github.com/Jam3/three-bmfont-text & https://github.com/Jam3/layout-bmfont-text projects
const createTextGeometry = require('three-bmfont-text');
const buffer = require('three-buffer-vertex-data');

const glslify = require('glslify');
const vertexShader = glslify('../shaders/label-sdf.vert');
const fragmentShader = glslify('../shaders/label-sdf.frag');
const loadFont = require('./load');

const TWEEN = require('@tweenjs/tween.js');

const defaultTextScale = 1/64;

const defaults = require('lodash.defaults');

const __defaultParams = {
  width: 400,
  opacity: 1,
  color: 0xffffff,
  rotation: Math.PI,
  align: 'left'
};

let isReady = false;

function TextSDF(app, params) {
  THREE.Object3D.call(this);

  this.params = defaults(params, __defaultParams);

  loadFont({
    font: 'fnt/openSans.fnt',
    image: 'fnt/openSans.png'
  }, this.init.bind(this));
}

TextSDF.prototype = Object.create(THREE.Object3D.prototype);

TextSDF.prototype.init = function(font, texture) {
  this.font = font;
  this.geometry = createTextGeometry({
    align: this.params.align,
    font
  });
  this.color = this.params.color;
  this.material = new THREE.RawShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      animation: { type: 'f', value: 1 },
      bounds: { type: 'v4', value: new THREE.Vector4() },
      opacity: { type: 'f', value: this.params.opacity },
      map: { type: 't', value: texture },
      color: { type: 'c', value: new THREE.Color(this.color) }
    },
    side: THREE.DoubleSide,
    transparent: true,
  });
  this.mesh = new THREE.Mesh(this.geometry, this.material);
  isReady = true;
};

TextSDF.prototype.setText = function (list) {
  this.text = list;
  if(isReady){
    this.listPending = '';
  }else{
    this.listPending = list;
    return;
  }
  if (!Array.isArray(list)) list = [ list ];
  const chunks = list.map(x => {
    if (typeof x === 'string') {
      return { text: x };
    }
    return;
  });
  const str = chunks.map(x => x.text).join('');
  this.geometry.update({ text: str, font: this.font });

  const attribData = [];
  const tmpRgb = new THREE.Color(this.color);
  const visibleGlyphs = this.geometry.visibleGlyphs;
  visibleGlyphs.forEach(glyph => {
    const idx = getChunkIndex(chunks, glyph.index);
    if (idx === -1) throw new Error('Got chunks out of range');
    const chunk = chunks[idx];
    const chunkColor = this.color;
    tmpRgb.setStyle(chunkColor);
    const style = 0;
    var vertex = [ tmpRgb.r, tmpRgb.g, tmpRgb.b, style ];
    attribData.push(vertex, vertex, vertex, vertex);
  });
  buffer.attr(this.geometry, 'textStyle', attribData, 4);

  this.geometry.computeBoundingBox();
  this.setBounds(this.geometry.boundingBox);

  const layout = this.geometry.layout;
  const descenderScale = 0.2;
  if(this.params.align === 'center'){
    this.mesh.position.x = -layout.width/2;
  }
  this.mesh.position.y = layout.height / 2 - layout.descender * descenderScale;
  this.rotation.x = this.params.rotation;
  this.add(this.mesh);
};

function getChunkIndex (chunks, charIndex) {
  let attribIndex = 0;
  for (let i = 0; i < chunks.length; i++) {
    const attrib = chunks[i];
    const text = attrib.text;
    const length = text.length;
    if (charIndex >= attribIndex && charIndex < attribIndex + length) {
      return i;
    }
    attribIndex += length;
  }
  return -1;
}

TextSDF.prototype.setBounds = function (bounds) {
  this.material.uniforms.bounds.value.set(
    bounds.min.x, bounds.min.y, bounds.max.x, bounds.max.y
  );
}

TextSDF.prototype.setSize = function (size) {
    const scale = size * defaultTextScale;
    this.scale.set(scale, scale, scale);
};

TextSDF.prototype.setOpacity = function (value) {
  this.mesh.material.uniforms.opacity.value = value;
};

TextSDF.prototype.show = function(){
  if(!this.mesh){
    return;
  }
  let self = this;
  TWEEN.remove(this.tweenOpacity);
  this.tweenOpacity = new TWEEN.Tween({
    value:self.mesh.material.uniforms.opacity.value
  })
  .to({ value: this.params.opacity }, 500)
  .easing(TWEEN.Easing.Quadratic.Out)
  .onUpdate(function () {
    self.setOpacity(this.value);
  })
  .start();
}

TextSDF.prototype.hide = function(){
  if(!this.mesh){
    return;
  }
  let self = this;
  TWEEN.remove(this.tweenOpacity);
  this.tweenOpacity = new TWEEN.Tween({
    value:self.mesh.material.uniforms.opacity.value
  })
  .to({ value: 0 }, 500)
  .easing(TWEEN.Easing.Quadratic.Out)
  .onUpdate(function () {
    self.setOpacity(this.value);
  })
  .start();
}

module.exports = TextSDF;
