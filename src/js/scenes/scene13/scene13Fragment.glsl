uniform sampler2D tMap1;
uniform sampler2D tMap2;
uniform float uAnimate;

varying vec2 vUv;


void main() {
    vec4 texture1 = texture2D(tMap1, vUv);
    vec4 texture2 = texture2D(tMap2, vUv);

    float transition = step(0.5, sin(vUv.y * 9. + uAnimate) * .03 + vUv.x);

    vec4 finalColor = mix(texture1, texture2, transition);

    gl_FragColor = finalColor;
}