precision highp float;
attribute vec4 position;
attribute vec2 uv;
attribute vec4 textStyle;

varying vec2 vUv;
varying vec2 fullTextCoords;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform vec4 bounds;

void main() {
  float fU = (position.x - bounds.x) / (bounds.z - bounds.x);
  float fV = (position.y - bounds.y) / (bounds.w - bounds.y);

  vUv = uv;
  fullTextCoords = vec2(1.0 - fU, fV);
  gl_Position = projectionMatrix *
                modelViewMatrix *
                position;
}
