uniform vec3 uColor;
uniform vec2 uSize;
uniform vec2 uHover;
uniform float uStrength;

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
    
    vec2 squaredHover = vec2(
        uHover.x,
        uHover.y / ratio
    );

    //////// Ripples
    float rippleScale = uSignal * 100.;

    float circle = distance( squaredUv, squaredHover );
    float ripples = abs( sin( (circle * rippleScale) + uAnimate) );
    float blackGradient = uSignal * .75 - distance( squaredUv, squaredHover ) * .5;
    ripples = clamp(ripples - blackGradient, 0., 1.);


    vec3 color = uColor * ripples;
    float alpha = uProgress * ripples;

    
    gl_FragColor = vec4(color, alpha);
}