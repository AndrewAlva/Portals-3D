uniform vec2 uSize;

uniform float uProgress;
uniform float uSignal;

uniform float uAnimate;
uniform sampler2D tMap;

varying vec2 vUv;

#pragma glslify: rangeF = require('../../shaders/modules/rangeF.glsl')


void main() {
    float ratio = uSize.x / uSize.y;
    vec2 squaredUv = vec2(
        vUv.x,
        vUv.y / ratio
    );

    vec2 squaredCenter = vec2(
        .5,
        .5 / ratio
    );

    //////// Ripples
    float rippleScale = uSignal * 100.;

    float circle = distance( squaredUv, squaredCenter );
    float ripples = abs( sin( (circle * rippleScale) + uAnimate) );
    float blackGradient = uSignal * .75 - distance( squaredUv, squaredCenter ) * .5;
    ripples = clamp(ripples - blackGradient, 0., 1.);


    vec3 color = vec3(ripples);
    float alpha = uProgress;

    vec4 texture = texture2D(tMap, vUv);


    // gl_FragColor = vec4(color, alpha);
    gl_FragColor = texture;
}