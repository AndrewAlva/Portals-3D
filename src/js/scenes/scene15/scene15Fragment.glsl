uniform vec2 uSize;

uniform float uProgress;
uniform float uSignal;

uniform float uAnimate;

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

    //////// Line
    float line = 1. - (abs(vUv.x - .5) * 2.);
    color += line;


    // vertex test
    color = vec3( abs(sin((vUv.y + uAnimate * 0.01) * 50.)) * 1. );


    gl_FragColor = vec4(color, alpha);
}