uniform float uThickness;
uniform float uRipples;
uniform float uAnimate;

varying vec2 vUv;

void main() {
	float circle = distance(vUv, vec2(.5));
    circle -= mod(uAnimate, 1.);
    float square1 = step(0.495, max(abs(vUv.x - 0.5), abs(vUv.y - 0.5)));

    float totalRipples = uRipples * 2.;
    float ripples = mod(circle * (totalRipples), 1.);
    ripples = smoothstep(uThickness, uThickness + .005, ripples);

    vec4 color = vec4(ripples);

    gl_FragColor = color;
}