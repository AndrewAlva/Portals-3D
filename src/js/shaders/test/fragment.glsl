uniform float uRadius;
uniform float uAlpha;

varying vec2 vUv;

void main() {
	float ring = 1. - step(0.05, abs(distance( vUv, vec2(.5) ) - uRadius));
    float linearGradient = vUv.y;
    float maskedRing = linearGradient * ring;
    
    float alpha = abs(maskedRing * uAlpha);
    vec4 color = vec4( vec3(maskedRing), alpha);

    gl_FragColor = color;
}