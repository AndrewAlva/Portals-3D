uniform sampler2D tMap1;
uniform sampler2D tMap2;
uniform sampler2D tLevel;
uniform float uMixer;
uniform float uProgress;

uniform float uAnimate;

varying vec2 vUv;

#pragma glslify: animateLevels = require('../../shaders/modules/levelmask.glsl')


void main() {
    float strength = uMixer * uProgress;
	vec4 tex1 = texture2D(tMap1, vUv);
	vec4 tex2 = texture2D(tMap2, vUv);
    // float maskProgression = animateLevels(texture2D(tLevel, vUv).g, uProgress);
    float maskProgression = animateLevels(texture2D(tLevel, vUv).g, strength);

    vec3 color = mix(tex1.rgb, tex2.rgb, maskProgression);
    gl_FragColor = vec4(color, 1.);
}