uniform float uThickness;
uniform float uRipples;
uniform float uAnimate;

varying vec2 vUv;

void main() {
	float circle = distance(vUv, vec2(.5));
    circle -= mod(uAnimate, 1.);

    float totalRipples = uRipples * 2.;
    float ripples = mod(circle * (totalRipples), 1.);
    ripples = smoothstep(uThickness, uThickness + .02, ripples);

    // vec4 color = vec4(circle);
    vec4 color = vec4(ripples);

    gl_FragColor = color;
}