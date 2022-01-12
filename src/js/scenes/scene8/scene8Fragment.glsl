uniform sampler2D tMap1;
uniform sampler2D tMap2;
uniform float uMixer;

uniform float uAnimate;

varying vec2 vUv;

void main() {
	vec4 tex1 = texture2D(tMap1, vUv);
	vec4 tex2 = texture2D(tMap2, vUv);

    vec3 color = mix(tex1.rgb, tex2.rgb, uMixer);

    gl_FragColor = vec4(color, 1.);
}