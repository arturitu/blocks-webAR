#extension GL_OES_standard_derivatives : enable
precision highp float;

#pragma glslify: aastep = require('glsl-aastep')
#pragma glslify: skewClip = require('./skew-rect-clip.glsl');

uniform float opacity;
uniform vec3 color;
uniform sampler2D map;
uniform float animation;
varying vec2 vUv;
varying vec2 fullTextCoords;

void main() {
  vec4 texColor = texture2D(map, vUv);

  float alpha = aastep(0.5, texColor.a);

  alpha *= skewClip(fullTextCoords, animation);
  gl_FragColor = vec4(color.rgb, opacity * alpha);
  if (gl_FragColor.a < 0.0001) discard;
}
