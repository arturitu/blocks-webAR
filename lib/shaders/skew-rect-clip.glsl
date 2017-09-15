#pragma glslify: aastep = require('glsl-aastep')

float skewClip (vec2 vUv, float animate) {
  float smooth = min(1.0, smoothstep(0.5, 0.0, abs(animate - 0.5)));
  float steepness = 0.05;
  float angle = (vUv.y) * steepness * smooth;
  float xOff = vUv.x + angle;
  return aastep(1.0 - animate, xOff);
}

#pragma glslify: export(skewClip)