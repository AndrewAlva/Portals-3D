uniform float uDepth;
uniform float uRadialBloom;
uniform float uAnimate;
uniform vec3 uColor;

varying vec2 vUv;
varying float vNoise;
varying float vMask;

#pragma glslify: rangeF = require('../../shaders/modules/rangeF.glsl')

void main() {
    // vec4 color = vec4(vec3(vNoise * .5 + .5), 1.);
    float mappedNoise = rangeF(vNoise, -1., 1., 0., 1.);
    // float mappedNoise = abs(vNoise);

    vec4 color = vec4(vec3(mappedNoise), 1.);
    color.rgb = vec3(1.) - color.rgb;
    // vec4 color = vec4(vec3(vNoise), 1.);

    vec4 maskColor = vec4(vec3(vMask), 1.);

    gl_FragColor = vec4(maskColor * color);


        // /* Chaotic ripples */
        // float circle = distance(vUv, vec2(.5));
        // circle -= mod(uAnimate * 0.01, 1.);
        // float totalRipples = uDepth * 10.;
        // float ripples = mod(circle * (totalRipples), 1.);
        // ripples = smoothstep(uRadialBloom, uRadialBloom + .2, ripples);

        // vec4 radialBlendColor = mix(color, maskColor, vMask);

        // gl_FragColor = vec4(vec3(radialBlendColor*ripples), 1.);
}