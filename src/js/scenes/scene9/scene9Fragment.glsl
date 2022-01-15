uniform vec2 uSize;
uniform float uRipples;
uniform float uRipplesAccel;
uniform float uRipplesExpansion;

uniform sampler2D tMap1;
uniform sampler2D tMap2;
uniform sampler2D tLevel;
uniform float uMixer;
uniform float uProgress;

uniform float uAnimate;

varying vec2 vUv;

#pragma glslify: animateLevels = require('../../shaders/modules/levelmask.glsl')
#pragma glslify: rangeF = require('../../shaders/modules/rangeF.glsl')


void main() {
    ////// Ripples
    float ratio = uSize.x / uSize.y;
    vec2 squaredUv = vec2(
        vUv.x,
        vUv.y / ratio
    );

    vec2 squaredCenter = vec2(
        .5,
        .025 / ratio
    );

    float rippleMotion = uMixer * uRipplesAccel;
    float rippleScale = rangeF(uMixer, 0., 1., 1., 1. - uRipplesExpansion);
    float totalRipples = uRipples * rippleScale;

    float circle = distance( squaredUv, squaredCenter );
    float ripples = abs( sin((circle * totalRipples) - rippleMotion) );

    float blackGradient = uMixer * 1.25 - distance( squaredUv, squaredCenter ) * .5;
    ripples = clamp(ripples - blackGradient, 0., 1.);

    float whiteGradient = distance( squaredUv, squaredCenter ) * 3.;
    whiteGradient = clamp(whiteGradient * (1. - uMixer), 0., 1.);
    ripples = clamp(ripples + whiteGradient, 0., 1.);
    


    //////// Image mixer
    float strength = uMixer * uProgress;
	vec4 tex1 = texture2D(tMap1, vUv);
	vec4 tex2 = texture2D(tMap2, vUv);
    // float maskProgression = animateLevels(texture2D(tLevel, vUv).g, uProgress);
    // float maskProgression = animateLevels(texture2D(tLevel, vUv).g, strength);
    float maskProgression = animateLevels(ripples, strength);


    // vec3 color = vec3(ripples);
    vec3 color = mix(tex1.rgb, tex2.rgb, maskProgression);

    
    gl_FragColor = vec4(color, 1.);
}