uniform float uThickness;
uniform float uRipples;
uniform float uAnimate;
uniform vec3 uColor;

varying vec2 vUv;

void main() {
	float circle = distance(vUv, vec2(.5));
    circle -= mod(uAnimate, 1.);
    float square1 = step(0.495, max(abs(vUv.x - 0.5), abs(vUv.y - 0.5)));

    float totalRipples = uRipples * 2.;
    float ripples = mod(circle * (totalRipples), 1.);
    ripples = smoothstep(uThickness, uThickness + .02, ripples);

    // vec4 color = vec4(circle);
    // vec4 color = vec4(square1,square1,square1, 0.5);
    vec3 color = uColor * ripples;

    gl_FragColor = vec4(color, ripples);
}