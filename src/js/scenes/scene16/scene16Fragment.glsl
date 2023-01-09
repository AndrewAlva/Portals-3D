uniform vec2 uSize;

uniform float uProgress;
uniform float uSignal;
uniform float uGuitarHigh;
uniform float uGuitarMid;
uniform float uGuitarLow;

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

    // rings
    float ring1 = 1. - abs(circle * 4. - (uGuitarHigh));
    ring1 = step((0.99 - (((1. - uSignal) * uGuitarHigh) * 0.1)), ring1);
    
    float ring2 = 1. - abs(circle * 5. - (uGuitarMid));
    ring2 = step((0.99 - (((1. - uSignal) * uGuitarMid) * 0.1)), ring2);
    
    float ring3 = 1. - abs(circle * 8. - (uGuitarLow));
    ring3 = step((0.99 - (((1. - uSignal) * uGuitarLow) * 0.1)), ring3);


    vec3 color = vec3(ring1, ring2, ring3);
    vec3 color2 = vec3(ring1 * .5, ring1 * .2, ring1) + vec3(ring2 * .5, ring2 * .2, ring2) + vec3(ring3 * .5, ring3 * .2, ring3);
    vec3 color3 = vec3(ring1) + vec3(ring2) + vec3(ring3);
    float alpha = uProgress;


    gl_FragColor = vec4(color, alpha);
    // gl_FragColor = vec4(color2, alpha);
    // gl_FragColor = vec4(color3, alpha);
}